const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const SALT_ROUNDS = 12;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// ---------------------------------------------------------------------------
// GET /api/settings
// Returns the current user's profile + their company details.
// ---------------------------------------------------------------------------
router.get('/', authMiddleware, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                createdAt: true,
                company: {
                    select: {
                        id: true,
                        name: true,
                        subscriptionTier: true,
                        subscriptionStatus: true,
                        createdAt: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        return res.json({ user });
    } catch (err) {
        console.error('Settings GET error:', err);
        return res.status(500).json({ error: 'Failed to load settings.' });
    }
});

// ---------------------------------------------------------------------------
// PUT /api/settings/profile
// Update user name and/or password.
// ---------------------------------------------------------------------------
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const { firstName, lastName, currentPassword, newPassword } = req.body;

        if (!firstName && !lastName && !newPassword) {
            return res.status(400).json({ error: 'No changes provided.' });
        }

        const updateData = {};

        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;

        // Password change requires current password verification
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ error: 'Current password is required to set a new password.' });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({ error: 'New password must be at least 8 characters.' });
            }

            const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
            const valid = await bcrypt.compare(currentPassword, user.passwordHash);

            if (!valid) {
                return res.status(401).json({ error: 'Current password is incorrect.' });
            }

            updateData.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        }

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            },
        });

        return res.json({ message: 'Profile updated successfully.', user: updatedUser });
    } catch (err) {
        console.error('Settings profile update error:', err);
        return res.status(500).json({ error: 'Failed to update profile.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/settings/upload-avatar
// Uploads a user avatar image.
// ---------------------------------------------------------------------------
router.post('/upload-avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const avatarUrl = `/uploads/${req.file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { id: req.user.userId },
            data: { avatarUrl },
            select: { id: true, avatarUrl: true }
        });

        return res.json({ message: 'Avatar updated successfully', avatarUrl: updatedUser.avatarUrl });
    } catch (err) {
        console.error('Avatar upload error:', err);
        return res.status(500).json({ error: err.message || 'Failed to upload avatar.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/settings/upload-logo
// Uploads a company logo image.
// ---------------------------------------------------------------------------
router.post('/upload-logo', authMiddleware, upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const logoUrl = `/uploads/${req.file.filename}`;

        const updatedCompany = await prisma.company.update({
            where: { id: req.user.companyId },
            data: { logoUrl },
            select: { id: true, logoUrl: true }
        });

        return res.json({ message: 'Logo updated successfully', logoUrl: updatedCompany.logoUrl });
    } catch (err) {
        console.error('Logo upload error:', err);
        return res.status(500).json({ error: err.message || 'Failed to upload logo.' });
    }
});

// ---------------------------------------------------------------------------
// PUT /api/settings/company
// Update company name (ADMIN only).
// ---------------------------------------------------------------------------
router.put('/company', authMiddleware, async (req, res) => {
    try {
        const { companyName } = req.body;

        if (!companyName) {
            return res.status(400).json({ error: 'Company name is required.' });
        }

        // Only admins can change company settings
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can update company settings.' });
        }

        const updatedCompany = await prisma.company.update({
            where: { id: req.user.companyId },
            data: { name: companyName },
            select: {
                id: true,
                name: true,
                subscriptionTier: true,
                subscriptionStatus: true,
            },
        });

        return res.json({ message: 'Company updated successfully.', company: updatedCompany });
    } catch (err) {
        console.error('Settings company update error:', err);
        return res.status(500).json({ error: 'Failed to update company.' });
    }
});

module.exports = router;
