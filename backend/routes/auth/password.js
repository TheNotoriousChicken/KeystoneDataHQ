// auth/password.js — Forgot password + reset password
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const prisma = require('../../db');
const { sendPasswordResetEmail } = require('../../utils/email');
const { logActivity } = require('../../utils/auditLogger');
const { notifyUser } = require('../../utils/notificationService');
const validate = require('../../middleware/validate');
const { forgotPasswordSchema, resetPasswordSchema } = require('../../validations/auth.validation');

const SALT_ROUNDS = 10;

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.passwordReset.updateMany({ where: { userId: user.id, used: false }, data: { used: true } });
        await prisma.passwordReset.create({ data: { token, expiresAt, userId: user.id } });
        await sendPasswordResetEmail(email, token);
        await logActivity({ action: 'PASSWORD_RESET_REQUESTED', companyId: user.companyId, userId: user.id, req });

        return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// POST /api/auth/reset-password
router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
    try {
        const { token, password } = req.body;
        const resetRecord = await prisma.passwordReset.findUnique({ where: { token }, include: { user: true } });

        if (!resetRecord || resetRecord.used) return res.status(400).json({ error: 'This reset link is invalid or has already been used.' });
        if (new Date() > resetRecord.expiresAt) return res.status(400).json({ error: 'This reset link has expired.' });

        const newPasswordHash = await bcrypt.hash(password, SALT_ROUNDS);
        await prisma.$transaction([
            prisma.user.update({ where: { id: resetRecord.userId }, data: { passwordHash: newPasswordHash } }),
            prisma.passwordReset.update({ where: { id: resetRecord.id }, data: { used: true } }),
        ]);

        await logActivity({ action: 'PASSWORD_RESET_COMPLETED', companyId: resetRecord.user.companyId, userId: resetRecord.userId, req });
        await notifyUser({ userId: resetRecord.userId, title: 'Password Reset', message: 'Your password was successfully reset.', type: 'SUCCESS' });

        return res.json({ message: 'Password has been reset successfully. You can now sign in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
