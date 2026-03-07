const { PrismaClient } = require('@prisma/client');
const { syncCompanyMetrics } = require('./services/syncEngine');
const prisma = new PrismaClient();

async function testSyncErrors() {
    console.log('--- Starting Sync Error Handling Test ---');
    try {
        // 1. Create a temporary company with dummy bad credentials
        const company = await prisma.company.create({
            data: {
                name: 'Sync Error Test Co',
                shopifyShopName: 'definitely-not-real-store-123.myshopify.com',
                shopifyToken: 'shpat_badtoken123',
                metaAdAccountId: 'act_000000000',
                metaAccessToken: 'EAABadTokenXYZ'
            }
        });

        // Add a temporary admin user to receive the notification
        const admin = await prisma.user.create({
            data: {
                email: `admin_${Date.now()}@synctest.com`,
                passwordHash: 'hashed123',
                firstName: 'Test',
                lastName: 'Admin',
                role: 'ADMIN',
                companyId: company.id
            }
        });

        console.log(`✅ Created test company (${company.id}) and admin user`);

        // 2. Run the sync engine (it should fail validating both APIs)
        console.log('🔄 Running sync engine...');
        await syncCompanyMetrics(company.id);

        // 3. Verify the tokens were cleared
        const updatedCompany = await prisma.company.findUnique({ where: { id: company.id } });
        console.log('Shopify Token Cleared?', updatedCompany.shopifyToken === null ? '✅ Yes' : '❌ No');
        console.log('Meta Token Cleared?', updatedCompany.metaAccessToken === null ? '✅ Yes' : '❌ No');

        // 4. Verify notifications were sent to the admin
        const notifications = await prisma.notification.findMany({ where: { userId: admin.id } });
        console.log(`📬 Found ${notifications.length} notifications:`);
        notifications.forEach(n => console.log(`   - [${n.type}] ${n.title}: ${n.message}`));

        // 5. Verify audit logs
        const logs = await prisma.auditLog.findMany({ where: { companyId: company.id, action: 'INTEGRATION_ERROR' } });
        console.log(`📝 Found ${logs.length} error audit logs`);

        // Cleanup
        await prisma.company.delete({ where: { id: company.id } });
        console.log('🧹 Cleaned up test data');

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

testSyncErrors();
