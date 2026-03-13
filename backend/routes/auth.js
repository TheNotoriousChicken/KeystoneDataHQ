const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const prisma = require('../db');
const { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeEmail, sendTwoFactorEmail } = require('../utils/email');
const { logActivity } = require('../utils/auditLogger');
const { notifyUser, notifyAdmins } = require('../utils/notificationService');
const validate = require('../middleware/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, profileUpdateSchema } = require('../validations/auth.validation');

const router = express.Router();

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
router.post('/register', validate(registerSchema), async (req, res) => {
    try {
        const { email, password, firstName, lastName, companyName, inviteToken } = req.body;

        // --- Check for existing user ---
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // --- Hash password ---
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        let result;

        if (inviteToken) {
            // ─── Invited Registration: join existing company ───
            const invite = await prisma.teamInvite.findUnique({ where: { token: inviteToken } });

            if (!invite || invite.status !== 'PENDING') {
                return res.status(400).json({ error: 'Invalid or expired invite token.' });
            }

            result = await prisma.$transaction(async (tx) => {
                const verifyToken = crypto.randomBytes(32).toString('hex');
                const user = await tx.user.create({
                    data: {
                        email,
                        passwordHash,
                        firstName,
                        lastName,
                        role: 'VIEWER',
                        companyId: invite.companyId,
                        emailVerifyToken: verifyToken,
                    },
                });

                // Mark invite as accepted
                await tx.teamInvite.update({
                    where: { id: invite.id },
                    data: { status: 'ACCEPTED' },
                });

                const company = await tx.company.findUnique({ where: { id: invite.companyId } });

                return { company, user };
            });

            console.log(`👥 Invited user ${email} joined company ${result.company.name}`);
        } else {
            // ─── Standard Registration: create new company ───
            result = await prisma.$transaction(async (tx) => {
                const company = await tx.company.create({
                    data: { name: companyName },
                });

                const verifyToken = crypto.randomBytes(32).toString('hex');
                const user = await tx.user.create({
                    data: {
                        email,
                        passwordHash,
                        firstName,
                        lastName,
                        role: 'ADMIN',
                        companyId: company.id,
                        emailVerifyToken: verifyToken,
                    },
                });

                return { company, user };
            });
        }

        // --- Sign JWT ---
        const token = jwt.sign(
            {
                userId: result.user.id,
                companyId: result.company.id,
                role: result.user.role,
                isSuperAdmin: result.user.isSuperAdmin,
            },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // --- Send Verification Email (non-blocking) ---
        sendVerificationEmail(result.user.email, result.user.firstName, result.user.emailVerifyToken).catch(err => {
            console.error('Verification email failed (non-blocking):', err);
        });

        // --- Audit Log ---
        await logActivity({
            action: 'USER_REGISTERED',
            companyId: result.company.id,
            userId: result.user.id,
            details: inviteToken ? 'Joined via team invite' : 'Created new company account',
            req
        });

        if (inviteToken) {
            await notifyAdmins({
                companyId: result.company.id,
                title: 'New Team Member',
                message: `${result.user.firstName} ${result.user.lastName} has joined the workspace.`,
                type: 'SUCCESS',
                link: '/dashboard/team'
            });
        }

        // --- Response (never expose password hash) ---
        return res.status(201).json({
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                role: result.user.role,
                emailVerified: false,
                company: {
                    id: result.company.id,
                    name: result.company.name,
                    subscriptionTier: result.company.subscriptionTier,
                    onboardingCompleted: result.company.onboardingCompleted,
                },
            },
        });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/auth/validate-invite/:token
// Lets the frontend pre-check an invite token and show the company name.
// ---------------------------------------------------------------------------
router.get('/validate-invite/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const invite = await prisma.teamInvite.findUnique({
            where: { token },
            include: { company: { select: { name: true } } },
        });

        if (!invite || invite.status !== 'PENDING') {
            return res.status(404).json({ valid: false, error: 'Invalid or expired invite.' });
        }

        return res.json({
            valid: true,
            email: invite.email,
            companyName: invite.company.name,
        });
    } catch (err) {
        console.error('Validate invite error:', err);
        return res.status(500).json({ valid: false, error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------------------
router.post('/login', validate(loginSchema), async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- Find user (include company info) ---
        const user = await prisma.user.findUnique({
            where: { email },
            include: { company: true },
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // --- Verify password ---
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // --- Check email verification ---
        if (!user.emailVerified) {
            return res.status(403).json({
                error: 'Please verify your email before signing in.',
                emailNotVerified: true,
                email: user.email,
            });
        }

        // --- Check if 2FA is required ---
        if (user.twoFactorEnabled) {
            // Generate a temporary 10-minute token just for 2FA verification
            const tempToken = jwt.sign(
                {
                    userId: user.id,
                    companyId: user.companyId,
                    role: user.role,
                    is2FAPending: true
                },
                process.env.JWT_SECRET,
                { expiresIn: '10m' }
            );

            // If their method is EMAIL, send the code now
            if (user.twoFactorMethod === 'EMAIL') {
                const code = crypto.randomInt(100000, 999999).toString();
                const hashedCode = await bcrypt.hash(code, SALT_ROUNDS);
                const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        emailAuthCode: hashedCode,
                        emailAuthCodeExpires: expires
                    }
                });

                sendTwoFactorEmail(user.email, code).catch(err => console.error('Failed to send 2FA email', err));
            }

            return res.json({
                requiresTwoFactor: true,
                method: user.twoFactorMethod,
                tempToken,
                message: 'Two-factor authentication required.'
            });
        }

        // --- Standard Login (No 2FA) ---
        // Founder Guard: Ensure specific email always has super admin access
        const isFounder = user.email.toLowerCase() === 'tejas@keystonedatahq.com';

        const token = jwt.sign(
            {
                userId: user.id,
                companyId: user.companyId,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin || isFounder,
            },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        // --- Audit Log ---
        await logActivity({
            action: 'USER_LOGIN',
            companyId: user.companyId,
            userId: user.id,
            req
        });

        // --- Response ---
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin || isFounder,
                emailVerified: user.emailVerified,
                company: {
                    id: user.company.id,
                    name: user.company.name,
                    subscriptionTier: user.company.subscriptionTier,
                    onboardingCompleted: user.company.onboardingCompleted,
                },
            },
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/login/verify
// Verifies the 6-digit code for 2FA required logins.
// ---------------------------------------------------------------------------
router.post('/login/verify', async (req, res) => {
    try {
        const { tempToken, code } = req.body;

        if (!tempToken || !code) {
            return res.status(400).json({ error: 'Token and 6-digit code are required.' });
        }

        // Verify the temporary token
        let decoded;
        try {
            decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ error: 'Session expired. Please log in again.' });
        }

        if (!decoded.is2FAPending) {
            return res.status(400).json({ error: 'Invalid token type.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { company: true }
        });

        if (!user || !user.twoFactorEnabled) {
            return res.status(400).json({ error: 'Two-factor authentication is not enabled for this account.' });
        }

        // --- Verify App (TOTP) ---
        if (user.twoFactorMethod === 'APP') {
            if (!user.twoFactorSecret) return res.status(500).json({ error: 'Server configuration error (missing secret).' });

            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: code,
                window: 1 // Allow 30 seconds drift back/forward
            });

            if (!isValid) {
                return res.status(401).json({ error: 'Invalid authenticator code.' });
            }
        }
        // --- Verify Email (OTP) ---
        else if (user.twoFactorMethod === 'EMAIL') {
            if (!user.emailAuthCode || !user.emailAuthCodeExpires) {
                return res.status(400).json({ error: 'No email code requested or expired. Try logging in again.' });
            }

            if (user.emailAuthCodeExpires < new Date()) {
                return res.status(401).json({ error: 'Code expired. Please log in again to receive a new code.' });
            }

            const isValid = await bcrypt.compare(code, user.emailAuthCode);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid email code.' });
            }

            // Clear the used email code
            await prisma.user.update({
                where: { id: user.id },
                data: { emailAuthCode: null, emailAuthCodeExpires: null }
            });
        } else {
            return res.status(500).json({ error: 'Unknown 2FA method.' });
        }

        // --- Success: Issue real JWT ---
        // Founder Guard: Ensure specific email always has super admin access
        const isFounder = user.email.toLowerCase() === 'tejas@keystonedatahq.com';

        const token = jwt.sign(
            {
                userId: user.id,
                companyId: user.companyId,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin || isFounder,
            },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        await logActivity({
            action: 'USER_LOGIN',
            companyId: user.companyId,
            userId: user.id,
            details: `Logged in via 2FA (${user.twoFactorMethod})`,
            req
        });

        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin || isFounder,
                twoFactorEnabled: user.twoFactorEnabled,
                company: {
                    id: user.company.id,
                    name: user.company.name,
                    subscriptionTier: user.company.subscriptionTier,
                    onboardingCompleted: user.company.onboardingCompleted,
                },
            },
        });

    } catch (err) {
        console.error('2FA verification error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/forgot-password
// Generates a reset token (valid for 1 hour) and logs the link.
// In production, you'd email this link instead.
// ---------------------------------------------------------------------------
router.post('/forgot-password', validate(forgotPasswordSchema), async (req, res) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent email enumeration attacks
        if (!user) {
            return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
        }

        // Generate a secure random token
        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        // Invalidate any existing unused tokens for this user
        await prisma.passwordReset.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });

        // Create a new reset token
        await prisma.passwordReset.create({
            data: {
                token,
                expiresAt,
                userId: user.id,
            },
        });

        // Send the reset email
        await sendPasswordResetEmail(email, token);

        await logActivity({
            action: 'PASSWORD_RESET_REQUESTED',
            companyId: user.companyId,
            userId: user.id,
            req
        });

        return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/reset-password
// Validates the token and sets a new password.
// ---------------------------------------------------------------------------
router.post('/reset-password', validate(resetPasswordSchema), async (req, res) => {
    try {
        const { token, password } = req.body;

        // Find the reset record
        const resetRecord = await prisma.passwordReset.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetRecord || resetRecord.used) {
            return res.status(400).json({ error: 'This reset link is invalid or has already been used.' });
        }

        if (new Date() > resetRecord.expiresAt) {
            return res.status(400).json({ error: 'This reset link has expired. Please request a new one.' });
        }

        // Hash the new password and update the user
        const newPasswordHash = await bcrypt.hash(password, SALT_ROUNDS);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetRecord.userId },
                data: { passwordHash: newPasswordHash },
            }),
            prisma.passwordReset.update({
                where: { id: resetRecord.id },
                data: { used: true },
            }),
        ]);

        console.log(`✅ Password reset completed for ${resetRecord.user.email}`);

        await logActivity({
            action: 'PASSWORD_RESET_COMPLETED',
            companyId: resetRecord.user.companyId,
            userId: resetRecord.userId,
            req
        });

        await notifyUser({
            userId: resetRecord.userId,
            title: 'Password Reset',
            message: 'Your password was successfully reset.',
            type: 'SUCCESS'
        });

        return res.json({ message: 'Password has been reset successfully. You can now sign in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/verify-email
// Validates the token and marks the user as verified.
// ---------------------------------------------------------------------------
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required.' });
        }

        const user = await prisma.user.findUnique({
            where: { emailVerifyToken: token },
            include: { company: true },
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification link.' });
        }

        if (user.emailVerified) {
            return res.json({ message: 'Email is already verified.' });
        }

        // Mark as verified and clear the token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifyToken: null,
            },
        });

        // Send welcome email now that they're verified (non-blocking)
        sendWelcomeEmail(user.email, user.firstName).catch(err => {
            console.error('Welcome email failed (non-blocking):', err);
        });

        console.log(`✅ Email verified for ${user.email}`);

        await logActivity({
            action: 'EMAIL_VERIFIED',
            companyId: user.companyId,
            userId: user.id,
            req
        });

        await notifyUser({
            userId: user.id,
            title: 'Welcome to Keystone Data HQ',
            message: 'Your email has been verified and your account is ready.',
            type: 'SUCCESS'
        });

        // Auto-login: Sign JWT so they can go straight to dashboard
        const jwtToken = jwt.sign(
            {
                userId: user.id,
                companyId: user.companyId,
                role: user.role,
                isSuperAdmin: user.isSuperAdmin,
            },
            process.env.JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        return res.json({
            message: 'Email verified successfully!',
            token: jwtToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                emailVerified: true,
                company: {
                    id: user.company.id,
                    name: user.company.name,
                    subscriptionTier: user.company.subscriptionTier,
                    onboardingCompleted: user.company.onboardingCompleted,
                },
            },
        });
    } catch (err) {
        console.error('Verify email error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/resend-verification
// Resends the verification email for an unverified user.
// ---------------------------------------------------------------------------
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required.' });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Always return success to prevent email enumeration
        if (!user || user.emailVerified) {
            return res.json({ message: 'If the account exists and is unverified, a new verification email has been sent.' });
        }

        // Generate a new token
        const newToken = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerifyToken: newToken },
        });

        // Send verification email
        await sendVerificationEmail(user.email, user.firstName, newToken);

        return res.json({ message: 'If the account exists and is unverified, a new verification email has been sent.' });
    } catch (err) {
        console.error('Resend verification error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/auth/profile  (Protected)
// Returns the authenticated user's profile details.
// ---------------------------------------------------------------------------
const authMiddleware = require('../middleware/authMiddleware');

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { company: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            company: {
                id: user.company.id,
                name: user.company.name,
                subscriptionTier: user.company.subscriptionTier,
                onboardingCompleted: user.company.onboardingCompleted,
                logoUrl: user.company.logoUrl,
            },
        });
    } catch (err) {
        console.error('Get profile error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// PUT /api/auth/profile  (Protected)
// Updates the authenticated user's profile (name, email).
// If the email changes, mark as unverified and send a new verification email.
// ---------------------------------------------------------------------------
router.put('/profile', authMiddleware, validate(profileUpdateSchema), async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        const currentUser = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Check if email is changing
        const emailChanged = email !== currentUser.email;

        // If email is changing, check it's not taken
        if (emailChanged) {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: 'That email is already in use.' });
            }
        }

        // Build update data
        const updateData = { firstName, lastName, email };

        if (emailChanged) {
            const verifyToken = crypto.randomBytes(32).toString('hex');
            updateData.emailVerified = false;
            updateData.emailVerifyToken = verifyToken;
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData,
            include: { company: true },
        });

        // If email changed, send verification to the new email
        if (emailChanged) {
            sendVerificationEmail(updatedUser.email, updatedUser.firstName, updatedUser.emailVerifyToken).catch(err => {
                console.error('Verification email failed (non-blocking):', err);
            });
        }

        await logActivity({
            action: 'PROFILE_UPDATED',
            companyId: updatedUser.companyId,
            userId: updatedUser.id,
            details: emailChanged ? 'Updated name and email' : 'Updated profile details',
            req
        });

        await notifyUser({
            userId: updatedUser.id,
            title: 'Profile Updated',
            message: 'Your profile details have been successfully saved.',
            type: 'INFO',
            link: '/dashboard/profile'
        });

        return res.json({
            message: emailChanged
                ? 'Profile updated. Please verify your new email address.'
                : 'Profile updated successfully.',
            emailChanged,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                role: updatedUser.role,
                emailVerified: updatedUser.emailVerified,
                company: {
                    id: updatedUser.company.id,
                    name: updatedUser.company.name,
                    subscriptionTier: updatedUser.company.subscriptionTier,
                    onboardingCompleted: updatedUser.company.onboardingCompleted,
                },
            },
        });
    } catch (err) {
        console.error('Update profile error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// PUT /api/auth/change-password  (Protected)
// Changes the user's password. Requires the current password for verification.
// ---------------------------------------------------------------------------
router.put('/change-password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Both currentPassword and newPassword are required.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters.' });
        }

        if (currentPassword === newPassword) {
            return res.status(400).json({ error: 'New password must be different from the current one.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect.' });
        }

        // Hash and save new password
        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
        });

        console.log(`🔒 Password changed for ${user.email}`);

        await logActivity({
            action: 'PASSWORD_CHANGED',
            companyId: user.companyId,
            userId: user.id,
            req
        });

        await notifyUser({
            userId: user.id,
            title: 'Password Changed',
            message: 'Your account password was just updated.',
            type: 'SUCCESS',
            link: '/dashboard/profile'
        });

        return res.json({ message: 'Password changed successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/auth/2fa/status  (Protected)
// Checks if the user's company is eligible for 2FA (GROWTH tier).
// ---------------------------------------------------------------------------
router.get('/2fa/status', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { company: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.json({
            isEligible: user.company.subscriptionTier === 'GROWTH',
            isEnabled: user.twoFactorEnabled,
            method: user.twoFactorMethod
        });
    } catch (err) {
        console.error('2FA status error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/2fa/setup  (Protected)
// Initiates 2FA setup by generating a TOTP secret or sending an Email OTP.
// ---------------------------------------------------------------------------
router.post('/2fa/setup', authMiddleware, async (req, res) => {
    try {
        const { method } = req.body; // 'APP' or 'EMAIL'

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { company: true }
        });

        if (!user || user.company.subscriptionTier !== 'GROWTH') {
            return res.status(403).json({ error: '2FA is only available on the Growth tier.' });
        }

        if (user.twoFactorEnabled) {
            return res.status(400).json({ error: '2FA is already enabled.' });
        }

        if (method === 'APP') {
            const secret = speakeasy.generateSecret({
                name: `Keystone Data HQ (${user.email})`
            });

            // Temporarily store secret (unconfirmed)
            await prisma.user.update({
                where: { id: user.id },
                data: { twoFactorSecret: secret.base32 }
            });

            // Generate QR Code URL
            const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

            return res.json({ secret: secret.base32, qrCodeUrl });

        } else if (method === 'EMAIL') {
            const code = crypto.randomInt(100000, 999999).toString();
            const hashedCode = await bcrypt.hash(code, SALT_ROUNDS);
            const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    emailAuthCode: hashedCode,
                    emailAuthCodeExpires: expires
                }
            });

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

// ---------------------------------------------------------------------------
// POST /api/auth/2fa/verify-setup  (Protected)
// Confirms 2FA setup by verifying the first code, formally enabling 2FA.
// ---------------------------------------------------------------------------
router.post('/2fa/verify-setup', authMiddleware, async (req, res) => {
    try {
        const { method, code } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        if (method === 'APP') {
            if (!user.twoFactorSecret) return res.status(400).json({ error: 'Setup not initiated.' });

            const isValid = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: code,
                window: 1
            });

            if (!isValid) return res.status(400).json({ error: 'Invalid authenticator code.' });

        } else if (method === 'EMAIL') {
            if (!user.emailAuthCode || !user.emailAuthCodeExpires || user.emailAuthCodeExpires < new Date()) {
                return res.status(400).json({ error: 'Code expired or not requested.' });
            }

            const isValid = await bcrypt.compare(code, user.emailAuthCode);
            if (!isValid) return res.status(400).json({ error: 'Invalid email code.' });

        } else {
            return res.status(400).json({ error: 'Invalid method.' });
        }

        // --- SUCCESS: Enable 2FA ---
        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorEnabled: true,
                twoFactorMethod: method,
                emailAuthCode: null, // clear temporary 
                emailAuthCodeExpires: null
            }
        });

        await logActivity({
            action: 'PROFILE_UPDATED',
            companyId: user.companyId,
            userId: user.id,
            details: `Enabled ${method} Two-Factor Authentication`,
            req
        });

        await notifyUser({
            userId: user.id,
            title: '2FA Enabled',
            message: `Two-factor authentication (${method}) was successfully enabled.`,
            type: 'SUCCESS'
        });

        return res.json({ message: 'Two-Factor Authentication successfully enabled!' });

    } catch (err) {
        console.error('2FA verify setup error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/2fa/disable  (Protected)
// Disables 2FA (requires current password).
// ---------------------------------------------------------------------------
router.post('/2fa/disable', authMiddleware, async (req, res) => {
    try {
        const { password } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) return res.status(401).json({ error: 'Incorrect password.' });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                twoFactorEnabled: false,
                twoFactorMethod: 'NONE',
                twoFactorSecret: null,
                emailAuthCode: null,
                emailAuthCodeExpires: null
            }
        });

        await logActivity({
            action: 'PROFILE_UPDATED',
            companyId: user.companyId,
            userId: user.id,
            details: `Disabled Two-Factor Authentication`,
            req
        });

        await notifyUser({
            userId: user.id,
            title: '2FA Disabled',
            message: 'Two-factor authentication has been disabled for your account.',
            type: 'WARNING'
        });

        return res.json({ message: 'Two-Factor Authentication has been disabled.' });

    } catch (err) {
        console.error('2FA disable error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/auth/onboarding/complete  (Protected)
// Marks the user's company onboarding process as completed.
// ---------------------------------------------------------------------------
router.post('/onboarding/complete', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { company: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        // Only ADMINs can complete onboarding for the company
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only administrators can complete the setup.' });
        }

        const updatedCompany = await prisma.company.update({
            where: { id: user.companyId },
            data: { onboardingCompleted: true }
        });

        await logActivity({
            action: 'COMPANY_UPDATED',
            companyId: user.companyId,
            userId: user.id,
            details: 'Completed initial onboarding setup',
            req
        });

        return res.json({
            message: 'Onboarding completed successfully',
            company: {
                id: updatedCompany.id,
                name: updatedCompany.name,
                subscriptionTier: updatedCompany.subscriptionTier,
                onboardingCompleted: updatedCompany.onboardingCompleted,
            }
        });
    } catch (err) {
        console.error('Complete onboarding error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
