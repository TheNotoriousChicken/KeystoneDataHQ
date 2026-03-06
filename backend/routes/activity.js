const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /api/activity  (Admin Only)
// Returns the audit log / activity trail for the caller's company.
// ---------------------------------------------------------------------------
router.get('/', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const limit = parseInt(req.query.limit) || 50;

        const activityLogs = await prisma.auditLog.findMany({
            where: { companyId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });

        return res.json({ activity: activityLogs });
    } catch (err) {
        console.error('Activity log error:', err);
        return res.status(500).json({ error: 'Failed to fetch activity log.' });
    }
});

module.exports = router;
