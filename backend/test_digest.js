require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { sendWeeklyDigestEmail } = require('./utils/email');

async function testWeeklyDigest() {
    console.log('--- 🧪 TESTING WEEKLY DIGEST ---');

    // MOCK DATA for the email
    const metrics = {
        revenue: 45250.00,
        prevRevenue: 38000.00,
        spend: 12000.00,
        prevSpend: 13500.00,
    };
    metrics.roas = metrics.revenue / metrics.spend;

    const testAdmin = {
        email: 'admin@keystonedata.com',
        firstName: 'Test Admin'
    };

    console.log(`Sending to ${testAdmin.email}...`);

    try {
        await sendWeeklyDigestEmail(testAdmin.email, testAdmin.firstName, metrics);
        console.log('✅ Success! Check the inbox (or Resend dashboard).');
    } catch (err) {
        console.error('❌ Failed:', err);
    }
}

testWeeklyDigest().finally(() => prisma.$disconnect());
