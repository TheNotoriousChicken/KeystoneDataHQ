const prisma = require('./db');

async function makeSuperAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address.');
        console.error('Usage: node make_super_admin.js <user-email>');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { isSuperAdmin: true }
        });

        console.log(`✅ Success! User ${user.email} is now a Super Admin.`);
        console.log('You can now log in and see the Founder HQ item in the sidebar.');
    } catch (err) {
        if (err.code === 'P2025') {
            console.error(`❌ Error: User with email "${email}" not found in the database.`);
        } else {
            console.error(`❌ Failed to update user: ${err.message}`);
        }
    } finally {
        await prisma.$disconnect();
    }
}

makeSuperAdmin();
