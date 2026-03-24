// auth/login.js — Login, 2FA verify, refresh, logout
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const prisma = require('../../db');
const { isFounderEmail } = require('../../utils/founderGuard');
const { generateRefreshToken, verifyRefreshToken } = require('../../utils/refreshToken');
const { createAuthService } = require('../../services/authService');
const { logActivity } = require('../../utils/auditLogger');
const validate = require('../../middleware/validate');
const { loginSchema } = require('../../validations/auth.validation');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';
const authService = createAuthService(prisma);

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;
        const loginResult = await authService.loginUser({ email, password, req });

        if (loginResult?.requiresTwoFactor) {
            return res.json({ requiresTwoFactor: true, method: loginResult.method, tempToken: loginResult.tempToken, message: 'Two-factor authentication required.' });
        }
        if (loginResult?.token) {
            if (loginResult.refreshToken) {
                const isProd = process.env.NODE_ENV === 'production';
                res.cookie('refreshToken', loginResult.refreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax' });
            }
            return res.json({ token: loginResult.token, user: loginResult.user });
        }
        return res.status(401).json({ error: loginResult?.error || 'Authentication failed.' });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(401).json({ error: err.message || 'Invalid credentials.' });
    }
});

// POST /api/auth/login/verify — 2FA code verification
router.post('/login/verify', async (req, res) => {
    try {
        const { tempToken, code } = req.body;
        if (!tempToken || !code) return res.status(400).json({ error: 'Token and 6-digit code are required.' });

        let decoded;
        try { decoded = jwt.verify(tempToken, process.env.JWT_SECRET); }
        catch (err) { return res.status(401).json({ error: 'Session expired. Please log in again.' }); }
        if (!decoded.is2FAPending) return res.status(400).json({ error: 'Invalid token type.' });

        const user = await prisma.user.findUnique({ where: { id: decoded.userId }, include: { company: true } });
        if (!user || !user.twoFactorEnabled) return res.status(400).json({ error: 'Two-factor authentication is not enabled for this account.' });

        // Verify APP (TOTP)
        if (user.twoFactorMethod === 'APP') {
            if (!user.twoFactorSecret) return res.status(500).json({ error: 'Server configuration error.' });
            const isValid = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: code, window: 1 });
            if (!isValid) return res.status(401).json({ error: 'Invalid authenticator code.' });
        }
        // Verify EMAIL (OTP)
        else if (user.twoFactorMethod === 'EMAIL') {
            if (!user.emailAuthCode || !user.emailAuthCodeExpires) return res.status(400).json({ error: 'No email code requested. Try logging in again.' });
            if (user.emailAuthCodeExpires < new Date()) return res.status(401).json({ error: 'Code expired. Please log in again.' });
            const isValid = await bcrypt.compare(code, user.emailAuthCode);
            if (!isValid) return res.status(401).json({ error: 'Invalid email code.' });
            await prisma.user.update({ where: { id: user.id }, data: { emailAuthCode: null, emailAuthCodeExpires: null } });
        } else {
            return res.status(500).json({ error: 'Unknown 2FA method.' });
        }

        // Issue real JWT
        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
        const isFounder = isFounderEmail(user.email);
        const token = jwt.sign({ userId: user.id, companyId: user.companyId, role: user.role, isSuperAdmin: user.isSuperAdmin || isFounder }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        const refreshToken = generateRefreshToken({ userId: user.id, companyId: user.companyId, role: user.role, isSuperAdmin: user.isSuperAdmin || isFounder });

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax' });

        await logActivity({ action: 'USER_LOGIN', companyId: user.companyId, userId: user.id, details: `Logged in via 2FA (${user.twoFactorMethod})`, req });

        return res.json({
            token,
            user: {
                id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
                role: user.role, isSuperAdmin: user.isSuperAdmin || isFounder, twoFactorEnabled: user.twoFactorEnabled,
                company: { id: user.company.id, name: user.company.name, subscriptionTier: user.company.subscriptionTier, onboardingCompleted: user.company.onboardingCompleted },
            },
        });
    } catch (err) {
        console.error('2FA verification error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
    try {
        const cookieHeader = req.headers.cookie || '';
        const m = /refreshToken=([^;]+)/.exec(cookieHeader);
        const oldToken = m?.[1];
        if (!oldToken) return res.status(401).json({ error: 'Not authenticated' });

        const payload = verifyRefreshToken(oldToken);
        if (!payload) return res.status(401).json({ error: 'Invalid refresh token' });

        const token = jwt.sign({ userId: payload.userId, companyId: payload.companyId, role: payload.role, isSuperAdmin: payload.isSuperAdmin }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
        const newRefreshToken = generateRefreshToken({ userId: payload.userId, companyId: payload.companyId, role: payload.role, isSuperAdmin: payload.isSuperAdmin });

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: isProd, sameSite: 'lax' });

        const user = await prisma.user.findUnique({ where: { id: payload.userId }, include: { company: true } });
        if (!user) return res.status(401).json({ error: 'User not found' });

        res.json({
            token,
            user: {
                id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
                role: user.role, isSuperAdmin: user.isSuperAdmin || payload.isSuperAdmin, emailVerified: user.emailVerified,
                company: { id: user.company.id, name: user.company.name, subscriptionTier: user.company.subscriptionTier, onboardingCompleted: user.company.onboardingCompleted },
            },
        });
    } catch (err) {
        console.error('Refresh error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Logged out' });
});

module.exports = router;
