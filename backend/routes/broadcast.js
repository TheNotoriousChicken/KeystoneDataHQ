const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// GET /api/broadcast/active
// Returns the currently active global broadcast, if any.
// This route is PUBLIC so the frontend can check it on boot or freely.
// ---------------------------------------------------------------------------
router.get('/active', async (_req, res) => {
    try {
        const activeBroadcast = await prisma.broadcast.findFirst({
            where: {
                isActive: true,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.json({ broadcast: activeBroadcast });
    } catch (error) {
        console.error('Broadcast active fetch error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
