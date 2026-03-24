// auth/profile.js — Get/update profile, change password, avatar upload
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../../db');
const { sendVerificationEmail } = require('../../utils/email');
const { logActivity } = require('../../utils/auditLogger');
const { notifyUser } = require('../../utils/notificationService');
const validate = require('../../middleware/validate');
const authMiddleware = require('../../middleware/authMiddleware');
const { profileUpdateSchema } = require('../../validations/auth.validation');

const SALT_ROUNDS = 10;

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { company: true } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        return res.json({
            id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
            role: user.role, avatarUrl: user.avatarUrl, emailVerified: user.emailVerified, createdAt: user.createdAt,
            company: { id: user.company.id, name: user.company.name, subscriptionTier: user.company.subscriptionTier, onboardingCompleted: user.company.onboardingCompleted, logoUrl: user.company.logoUrl },
        });
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/auth/profile
router.put('/profile', authMiddleware, validate(profileUpdateSchema), async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;
        const currentUser = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!currentUser) return res.status(404).json({ error: 'User not found.' });

        const emailChanged = email !== currentUser.email;
        if (emailChanged) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) return res.status(400).json({ error: 'That email is already in use.' });
        }

        const updateData = { firstName, lastName, email };
        if (emailChanged) {
            updateData.emailVerified = false;
            updateData.emailVerifyToken = crypto.randomBytes(32).toString('hex');
        }

        const updatedUser = await prisma.user.update({ where: { id: req.user.userId }, data: updateData, include: { company: true } });

        if (emailChanged) {
            sendVerificationEmail(updatedUser.email, updatedUser.firstName, updatedUser.emailVerifyToken).catch(err => console.error('Verification email failed:', err));
        }

        await logActivity({ action: 'PROFILE_UPDATED', companyId: updatedUser.companyId, userId: updatedUser.id, details: emailChanged ? 'Updated name and email' : 'Updated profile details', req });
        await notifyUser({ userId: updatedUser.id, title: 'Profile Updated', message: 'Your profile details have been successfully saved.', type: 'INFO', link: '/dashboard/profile' });

        return res.json({
            message: emailChanged ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully.',
            emailChanged,
            user: {
                id: updatedUser.id, email: updatedUser.email, firstName: updatedUser.firstName, lastName: updatedUser.lastName,
                role: updatedUser.role, emailVerified: updatedUser.emailVerified,
                company: { id: updatedUser.company.id, name: updatedUser.company.name, subscriptionTier: updatedUser.company.subscriptionTier, onboardingCompleted: updatedUser.company.onboardingCompleted },
            },
        });
    } catch (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// PUT /api/auth/change-password
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both currentPassword and newPassword are required.' });
        if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        if (currentPassword === newPassword) return res.status(400).json({ error: 'New password must be different from the current one.' });

        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        if (!user) return res.status(404).json({ error: 'User not found.' });

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) return res.status(401).json({ error: 'Current password is incorrect.' });

        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } });

        await logActivity({ action: 'PASSWORD_CHANGED', companyId: user.companyId, userId: user.id, req });
        await notifyUser({ userId: user.id, title: 'Password Changed', message: 'Your account password was just updated.', type: 'SUCCESS', link: '/dashboard/profile' });

        return res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
