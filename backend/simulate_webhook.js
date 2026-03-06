require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Instead of hitting the actual webhook endpoint which requires a cryptographic signature
// from Paddle, we will directly simulate what the endpoint DOES once the signature is verified.
const { notifyAdmins } = require('./utils/notificationService');

async function simulateWebhook(eventType, status, tier) {
    console.log(`\n\n=== 🚀 SIMULATING WEBHOOK: ${eventType} ===`);

    // Grab our test company
    const user = await prisma.user.findUnique({
        where: { email: 'admin@keystonedata.com' },
        include: { company: true }
    });

    if (!user) {
        console.error('Test user admin@keystonedata.com not found. Run seed script first.');
        return;
    }

    const companyId = user.companyId;

    // --- PASTE CORE WEBHOOK LOGIC HERE FOR SIMULATION ---
    switch (eventType) {
        case 'subscription.activated':
        case 'subscription.updated': {
            await prisma.company.update({
                where: { id: companyId },
                data: {
                    subscriptionTier: tier,
                    subscriptionStatus: status === 'active' ? 'active' : status,
                    lemonSqueezyCustomerId: 'mock_cust_123',
                    lemonSqueezySubscriptionId: 'mock_sub_456',
                },
            });

            console.log(`💰 Company ${companyId} → Tier: ${tier} / Status: ${status}`);

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

        case 'subscription.canceled': {
            await prisma.company.update({
                where: { id: companyId },
                data: { subscriptionTier: 'NONE', subscriptionStatus: 'canceled' },
            });

            console.log(`📉 Company ${companyId} → Subscription Canceled`);

            await notifyAdmins({
                companyId,
                title: 'Subscription Canceled',
                message: `Your company's subscription has been canceled. Your features are currently restricted.`,
                type: 'WARNING',
                link: '/dashboard/billing'
            });
            break;
        }

        case 'subscription.past_due': {
            await prisma.company.update({
                where: { id: companyId },
                data: { subscriptionStatus: 'past_due' },
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
            console.log(`ℹ️  Event "${eventType}" acknowledged, no DB update needed.`);
            break;
    }

    // Verify DB State
    const updatedCompany = await prisma.company.findUnique({ where: { id: companyId } });
    console.log(`\n✅ DB Check -> Tier: ${updatedCompany.subscriptionTier} | Status: ${updatedCompany.subscriptionStatus}`);
}

async function runTests() {
    // 1. Upgrade to GROWTH
    await simulateWebhook('subscription.activated', 'active', 'GROWTH');

    // 2. Payment fails next month
    await simulateWebhook('subscription.past_due', 'past_due', 'GROWTH');

    // 3. User cancels
    await simulateWebhook('subscription.canceled', 'canceled', 'NONE');
}

runTests().finally(() => prisma.$disconnect());
