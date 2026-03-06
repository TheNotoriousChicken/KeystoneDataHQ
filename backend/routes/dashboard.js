const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/authMiddleware');
const { syncCompanyMetrics } = require('../services/syncEngine');

const router = express.Router();
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// POST /api/dashboard/sync  (Protected)
// Manually triggers a data sync for the user's company.
// Pulls fresh data from Shopify + Meta and updates MetricCache.
// ---------------------------------------------------------------------------
router.post('/sync', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        console.log(`🔄 Manual sync triggered for company ${companyId}`);

        const cached = await syncCompanyMetrics(companyId);

        return res.json({
            message: 'Sync completed successfully.',
            metrics: cached,
        });
    } catch (err) {
        console.error('Sync error:', err);
        return res.status(500).json({ error: 'Sync failed. ' + err.message });
    }
});

// ---------------------------------------------------------------------------
// GET /api/dashboard  (Protected)
// Returns the latest cached metrics and history for the user's company based on date.
// Accepts optional ?startDate=ISO & ?endDate=ISO query params.
// ---------------------------------------------------------------------------
router.get('/', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { startDate, endDate } = req.query;

        // Default: Last 30 Days if no dates provided
        let end = endDate ? new Date(endDate) : new Date();
        let start = startDate ? new Date(startDate) : new Date();
        if (!startDate) {
            start.setDate(start.getDate() - 30);
        }

        // Set hours to encompass full days
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        // Get the latest cached entry WITHIN the requested date range (for today's specific numbers)
        const latest = await prisma.metricCache.findFirst({
            where: {
                companyId,
                date: {
                    gte: start,
                    lte: end
                }
            },
            orderBy: { date: 'desc' },
        });

        // Get the historical data for the chart within the date range
        const history = await prisma.metricCache.findMany({
            where: {
                companyId,
                date: {
                    gte: start,
                    lte: end
                },
            },
            orderBy: { date: 'asc' },
        });

        // --- Advanced Metrics: Period-over-Period Delta Calculation ---

        // 1. Calculate the duration of the current period in milliseconds
        const periodDuration = end.getTime() - start.getTime();

        // 2. Define the previous period (e.g., if looking at Last 7 Days, get the 7 days before that)
        const prevEnd = new Date(start.getTime() - 1); // 1 ms before the current start
        const prevStart = new Date(prevEnd.getTime() - periodDuration);

        prevStart.setHours(0, 0, 0, 0);
        prevEnd.setHours(23, 59, 59, 999);

        // 3. Fetch history for the previous period to aggregate
        const prevHistory = await prisma.metricCache.findMany({
            where: {
                companyId,
                date: {
                    gte: prevStart,
                    lte: prevEnd
                }
            }
        });

        // 4. Aggregate Current Period Totals (from 'history' array)
        const currentTotals = history.reduce((acc, curr) => {
            acc.revenue += curr.totalRevenue || 0;
            acc.orders += curr.totalOrders || 0;
            acc.adSpend += curr.adSpend || 0;
            acc.visitors += curr.visitors || 0;
            acc.emailRevenue += curr.emailRevenue || 0;
            return acc;
        }, { revenue: 0, orders: 0, adSpend: 0, visitors: 0, emailRevenue: 0 });

        const currentROAS = currentTotals.adSpend > 0 ? currentTotals.revenue / currentTotals.adSpend : 0;
        const currentCAC = currentTotals.orders > 0 ? currentTotals.adSpend / currentTotals.orders : 0;

        // 5. Aggregate Previous Period Totals
        const prevTotals = prevHistory.reduce((acc, curr) => {
            acc.revenue += curr.totalRevenue || 0;
            acc.orders += curr.totalOrders || 0;
            acc.adSpend += curr.adSpend || 0;
            acc.visitors += curr.visitors || 0;
            acc.emailRevenue += curr.emailRevenue || 0;
            return acc;
        }, { revenue: 0, orders: 0, adSpend: 0, visitors: 0, emailRevenue: 0 });

        const prevROAS = prevTotals.adSpend > 0 ? prevTotals.revenue / prevTotals.adSpend : 0;
        const prevCAC = prevTotals.orders > 0 ? prevTotals.adSpend / prevTotals.orders : 0;

        // 6. Calculate Percentage Deltas helper function
        const calcDelta = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0; // If went from 0 to something, call it 100% up
            return ((current - previous) / previous) * 100;
        };

        const deltas = {
            revenue: calcDelta(currentTotals.revenue, prevTotals.revenue),
            orders: calcDelta(currentTotals.orders, prevTotals.orders),
            adSpend: calcDelta(currentTotals.adSpend, prevTotals.adSpend),
            roas: calcDelta(currentROAS, prevROAS),
            cac: calcDelta(currentCAC, prevCAC),
            visitors: calcDelta(currentTotals.visitors, prevTotals.visitors),
            emailRevenue: calcDelta(currentTotals.emailRevenue, prevTotals.emailRevenue)
        };

        return res.json({
            latest: latest || null,
            history: history || [],
            dateRange: { start, end },
            prevDateRange: { start: prevStart, end: prevEnd },
            periodTotals: {
                revenue: currentTotals.revenue,
                orders: currentTotals.orders,
                adSpend: currentTotals.adSpend,
                roas: currentROAS,
                cac: currentCAC,
                visitors: currentTotals.visitors,
                emailRevenue: currentTotals.emailRevenue
            },
            deltas
        });
    } catch (err) {
        console.error('Dashboard fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch dashboard data.' });
    }
});

module.exports = router;
