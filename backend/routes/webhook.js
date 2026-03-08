const express = require('express');
const { Paddle, Environment } = require('@paddle/paddle-node-sdk');
const prisma = require('../db');
const { notifyAdmins } = require('../utils/notificationService');

const router = express.Router();

// Initialize Paddle SDK
const paddle = new Paddle(process.env.PADDLE_API_KEY, {
    environment: process.env.PADDLE_ENVIRONMENT === 'sandbox'
        ? Environment.sandbox
        : Environment.production,
});

// ---------------------------------------------------------------------------
// POST /api/billing/webhook
// Completely public. Verified via Paddle SDK's built-in unmarshal.
// Mounted BEFORE express.json() in server.js to preserve the raw body.
// ---------------------------------------------------------------------------
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const signature = req.headers['paddle-signature'] || '';
    const rawBody = req.body.toString('utf8');

    try {
        // unmarshal is async — MUST be awaited
        const eventData = await paddle.webhooks.unmarshal(rawBody, process.env.PADDLE_WEBHOOK_SECRET, signature);

        console.log(`✅ Paddle webhook verified: ${eventData.eventType}`);

        const data = eventData.data;
        // Paddle SDK usually uses camelCase, but we'll check both just in case
        const customData = data?.customData || data?.custom_data;

        if (!customData?.company_id) {
            console.log(`ℹ️  Event "${eventData.eventType}" - No company_id found. Available keys in data:`, Object.keys(data || {}));
            if (data?.customData) console.log(`   - customData keys:`, Object.keys(data.customData));
            if (data?.custom_data) console.log(`   - custom_data keys:`, Object.keys(data.custom_data));
        }

        if (customData?.company_id) {
            const companyId = customData.company_id;

            // -----------------------------------------------------
            // Route Subscription Events
            // -----------------------------------------------------
            switch (eventData.eventType) {

                // --- ACTIVATED or UPDATED ---
                case 'subscription.activated':
                case 'subscription.updated': {
                    const status = data?.status;
                    const tierFromCustom = customData?.tier;

                    let tier = 'NONE';
                    if (tierFromCustom === 'STARTER') tier = 'STARTER';
                    if (tierFromCustom === 'GROWTH') tier = 'GROWTH';

                    await prisma.company.update({
                        where: { id: companyId },
                        data: {
                            subscriptionTier: tier,
                            subscriptionStatus: status === 'active' ? 'active' : status,
                            paddleCustomerId: String(data?.customerId || ''),
                            paddleSubscriptionId: String(data?.id || ''),
                        },
                    });

                    console.log(`💰 Company ${companyId} → Tier: ${tier} / Status: ${status}`);

                    // Only notify if it's explicitly active (avoid spam on billing cycle updates unless state changed)
                    if (status === 'active') {
                        await notifyAdmins({
                            companyId,
                            title: 'Subscription Active',
                            message: `Your company's subscription is now active on the ${tier} plan.`,
                            type: 'SUCCESS',
                            link: '/dashboard/billing'
                        });
                    }
                    break;
                }

                // --- CANCELED ---
                case 'subscription.canceled': {
                    await prisma.company.update({
                        where: { id: companyId },
                        data: {
                            subscriptionTier: 'NONE',
                            subscriptionStatus: 'canceled'
                        },
                    });

                    console.log(`📉 Company ${companyId} → Subscription Canceled`);

                    await notifyAdmins({
                        companyId,
                        title: 'Subscription Canceled',
                        message: `Your company's subscription has been canceled. Your features are currently restricted.`,
                        type: 'WARNING',
                        link: '/dashboard/billing'
                    });

                    // Note: In Phase 20 we restricted 2FA to GROWTH.
                    // A real app might want to auto-disable 2FA here or force a logout.
                    // For now, disabling the tier naturally restricts access in the frontend.
                    break;
                }

                // --- PAST DUE ---
                case 'subscription.past_due': {
                    await prisma.company.update({
                        where: { id: companyId },
                        data: {
                            subscriptionStatus: 'past_due'
                        },
                    });

                    console.log(`⚠️ Company ${companyId} → Payment Past Due`);

                    await notifyAdmins({
                        companyId,
                        title: 'Payment Failed',
                        message: `We couldn't process your latest payment. Please update your billing details to avoid service interruption.`,
                        type: 'ERROR',
                        link: '/dashboard/billing'
                    });
                    break;
                }

                default:
                    console.log(`ℹ️  Event "${eventData.eventType}" acknowledged, no DB update needed.`);
                    break;
            }
        } else {
            console.log(`ℹ️  Event "${eventData.eventType}" has no company_id — skipping.`);
        }

        return res.status(200).send('OK');
    } catch (error) {
        console.error('❌ Webhook verification failed:', error.message);
        return res.status(400).send('Webhook verification failed');
    }
});

module.exports = router;
