const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDeltas() {
    console.log('--- Starting Delta Math Verification ---');
    try {
        // Need to find an active company
        const company = await prisma.company.findFirst();

        if (!company) {
            console.log('No active test company found.');
            return;
        }
        console.log(`Testing with company: ${company.name} (${company.id})`);

        // Seed some fake data for yesterday and 8 days ago to guarantee delta differences
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() - 7);
        start.setHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setHours(23, 59, 59, 999);

        // Current Period (Last 7 days)
        await prisma.metricCache.upsert({
            where: { companyId_date: { companyId: company.id, date: end } },
            update: { totalRevenue: 1500, adSpend: 500, totalOrders: 50 },
            create: { companyId: company.id, date: end, totalRevenue: 1500, adSpend: 500, totalOrders: 50 }
        });

        // Previous Period (8-14 days ago)
        const prevDate = new Date(start);
        prevDate.setDate(prevDate.getDate() - 1);
        await prisma.metricCache.upsert({
            where: { companyId_date: { companyId: company.id, date: prevDate } },
            update: { totalRevenue: 1000, adSpend: 250, totalOrders: 40 },
            create: { companyId: company.id, date: prevDate, totalRevenue: 1000, adSpend: 250, totalOrders: 40 }
        });

        // Now simulate the dashboard route logic natively
        // 1. Calculate duration
        const periodDuration = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - periodDuration);
        prevStart.setHours(0, 0, 0, 0);
        prevEnd.setHours(23, 59, 59, 999);

        // 3. Fetch history
        const history = await prisma.metricCache.findMany({
            where: { companyId: company.id, date: { gte: start, lte: end } }
        });
        const prevHistory = await prisma.metricCache.findMany({
            where: { companyId: company.id, date: { gte: prevStart, lte: prevEnd } }
        });

        // 4 & 5. Aggregate
        const currentTotals = history.reduce((acc, curr) => {
            acc.revenue += curr.totalRevenue || 0;
            return acc;
        }, { revenue: 0 });

        const prevTotals = prevHistory.reduce((acc, curr) => {
            acc.revenue += curr.totalRevenue || 0;
            return acc;
        }, { revenue: 0 });

        // 6. Calc
        const calcDelta = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const revenueDelta = calcDelta(currentTotals.revenue, prevTotals.revenue);

        console.log(`Current Period Revenue: $${currentTotals.revenue}`);
        console.log(`Previous Period Revenue: $${prevTotals.revenue}`);
        console.log(`Calculated Delta: ${revenueDelta > 0 ? '+' : ''}${revenueDelta.toFixed(1)}%`);

        // Expected: Current (1500+any others), Prev (1000+any others). Delta should be 50% if isolated.

    } catch (err) {
        console.error('Test failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

verifyDeltas();
