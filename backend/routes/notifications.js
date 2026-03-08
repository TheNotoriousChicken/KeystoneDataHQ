const express = require('express');
const prisma = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/notifications  (Protected)
// Returns all notifications for the authenticated user, newest first.
// ---------------------------------------------------------------------------
router.get('/', authMiddleware, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;

        const notifications = await prisma.notification.findMany({
            where: { userId: req.user.userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        const unreadCount = await prisma.notification.count({
            where: { userId: req.user.userId, read: false }
        });

        return res.json({ notifications, unreadCount });
    } catch (err) {
        console.error('Failed to fetch notifications:', err);
        return res.status(500).json({ error: 'Failed to fetch notifications.' });
    }
});

// ---------------------------------------------------------------------------
// PUT /api/notifications/:id/read  (Protected)
// Marks a specific notification as read.
// ---------------------------------------------------------------------------
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Ensure the notification belongs to this user
        const notification = await prisma.notification.findUnique({
            where: { id }
        });

        if (!notification || notification.userId !== req.user.userId) {
            return res.status(404).json({ error: 'Notification not found.' });
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { read: true }
        });

        return res.json({ notification: updated });
    } catch (err) {
        console.error('Failed to mark notification state:', err);
        return res.status(500).json({ error: 'Failed to update notification.' });
    }
});

// ---------------------------------------------------------------------------
// PUT /api/notifications/read-all  (Protected)
// Marks all of the user's unread notifications as read.
// ---------------------------------------------------------------------------
router.put('/read-all', authMiddleware, async (req, res) => {
    try {
        await prisma.notification.updateMany({
            where: {
                userId: req.user.userId,
                read: false
            },
            data: { read: true }
        });

        return res.json({ message: 'All notifications marked as read.' });
    } catch (err) {
        console.error('Failed to mark all notifications read:', err);
        return res.status(500).json({ error: 'Failed to update notifications.' });
    }
});

module.exports = router;
