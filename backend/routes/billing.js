const express = require('express');
const { Paddle, Environment } = require('@paddle/paddle-node-sdk');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const router = express.Router();
const prisma = new PrismaClient();

// Initialize the Paddle SDK
const paddle = new Paddle(process.env.PADDLE_API_KEY, {
    environment: process.env.PADDLE_ENVIRONMENT === 'sandbox'
        ? Environment.sandbox
        : Environment.production,
});

const PRICE_MAP = {
    STARTER: process.env.PADDLE_PRICE_STARTER,
    GROWTH: process.env.PADDLE_PRICE_GROWTH,
};

// ---------------------------------------------------------------------------
// POST /api/billing/checkout  (Admin Only)
// Creates a Paddle Transaction (inline checkout URL) for the authenticated user.
// ---------------------------------------------------------------------------
router.post('/checkout', authMiddleware, requireRole('ADMIN'), async (req, res) => {
    try {
        const { tier } = req.body;

        if (!tier || !PRICE_MAP[tier]) {
            return res.status(400).json({ error: 'Invalid tier. Must be STARTER or GROWTH.' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { company: true },
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const paymentLink = await paddle.paymentLinks.create({
            items: [
                {
                    priceId: PRICE_MAP[tier],
                    quantity: 1,
                },
            ],
            customData: {
                company_id: user.companyId,
                tier: tier,
            }
        });

        const checkoutUrl = paymentLink?.url;
        if (!checkoutUrl) {
            return res.status(500).json({ error: 'No checkout URL returned from Paddle.' });
        }

        return res.json({ checkoutUrl });
    } catch (err) {
        console.error('Paddle checkout error:', err);
        return res.status(500).json({ error: 'Failed to create checkout session.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/billing/status  (Protected)
// Returns the current subscription status for the user's company.
// ---------------------------------------------------------------------------
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const company = await prisma.company.findUnique({
            where: { id: req.user.companyId },
            select: {
                id: true,
                name: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                lemonSqueezyCustomerId: true,
                lemonSqueezySubscriptionId: true,
            },
        });

        if (!company) {
            return res.status(404).json({ error: 'Company not found.' });
        }

        return res.json({ subscription: company });
    } catch (err) {
        console.error('Billing status error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;

