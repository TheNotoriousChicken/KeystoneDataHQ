const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
    const email = 'tejas@keystonedatahq.com';
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        const company = await prisma.company.create({
            data: {
                name: 'Keystone Data HQ',
                subscriptionTier: 'GROWTH',
                subscriptionStatus: 'active'
            }
        });

        const passwordHash = await bcrypt.hash('Founder2026!', 10);
        user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName: 'Tejas',
                lastName: 'Founder',
                role: 'ADMIN',
                isSuperAdmin: true,
                companyId: company.id
            }
        });
        console.log(`✅ Created Super Admin user: ${email} with password: Founder2026!`);
    } else {
        console.log(`User ${email} already exists.`);
    }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
