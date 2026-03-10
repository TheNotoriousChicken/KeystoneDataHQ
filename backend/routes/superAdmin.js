const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const prisma = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const verifySuperAdmin = require('../middleware/verifySuperAdmin');

// Apply double security barrier to all routes in this file
router.use(authMiddleware);
router.use(verifySuperAdmin);

// ---------------------------------------------------------------------------
// GET /api/admin/stats
// Enhanced global platform metrics with growth & engagement data.
// ---------------------------------------------------------------------------
router.get('/stats', async (_req, res) => {
    try {
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            totalCompanies,
            activeIntegrations,
            newUsers7d,
            newUsers30d,
            newCompanies7d,
            newCompanies30d,
            verifiedUsers,
            twoFactorUsers,
            onboardedCompanies,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.company.count(),
            prisma.company.count({
                where: {
                    OR: [
                        { shopifyToken: { not: null } },
                        { metaAccessToken: { not: null } },
                        { ga4PropertyId: { not: null } },
                        { klaviyoApiKey: { not: null } },
                    ]
                }
            }),
            prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
            prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.company.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
            prisma.company.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.user.count({ where: { emailVerified: true } }),
            prisma.user.count({ where: { twoFactorEnabled: true } }),
            prisma.company.count({ where: { onboardingCompleted: true } }),
        ]);

        // Recent logins (proxy: audit logs with USER_LOGIN in last 7 days)
        const recentLogins = await prisma.auditLog.groupBy({
            by: ['userId'],
            where: {
                action: 'USER_LOGIN',
                createdAt: { gte: sevenDaysAgo },
            },
        });

        return res.json({
            totalUsers,
            totalCompanies,
            activeIntegrations,
            growth: {
                newUsers7d,
                newUsers30d,
                newCompanies7d,
                newCompanies30d,
            },
            engagement: {
                verifiedRate: totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0,
                twoFactorRate: totalUsers > 0 ? Math.round((twoFactorUsers / totalUsers) * 100) : 0,
                onboardingRate: totalCompanies > 0 ? Math.round((onboardedCompanies / totalCompanies) * 100) : 0,
                activeUsersLast7d: recentLogins.length,
            },
        });
    } catch (error) {
        console.error('SuperAdmin stats error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/companies
// Enhanced: includes health score, integration count, last activity.
// ---------------------------------------------------------------------------
router.get('/companies', async (_req, res) => {
    try {
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                subscriptionTier: true,
                subscriptionStatus: true,
                onboardingCompleted: true,
                createdAt: true,
                shopifyToken: true,
                metaAccessToken: true,
                ga4PropertyId: true,
                klaviyoApiKey: true,
                _count: {
                    select: { users: true, integrations: true }
                },
                integrations: {
                    select: { syncStatus: true, lastSyncedAt: true },
                    orderBy: { lastSyncedAt: 'desc' },
                    take: 1
                },
            },
            orderBy: { createdAt: 'desc' }
        });

        // Get most recent login per company (from audit logs)
        const companyIds = companies.map(c => c.id);
        const lastLogins = await prisma.auditLog.groupBy({
            by: ['companyId'],
            where: {
                action: 'USER_LOGIN',
                companyId: { in: companyIds },
            },
            _max: { createdAt: true },
        });

        const loginMap = {};
        lastLogins.forEach(l => {
            loginMap[l.companyId] = l._max.createdAt;
        });

        const mappedCompanies = companies.map(company => {
            // Count connected platforms
            let integrationCount = 0;
            if (company.shopifyToken) integrationCount++;
            if (company.metaAccessToken) integrationCount++;
            if (company.ga4PropertyId) integrationCount++;
            if (company.klaviyoApiKey) integrationCount++;

            // MRR calculation
            let mrr = 0;
            if (company.subscriptionStatus === 'active') {
                if (company.subscriptionTier === 'STARTER') mrr = 500;
                else if (company.subscriptionTier === 'GROWTH') mrr = 1500;
            }

            // Last sync time
            const lastSync = company.integrations[0]?.lastSyncedAt || null;
            const lastSyncStatus = company.integrations[0]?.syncStatus || null;

            // Last login
            const lastLogin = loginMap[company.id] || null;

            // Health Score (0-100)
            let healthScore = 0;
            if (company.subscriptionStatus === 'active') healthScore += 25;
            if (company.onboardingCompleted) healthScore += 15;
            if (integrationCount > 0) healthScore += Math.min(integrationCount * 10, 30);
            if (lastLogin) {
                const daysSinceLogin = (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24);
                if (daysSinceLogin < 1) healthScore += 30;
                else if (daysSinceLogin < 7) healthScore += 20;
                else if (daysSinceLogin < 30) healthScore += 10;
            }

            return {
                id: company.id,
                name: company.name,
                createdAt: company.createdAt,
                userCount: company._count.users,
                subscriptionTier: company.subscriptionTier,
                subscriptionStatus: company.subscriptionStatus,
                mrr,
                integrationCount,
                lastSync,
                lastSyncStatus,
                lastLogin,
                healthScore: Math.min(healthScore, 100),
            };
        });

        mappedCompanies.sort((a, b) => b.mrr - a.mrr);
        return res.json(mappedCompanies);
    } catch (error) {
        console.error('SuperAdmin companies error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/admin/impersonate
// Generate a session token for the target company
// ---------------------------------------------------------------------------
router.post('/impersonate', async (req, res) => {
    try {
        const { companyId } = req.body;
        if (!companyId) return res.status(400).json({ error: 'companyId required.' });

        const targetUser = await prisma.user.findFirst({
            where: { companyId, role: 'ADMIN' },
            orderBy: { createdAt: 'asc' },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                companyId: true,
                isSuperAdmin: true,
                createdAt: true,
            }
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'No admin user found for this company.' });
        }

        const company = await prisma.company.findUnique({ where: { id: targetUser.companyId } });

        const payload = {
            userId: targetUser.id,
            companyId: targetUser.companyId,
            role: targetUser.role,
            isSuperAdmin: targetUser.isSuperAdmin,
            impersonatorId: req.user.userId
        };

        const impersonationToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.json({
            token: impersonationToken,
            user: {
                ...targetUser,
                company,
            }
        });
    } catch (error) {
        console.error('SuperAdmin impersonate error:', error);
        return res.status(500).json({ error: 'Impersonation failed.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/revenue
// Enhanced: ARR, net new MRR, tier breakdown, 6-month trend.
// ---------------------------------------------------------------------------
router.get('/revenue', async (_req, res) => {
    try {
        const companies = await prisma.company.findMany({
            select: { subscriptionTier: true, subscriptionStatus: true, createdAt: true }
        });

        let mrr = 0;
        let activeSubs = 0;
        let canceledSubs = 0;
        let starterCount = 0;
        let growthCount = 0;
        let starterMrr = 0;
        let growthMrr = 0;

        companies.forEach(company => {
            if (company.subscriptionStatus === 'active') {
                activeSubs++;
                if (company.subscriptionTier === 'STARTER') {
                    mrr += 500;
                    starterCount++;
                    starterMrr += 500;
                }
                if (company.subscriptionTier === 'GROWTH') {
                    mrr += 1500;
                    growthCount++;
                    growthMrr += 1500;
                }
            } else if (company.subscriptionStatus === 'canceled' || company.subscriptionStatus === 'past_due') {
                canceledSubs++;
            }
        });

        const totalEverSubscribed = activeSubs + canceledSubs;
        const churnRate = totalEverSubscribed > 0 ? (canceledSubs / totalEverSubscribed) * 100 : 0;

        // Build 6-month MRR trend (synthetic based on company creation dates)
        const now = new Date();
        const trend = [];
        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const monthLabel = monthStart.toLocaleString('default', { month: 'short' });

            // Count companies that existed and were active by end of that month
            let monthMrr = 0;
            companies.forEach(c => {
                if (new Date(c.createdAt) <= monthEnd) {
                    if (c.subscriptionStatus === 'active') {
                        if (c.subscriptionTier === 'STARTER') monthMrr += 500;
                        if (c.subscriptionTier === 'GROWTH') monthMrr += 1500;
                    }
                }
            });

            trend.push({ month: monthLabel, mrr: monthMrr });
        }

        return res.json({
            mrr,
            arr: mrr * 12,
            activeSubs,
            canceledSubs,
            churnRate: churnRate.toFixed(1),
            breakdown: {
                starter: { count: starterCount, mrr: starterMrr },
                growth: { count: growthCount, mrr: growthMrr },
            },
            trend,
        });
    } catch (error) {
        console.error('SuperAdmin revenue error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/signups
// Recent signups: companies and users from the last 7 days.
// ---------------------------------------------------------------------------
router.get('/signups', async (_req, res) => {
    try {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [recentCompanies, recentUsers] = await Promise.all([
            prisma.company.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: { id: true, name: true, subscriptionTier: true, createdAt: true, _count: { select: { users: true } } },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
            prisma.user.findMany({
                where: { createdAt: { gte: sevenDaysAgo } },
                select: {
                    id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true,
                    company: { select: { name: true } },
                },
                orderBy: { createdAt: 'desc' },
                take: 20,
            }),
        ]);

        return res.json({
            companies: recentCompanies.map(c => ({
                id: c.id,
                name: c.name,
                tier: c.subscriptionTier,
                userCount: c._count.users,
                createdAt: c.createdAt,
            })),
            users: recentUsers.map(u => ({
                id: u.id,
                name: `${u.firstName} ${u.lastName}`,
                email: u.email,
                role: u.role,
                company: u.company?.name || 'Unknown',
                createdAt: u.createdAt,
            })),
        });
    } catch (error) {
        console.error('SuperAdmin signups error:', error);
        return res.status(500).json({ error: 'Failed to fetch signups.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/admin/trigger-sync
// Manually triggers the data sync engine for all eligible companies.
// ---------------------------------------------------------------------------
router.post('/trigger-sync', async (req, res) => {
    try {
        const { syncCompanyMetrics } = require('../services/syncEngine');

        // Find all companies with at least one connected integration
        const companies = await prisma.company.findMany({
            where: {
                OR: [
                    { shopifyToken: { not: null } },
                    { metaAccessToken: { not: null } },
                    { ga4PropertyId: { not: null } },
                    { klaviyoApiKey: { not: null } },
                ]
            },
            select: { id: true }
        });

        // Fire and forget — run syncs in parallel without blocking the response
        Promise.all(
            companies.map(c => syncCompanyMetrics(c.id).catch(err => console.error(`Sync failed for ${c.id}:`, err)))
        ).catch(err => console.error('Manual sync batch error:', err));

        return res.json({ message: `Data sync triggered for ${companies.length} eligible companies.` });
    } catch (error) {
        console.error('SuperAdmin trigger-sync error:', error);
        return res.status(500).json({ error: 'Failed to trigger sync.' });
    }
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/companies/:id
// Permanently deletes a company and all related data (cascading).
// ---------------------------------------------------------------------------
router.delete('/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const company = await prisma.company.findUnique({ where: { id } });
        if (!company) {
            return res.status(404).json({ error: 'Company not found.' });
        }

        await prisma.company.delete({ where: { id } });
        return res.json({ message: `Company "${company.name}" permanently deleted.` });
    } catch (error) {
        console.error('SuperAdmin delete company error:', error);
        return res.status(500).json({ error: 'Failed to delete company.' });
    }
});

// ---------------------------------------------------------------------------
// PUT /api/admin/flags
// Creates or updates a feature flag
// ---------------------------------------------------------------------------
router.put('/flags', async (req, res) => {
    try {
        const { key, isEnabled, description } = req.body;
        if (!key) return res.status(400).json({ error: 'Flag key required.' });

        const flag = await prisma.featureFlag.upsert({
            where: { key },
            update: { isEnabled, description },
            create: { key, isEnabled, description }
        });

        return res.json({ message: 'Flag updated successfully.', flag });
    } catch (error) {
        console.error('SuperAdmin put flag error:', error);
        return res.status(500).json({ error: 'Failed to update flag.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/flags
// Lists all feature flags with full details for the Founder HQ
// ---------------------------------------------------------------------------
router.get('/flags', async (_req, res) => {
    try {
        const flags = await prisma.featureFlag.findMany({
            orderBy: { key: 'asc' }
        });
        return res.json(flags);
    } catch (error) {
        console.error('SuperAdmin list flags error:', error);
        return res.status(500).json({ error: 'Failed to list flags.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/admin/broadcast
// Creates a new global broadcast, deactivating old ones automatically
// ---------------------------------------------------------------------------
router.post('/broadcast', async (req, res) => {
    try {
        const { message, type, expiresAt } = req.body;
        if (!message) return res.status(400).json({ error: 'Broadcast message required.' });

        // First deactivate all old active broadcasts so only one is showing
        await prisma.broadcast.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        });

        const broadcast = await prisma.broadcast.create({
            data: {
                message,
                type: type || 'INFO',
                isActive: true,
                expiresAt: expiresAt ? new Date(expiresAt) : null
            }
        });

        return res.status(201).json({ message: 'Broadcast published.', broadcast });
    } catch (error) {
        console.error('SuperAdmin post broadcast error:', error);
        return res.status(500).json({ error: 'Failed to create broadcast.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/integrations-health
// Aggregates integration sync statuses across the platform.
// ---------------------------------------------------------------------------
router.get('/integrations-health', async (_req, res) => {
    try {
        const total = await prisma.integration.count();
        const successful = await prisma.integration.count({ where: { syncStatus: 'SUCCESS' } });
        const failed = await prisma.integration.count({ where: { syncStatus: 'FAILURE' } });
        const pending = await prisma.integration.count({ where: { syncStatus: 'PENDING' } });

        const recentErrors = await prisma.integration.findMany({
            where: { syncStatus: 'FAILURE' },
            orderBy: { lastSyncedAt: 'desc' },
            take: 10,
            include: { company: { select: { name: true } } }
        });

        const errorLog = recentErrors.map(int => ({
            id: int.id,
            companyName: int.company.name,
            platformName: int.platformName,
            error: int.syncError,
            lastAttempt: int.lastSyncedAt
        }));

        const failureRate = total > 0 ? ((failed / total) * 100).toFixed(1) : 0;

        return res.json({
            metrics: {
                total,
                successful,
                failed,
                pending,
                failureRate: parseFloat(failureRate)
            },
            recentErrors: errorLog
        });
    } catch (error) {
        console.error('SuperAdmin integrations health error:', error);
        return res.status(500).json({ error: 'Failed to fetch integrations health.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/pulse
// Returns recent global audit logs (scrolling feed of platform activity).
// ---------------------------------------------------------------------------
router.get('/pulse', async (_req, res) => {
    try {
        const pulse = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                user: { select: { email: true, firstName: true, lastName: true } },
                company: { select: { name: true } }
            }
        });
        return res.json(pulse);
    } catch (error) {
        console.error('SuperAdmin pulse error:', error);
        return res.status(500).json({ error: 'Failed to fetch global pulse.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/users
// Returns a global directory of all individuals registered on the platform.
// ---------------------------------------------------------------------------
router.get('/users', async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                company: { select: { name: true, subscriptionTier: true } }
            }
        });

        const safeUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            isSuperAdmin: u.isSuperAdmin,
            createdAt: u.createdAt,
            companyName: u.company?.name || 'Unknown',
            companyTier: u.company?.subscriptionTier || 'NONE'
        }));

        return res.json(safeUsers);
    } catch (error) {
        console.error('SuperAdmin users error:', error);
        return res.status(500).json({ error: 'Failed to fetch global users.' });
    }
});

module.exports = router;
