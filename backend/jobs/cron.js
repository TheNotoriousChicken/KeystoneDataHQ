const cron = require('node-cron');
const prisma = require('../db');
const { syncCompanyMetrics } = require('../services/syncEngine');

// ---------------------------------------------------------------------------
// Scheduled Sync: Runs every 6 hours
// Cron expression: At minute 0, every 6th hour → 0 */6 * * *
// Syncs all companies that have at least one integration connected.
// ---------------------------------------------------------------------------
const syncJob = cron.schedule('0 */6 * * *', async () => {
    const startTime = Date.now();
    console.log('');
    console.log('⏰ ═══════════════════════════════════════════════════');
    console.log('⏰  CRON JOB STARTED: Scheduled sync for all companies');
    console.log('⏰ ═══════════════════════════════════════════════════');

    try {
        // Find companies with at least one integration connected
        const companies = await prisma.company.findMany({
            where: {
                OR: [
                    { shopifyToken: { not: null } },
                    { metaAccessToken: { not: null } },
                ],
            },
            select: { id: true, name: true },
        });

        console.log(`   Found ${companies.length} compan${companies.length === 1 ? 'y' : 'ies'} with active integrations.`);

        if (companies.length === 0) {
            console.log('   Nothing to sync. Job complete.');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const company of companies) {
            try {
                console.log(`   🔄 Syncing: ${company.name} (${company.id})`);
                await syncCompanyMetrics(company.id);
                successCount++;
            } catch (err) {
                failCount++;
                console.error(`   ❌ Failed to sync ${company.name}: ${err.message}`);
            }
        }

        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('');
        console.log(`⏰  CRON JOB COMPLETE: ${successCount} synced, ${failCount} failed (${elapsed}s)`);
        console.log('⏰ ═══════════════════════════════════════════════════');
        console.log('');
    } catch (err) {
        console.error('⏰  CRON JOB ERROR:', err.message);
    }
});

// ---------------------------------------------------------------------------
// Scheduled Digest: Runs every Monday at 8:00 AM
// Cron expression: At minute 0, hour 8, on day 1 (Monday) → 0 8 * * 1
// Sends weekly performance summary emails to all company Admins.
// ---------------------------------------------------------------------------
const { sendWeeklyDigestEmail, sendAnomalyAlertEmail } = require('../utils/email');
const { notifyAdmins } = require('../utils/notificationService');

const weeklyDigestJob = cron.schedule('0 8 * * 1', async () => {
    console.log('');
    console.log('📧 ═══════════════════════════════════════════════════');
    console.log('📧  CRON JOB STARTED: Weekly Email Digests');
    console.log('📧 ═══════════════════════════════════════════════════');

    try {
        // Find companies with at least one synced MetricCache in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const fourteenDaysAgo = new Date();
        fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

        const companies = await prisma.company.findMany({
            where: {
                metricCaches: {
                    some: { date: { gte: sevenDaysAgo } }
                }
            },
            include: {
                users: {
                    where: { role: 'ADMIN' },
                    select: { email: true, firstName: true }
                }
            }
        });

        if (companies.length === 0) {
            console.log('   No active companies found for weekly digest.');
            return;
        }

        for (const company of companies) {
            if (company.users.length === 0) continue;

            // Get last 14 days of data to calculate WoW growth
            const cache = await prisma.metricCache.findMany({
                where: {
                    companyId: company.id,
                    date: { gte: fourteenDaysAgo }
                },
                orderBy: { date: 'asc' }
            });

            // Split into This Week and Last Week
            const thisWeek = cache.filter(c => new Date(c.date) >= sevenDaysAgo);
            const lastWeek = cache.filter(c => new Date(c.date) < sevenDaysAgo);

            const sum = (arr, key) => arr.reduce((acc, obj) => acc + (obj[key] || 0), 0);

            const metrics = {
                revenue: sum(thisWeek, 'totalRevenue'),
                prevRevenue: sum(lastWeek, 'totalRevenue'),
                spend: sum(thisWeek, 'adSpend'),
                prevSpend: sum(lastWeek, 'adSpend'),
            };

            // Calculate Blended ROAS
            metrics.roas = metrics.spend > 0 ? (metrics.revenue / metrics.spend) : 0;

            console.log(`   ✉️  Sending digest for ${company.name} (${metrics.revenue} rev) to ${company.users.length} admins.`);

            // Dispatch to all admins in the company
            for (const admin of company.users) {
                try {
                    await sendWeeklyDigestEmail(admin.email, admin.firstName, metrics);
                } catch (err) {
                    console.error(`   ❌ Failed to send digest to ${admin.email}:`, err.message);
                }
            }
        }

        console.log('');
        console.log(`📧  CRON JOB COMPLETE: Weekly Digests`);
        console.log('📧 ═══════════════════════════════════════════════════');
        console.log('');
    } catch (err) {
        console.error('📧  CRON JOB ERROR:', err.message);
    }
});

// ---------------------------------------------------------------------------
// Scheduled Anomaly Detection: Runs daily at 9:00 AM
// Cron expression: At minute 0, hour 9 → 0 9 * * *
// Checks if ROAS drops >25% or Spend spikes >50% compared to 7-day moving avg.
// ---------------------------------------------------------------------------
const anomalyJob = cron.schedule('0 9 * * *', async () => {
    console.log('');
    console.log('🚨 ═══════════════════════════════════════════════════');
    console.log('🚨  CRON JOB STARTED: Anomaly Detection');
    console.log('🚨 ═══════════════════════════════════════════════════');

    try {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const eightDaysAgo = new Date();
        eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
        eightDaysAgo.setHours(0, 0, 0, 0);

        const companies = await prisma.company.findMany({
            where: {
                metricCaches: { some: { date: { gte: eightDaysAgo } } }
            },
            include: {
                metricCaches: {
                    where: { date: { gte: eightDaysAgo } },
                    orderBy: { date: 'desc' },
                },
                users: {
                    where: { role: 'ADMIN' },
                    select: { email: true, firstName: true }
                }
            }
        });

        for (const company of companies) {
            const cache = company.metricCaches;
            if (cache.length < 2) continue;

            const yesterdayData = cache.find(c => c.date.getTime() >= yesterday.getTime() && c.date.getTime() < yesterday.getTime() + 86400000);
            if (!yesterdayData) continue;

            const previousDays = cache.filter(c => c.id !== yesterdayData.id);
            if (previousDays.length === 0) continue;

            let totalRev = 0, totalSpend = 0;
            for (const day of previousDays) {
                totalRev += day.totalRevenue || 0;
                totalSpend += day.adSpend || 0;
            }

            const avgSpend = totalSpend / previousDays.length;
            const avgRoas = totalSpend > 0 ? totalRev / totalSpend : 0;

            const yesterdaySpend = yesterdayData.adSpend || 0;
            const yesterdayRoas = yesterdayData.adSpend > 0 ? (yesterdayData.totalRevenue || 0) / yesterdayData.adSpend : 0;

            let roasDrop = 0;
            let spendSpike = 0;

            if (avgRoas > 0 && yesterdayRoas < avgRoas) {
                roasDrop = ((avgRoas - yesterdayRoas) / avgRoas) * 100;
            }

            if (avgSpend > 0 && yesterdaySpend > avgSpend) {
                spendSpike = ((yesterdaySpend - avgSpend) / avgSpend) * 100;
            }

            if (roasDrop > 25 || spendSpike > 50) {
                console.log(`   🚨 Anomaly for ${company.name}: ROAS Drop = ${roasDrop.toFixed(1)}%, Spend Spike = ${spendSpike.toFixed(1)}%`);

                const title = 'Performance Anomaly Detected';
                let message = 'We detected unusual metric activity yesterday:';
                if (roasDrop > 25) message += ` ROAS dropped by ${roasDrop.toFixed(1)}%.`;
                if (spendSpike > 50) message += ` Ad spend spiked by ${spendSpike.toFixed(1)}%.`;

                await notifyAdmins({
                    companyId: company.id,
                    title,
                    message,
                    type: 'ERROR',
                    link: '/dashboard/reports'
                });

                for (const admin of company.users) {
                    await sendAnomalyAlertEmail(
                        admin.email,
                        admin.firstName,
                        company.name,
                        roasDrop > 25 ? roasDrop.toFixed(1) : null,
                        spendSpike > 50 ? spendSpike.toFixed(1) : null
                    );
                }
            }
        }

        console.log('');
        console.log('🚨  CRON JOB COMPLETE: Anomaly Detection');
        console.log('🚨 ═══════════════════════════════════════════════════');
        console.log('');
    } catch (err) {
        console.error('🚨  CRON JOB ERROR:', err.message);
    }
});

console.log('⏰ Cron schedulers initialized → Data Sync (6h), Weekly Digest (Mon 8AM), Anomaly (Daily 9AM)');

module.exports = { syncJob, weeklyDigestJob, anomalyJob };
