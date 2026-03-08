const express = require('express');
const prisma = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ---------------------------------------------------------------------------
// GET /api/reports
// Returns date-filtered metric data + computed summary insights.
// Query params: ?startDate=2024-01-01&endDate=2024-01-31
// ---------------------------------------------------------------------------
router.get('/', authMiddleware, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { startDate, endDate } = req.query;

        // Build the date filter
        const dateFilter = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        // Default: last 30 days if nothing provided
        if (!startDate && !endDate) {
            dateFilter.gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            dateFilter.lte = new Date();
        }

        const metrics = await prisma.metricCache.findMany({
            where: {
                companyId,
                date: Object.keys(dateFilter).length ? dateFilter : undefined,
            },
            orderBy: { date: 'asc' },
        });

        // --- Compute Summary Insights ---
        const totalDays = metrics.length;

        if (totalDays === 0) {
            return res.json({
                summary: null,
                dailyMetrics: [],
                message: 'No data available for the selected period. Try syncing first.',
            });
        }

        const totals = metrics.reduce(
            (acc, m) => {
                acc.revenue += m.totalRevenue || 0;
                acc.adSpend += m.adSpend || 0;
                acc.orders += m.totalOrders || 0;
                return acc;
            },
            { revenue: 0, adSpend: 0, orders: 0 }
        );

        const avgDailyRevenue = totals.revenue / totalDays;
        const avgDailySpend = totals.adSpend / totalDays;
        const avgDailyOrders = totals.orders / totalDays;
        const blendedRoas = totals.adSpend > 0 ? totals.revenue / totals.adSpend : null;
        const blendedCac = totals.orders > 0 ? totals.adSpend / totals.orders : null;

        // Peak revenue day
        const peakDay = metrics.reduce((best, m) =>
            (m.totalRevenue || 0) > (best.totalRevenue || 0) ? m : best,
            metrics[0]
        );

        // Trend: compare first half vs second half
        const mid = Math.floor(totalDays / 2);
        const firstHalf = metrics.slice(0, mid);
        const secondHalf = metrics.slice(mid);

        const firstHalfAvgRev = firstHalf.length
            ? firstHalf.reduce((s, m) => s + (m.totalRevenue || 0), 0) / firstHalf.length
            : 0;
        const secondHalfAvgRev = secondHalf.length
            ? secondHalf.reduce((s, m) => s + (m.totalRevenue || 0), 0) / secondHalf.length
            : 0;

        let revenueTrend = 'flat';
        if (secondHalfAvgRev > firstHalfAvgRev * 1.05) revenueTrend = 'up';
        else if (secondHalfAvgRev < firstHalfAvgRev * 0.95) revenueTrend = 'down';

        const summary = {
            periodDays: totalDays,
            totalRevenue: Number(totals.revenue.toFixed(2)),
            totalAdSpend: Number(totals.adSpend.toFixed(2)),
            totalOrders: totals.orders,
            avgDailyRevenue: Number(avgDailyRevenue.toFixed(2)),
            avgDailySpend: Number(avgDailySpend.toFixed(2)),
            avgDailyOrders: Number(avgDailyOrders.toFixed(1)),
            blendedRoas: blendedRoas ? Number(blendedRoas.toFixed(2)) : null,
            blendedCac: blendedCac ? Number(blendedCac.toFixed(2)) : null,
            peakRevenueDay: peakDay.date,
            peakRevenue: peakDay.totalRevenue,
            revenueTrend,
        };

        return res.json({
            summary,
            dailyMetrics: metrics,
        });
    } catch (err) {
        console.error('Reports error:', err);
        return res.status(500).json({ error: 'Failed to generate report.' });
    }
});

module.exports = router;
