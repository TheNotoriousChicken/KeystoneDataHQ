// auth/register.js — Registration + invite validation + email verification + onboarding
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../../db');
const { sendVerificationEmail, sendWelcomeEmail } = require('../../utils/email');
const { logActivity } = require('../../utils/auditLogger');
const { notifyUser, notifyAdmins } = require('../../utils/notificationService');
const validate = require('../../middleware/validate');
const authMiddleware = require('../../middleware/authMiddleware');
const { registerSchema } = require('../../validations/auth.validation');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { email, password, firstName, lastName, companyName, inviteToken } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        let result;

        if (inviteToken) {
            const invite = await prisma.teamInvite.findUnique({ where: { token: inviteToken } });
            if (!invite || invite.status !== 'PENDING') {
                return res.status(400).json({ error: 'Invalid or expired invite token.' });
            }

            result = await prisma.$transaction(async (tx) => {
                const verifyToken = crypto.randomBytes(32).toString('hex');
                const user = await tx.user.create({
                    data: { email, passwordHash, firstName, lastName, role: 'VIEWER', companyId: invite.companyId, emailVerifyToken: verifyToken },
                });
                await tx.teamInvite.update({ where: { id: invite.id }, data: { status: 'ACCEPTED' } });
                const company = await tx.company.findUnique({ where: { id: invite.companyId } });
                return { company, user };
            });
        } else {
            result = await prisma.$transaction(async (tx) => {
                const company = await tx.company.create({ data: { name: companyName } });
                const verifyToken = crypto.randomBytes(32).toString('hex');
                const user = await tx.user.create({
                    data: { email, passwordHash, firstName, lastName, role: 'ADMIN', companyId: company.id, emailVerifyToken: verifyToken },
                });
                return { company, user };
            });
        }

        const token = jwt.sign(
            { userId: result.user.id, companyId: result.company.id, role: result.user.role, isSuperAdmin: result.user.isSuperAdmin },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        sendVerificationEmail(result.user.email, result.user.firstName, result.user.emailVerifyToken).catch(err => {
            console.error('Verification email failed (non-blocking):', err);
        });

        await logActivity({ action: 'USER_REGISTERED', companyId: result.company.id, userId: result.user.id, details: inviteToken ? 'Joined via team invite' : 'Created new company account', req });

        if (inviteToken) {
            await notifyAdmins({ companyId: result.company.id, title: 'New Team Member', message: `${result.user.firstName} ${result.user.lastName} has joined the workspace.`, type: 'SUCCESS', link: '/dashboard/team' });
        }

        return res.status(201).json({
            token,
            user: {
                id: result.user.id, email: result.user.email, firstName: result.user.firstName, lastName: result.user.lastName,
                role: result.user.role, emailVerified: false,
                company: { id: result.company.id, name: result.company.name, subscriptionTier: result.company.subscriptionTier, onboardingCompleted: result.company.onboardingCompleted },
            },
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// GET /api/auth/validate-invite/:token
router.get('/validate-invite/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const invite = await prisma.teamInvite.findUnique({ where: { token }, include: { company: { select: { name: true } } } });
        if (!invite || invite.status !== 'PENDING') {
            return res.status(404).json({ valid: false, error: 'Invalid or expired invite.' });
        }
        return res.json({ valid: true, email: invite.email, companyName: invite.company.name });
    } catch (err) {
        console.error('Validate invite error:', err);
        return res.status(500).json({ valid: false, error: 'Internal server error.' });
    }
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) return res.status(400).json({ error: 'Verification token is required.' });

        const user = await prisma.user.findUnique({ where: { emailVerifyToken: token }, include: { company: true } });
        if (!user) return res.status(400).json({ error: 'Invalid or expired verification link.' });
        if (user.emailVerified) return res.json({ message: 'Email is already verified.' });

        await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, emailVerifyToken: null } });
        sendWelcomeEmail(user.email, user.firstName).catch(err => console.error('Welcome email failed:', err));
        await logActivity({ action: 'EMAIL_VERIFIED', companyId: user.companyId, userId: user.id, req });
        await notifyUser({ userId: user.id, title: 'Welcome to Keystone Data HQ', message: 'Your email has been verified and your account is ready.', type: 'SUCCESS' });

        const jwtToken = jwt.sign({ userId: user.id, companyId: user.companyId, role: user.role, isSuperAdmin: user.isSuperAdmin }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

        return res.json({
            message: 'Email verified successfully!', token: jwtToken,
            user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, emailVerified: true,
                company: { id: user.company.id, name: user.company.name, subscriptionTier: user.company.subscriptionTier, onboardingCompleted: user.company.onboardingCompleted } },
        });
    } catch (err) {
        console.error('Verify email error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/auth/resend-verification
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required.' });
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || user.emailVerified) return res.json({ message: 'If the account exists and is unverified, a new verification email has been sent.' });
        const newToken = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({ where: { id: user.id }, data: { emailVerifyToken: newToken } });
        await sendVerificationEmail(user.email, user.firstName, newToken);
        return res.json({ message: 'If the account exists and is unverified, a new verification email has been sent.' });
    } catch (err) {
        console.error('Resend verification error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/auth/onboarding/complete
router.post('/onboarding/complete', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { company: true } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        if (user.role !== 'ADMIN') return res.status(403).json({ error: 'Only administrators can complete the setup.' });

        const updatedCompany = await prisma.company.update({ where: { id: user.companyId }, data: { onboardingCompleted: true } });
        await logActivity({ action: 'COMPANY_UPDATED', companyId: user.companyId, userId: user.id, details: 'Completed initial onboarding setup', req });

        return res.json({ message: 'Onboarding completed successfully', company: { id: updatedCompany.id, name: updatedCompany.name, subscriptionTier: updatedCompany.subscriptionTier, onboardingCompleted: updatedCompany.onboardingCompleted } });
    } catch (err) {
        console.error('Complete onboarding error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
