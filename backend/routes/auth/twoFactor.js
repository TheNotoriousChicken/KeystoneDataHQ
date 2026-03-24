// auth/twoFactor.js — 2FA status, setup, verify-setup, disable
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const prisma = require('../../db');
const { sendTwoFactorEmail } = require('../../utils/email');
const { logActivity } = require('../../utils/auditLogger');
const { notifyUser } = require('../../utils/notificationService');
const authMiddleware = require('../../middleware/authMiddleware');

const SALT_ROUNDS = 10;

// GET /api/auth/2fa/status
router.get('/2fa/status', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { company: true } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        return res.json({ isEligible: user.company.subscriptionTier === 'GROWTH', isEnabled: user.twoFactorEnabled, method: user.twoFactorMethod });
    } catch (err) {
        console.error('2FA status error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/auth/2fa/setup
router.post('/2fa/setup', authMiddleware, async (req, res) => {
    try {
        const { method } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { company: true } });
        if (!user || user.company.subscriptionTier !== 'GROWTH') return res.status(403).json({ error: '2FA is only available on the Growth tier.' });
        if (user.twoFactorEnabled) return res.status(400).json({ error: '2FA is already enabled.' });

        if (method === 'APP') {
            const secret = speakeasy.generateSecret({ name: `Keystone Data HQ (${user.email})` });
            await prisma.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret.base32 } });
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
            return res.json({ secret: secret.base32, qrCodeUrl });
        } else if (method === 'EMAIL') {
            const code = crypto.randomInt(100000, 999999).toString();
            const hashedCode = await bcrypt.hash(code, SALT_ROUNDS);
            const expires = new Date(Date.now() + 10 * 60 * 1000);
            await prisma.user.update({ where: { id: user.id }, data: { emailAuthCode: hashedCode, emailAuthCodeExpires: expires } });
            sendTwoFactorEmail(user.email, code).catch(err => console.error('Failed to send 2FA email', err));
            return res.json({ message: 'Verification code sent to your email.' });
        } else {
            return res.status(400).json({ error: 'Invalid 2FA method selected.' });
        }
    } catch (err) {
        console.error('2FA setup error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/auth/2fa/verify-setup
router.post('/2fa/verify-setup', authMiddleware, async (req, res) => {
    try {
        const { method, code } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        if (method === 'APP') {
            if (!user.twoFactorSecret) return res.status(400).json({ error: 'Setup not initiated.' });
            const isValid = speakeasy.totp.verify({ secret: user.twoFactorSecret, encoding: 'base32', token: code, window: 1 });
            if (!isValid) return res.status(400).json({ error: 'Invalid authenticator code.' });
        } else if (method === 'EMAIL') {
            if (!user.emailAuthCode || !user.emailAuthCodeExpires || user.emailAuthCodeExpires < new Date()) return res.status(400).json({ error: 'Code expired or not requested.' });
            const isValid = await bcrypt.compare(code, user.emailAuthCode);
            if (!isValid) return res.status(400).json({ error: 'Invalid email code.' });
        } else {
            return res.status(400).json({ error: 'Invalid method.' });
        }

        await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true, twoFactorMethod: method, emailAuthCode: null, emailAuthCodeExpires: null } });
        await logActivity({ action: 'PROFILE_UPDATED', companyId: user.companyId, userId: user.id, details: `Enabled ${method} Two-Factor Authentication`, req });
        await notifyUser({ userId: user.id, title: '2FA Enabled', message: `Two-factor authentication (${method}) was successfully enabled.`, type: 'SUCCESS' });

        return res.json({ message: 'Two-Factor Authentication successfully enabled!' });
    } catch (err) {
        console.error('2FA verify setup error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/auth/2fa/disable
router.post('/2fa/disable', authMiddleware, async (req, res) => {
    try {
        const { password } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) return res.status(401).json({ error: 'Incorrect password.' });

        await prisma.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false, twoFactorMethod: 'NONE', twoFactorSecret: null, emailAuthCode: null, emailAuthCodeExpires: null } });
        await logActivity({ action: 'PROFILE_UPDATED', companyId: user.companyId, userId: user.id, details: 'Disabled Two-Factor Authentication', req });
        await notifyUser({ userId: user.id, title: '2FA Disabled', message: 'Two-factor authentication has been disabled for your account.', type: 'WARNING' });

        return res.json({ message: 'Two-Factor Authentication has been disabled.' });
    } catch (err) {
        console.error('2FA disable error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
