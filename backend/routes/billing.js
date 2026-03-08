const prisma = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

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

        console.log(`[Billing] Creating checkout session for user ${req.user.userId}, tier: ${tier}`);

        const user = await prisma.user.findUnique({
            where: { id: req.user.userId },
            include: { company: true },
        });

        if (!user) {
            console.log(`[Billing] User ${req.user.userId} not found.`);
            return res.status(404).json({ error: 'User not found.' });
        }

        console.log(`[Billing] User found, creating transaction for price: ${PRICE_MAP[tier]}`);

        const transaction = await paddle.transactions.create({
            items: [
                {
                    priceId: PRICE_MAP[tier],
                    quantity: 1,
                },
            ],
            // We don't set checkout.url here because we want the Paddle-hosted version
            customData: {
                company_id: user.companyId,
                tier: tier,
            }
        });

        console.log(`[Billing] Transaction created: ${transaction.id}`);

        // Use the official Paddle-hosted checkout URL pattern for v3 (buy.paddle.com)
        const isSandbox = process.env.PADDLE_ENVIRONMENT === 'sandbox';
        const checkoutUrl = isSandbox
            ? `https://sandbox-buy.paddle.com/checkout/${transaction.id}`
            : `https://buy.paddle.com/checkout/${transaction.id}`;

        console.log(`[Billing] Generated checkout URL: ${checkoutUrl}`);

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

