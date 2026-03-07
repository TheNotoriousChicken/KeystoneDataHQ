const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    // Check if test user exists
    let user = await prisma.user.findUnique({
        where: { email: 'admin@keystonedata.com' }
    });

    if (!user) {
        // Create company
        const company = await prisma.company.create({
            data: {
                name: 'Test Enterprise',
                subscriptionTier: 'GROWTH',
                subscriptionStatus: 'active'
            }
        });

        const passwordHash = await bcrypt.hash('Test2026!', 10);
        user = await prisma.user.create({
            data: {
                email: 'admin@keystonedata.com',
                passwordHash,
                firstName: 'Admin',
                lastName: 'User',
                role: 'ADMIN',
                companyId: company.id
            }
        });
        console.log('Created new test user on GROWTH plan.');
    } else {
        // Ensure GROWTH tier and active
        await prisma.company.update({
            where: { id: user.companyId },
            data: { subscriptionTier: 'GROWTH', subscriptionStatus: 'active' }
        });
        // Reset password just in case
        const passwordHash = await bcrypt.hash('Test2026!', 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
        });
        console.log('Updated existing test user to GROWTH plan and reset password.');
    }

    console.log('Test user ready. Email: admin@keystonedata.com | Password: Test2026!');
}

main().finally(() => prisma.$disconnect());
