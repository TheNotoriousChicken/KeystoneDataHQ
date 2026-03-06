const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');
const verifySuperAdmin = require('../middleware/verifySuperAdmin');

// Apply double security barrier to all routes in this file
router.use(authMiddleware);
router.use(verifySuperAdmin);

// ---------------------------------------------------------------------------
// GET /api/admin/stats
// Returns global platform metrics for the Super Admin overview.
// ---------------------------------------------------------------------------
router.get('/stats', async (_req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalCompanies = await prisma.company.count();
        const activeIntegrations = await prisma.company.count({
            where: {
                OR: [
                    { shopifyToken: { not: null } },
                    { metaAccessToken: { not: null } }
                ]
            }
        });

        return res.json({
            totalUsers,
            totalCompanies,
            activeIntegrations
        });
    } catch (error) {
        console.error('SuperAdmin stats error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/companies
// Returns a detailed list of all companies on the platform.
// ---------------------------------------------------------------------------
router.get('/companies', async (_req, res) => {
    try {
        const companies = await prisma.company.findMany({
            select: {
                id: true,
                name: true,
                createdAt: true,
                _count: {
                    select: { users: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Flatten the _count to be cleaner for the frontend, and calculate MRR
        const mappedCompanies = companies.map(company => {
            let mrr = 0;
            if (company.subscriptionStatus === 'active') {
                if (company.subscriptionTier === 'STARTER') mrr = 150;
                else if (company.subscriptionTier === 'GROWTH') mrr = 1500;
            }

            return {
                id: company.id,
                name: company.name,
                createdAt: company.createdAt,
                userCount: company._count.users,
                subscriptionTier: company.subscriptionTier,
                subscriptionStatus: company.subscriptionStatus,
                mrr
            };
        });

        // Sort by MRR ascending locally (highest MRR at the top)
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
            orderBy: { createdAt: 'asc' } // Original creator usually
        });

        if (!targetUser) {
            return res.status(404).json({ error: 'No admin user found for this company.' });
        }

        const company = await prisma.company.findUnique({ where: { id: targetUser.companyId } });
        targetUser.company = company;

        const payload = {
            userId: targetUser.id,
            companyId: targetUser.companyId,
            role: targetUser.role,
            isSuperAdmin: targetUser.isSuperAdmin,
            impersonatorId: req.user.userId
        };

        const impersonationToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        delete targetUser.passwordHash;

        return res.json({ token: impersonationToken, user: targetUser });
    } catch (error) {
        console.error('SuperAdmin impersonate error:', error);
        return res.status(500).json({ error: 'Impersonation failed.' });
    }
});

// ---------------------------------------------------------------------------
// GET /api/admin/revenue
// Calculates Monthly Recurring Revenue (MRR) based on active subscriptions
// ---------------------------------------------------------------------------
router.get('/revenue', async (_req, res) => {
    try {
        const companies = await prisma.company.findMany({
            select: { subscriptionTier: true, subscriptionStatus: true }
        });

        let mrr = 0;
        let activeSubs = 0;
        let canceledSubs = 0;

        companies.forEach(company => {
            if (company.subscriptionStatus === 'active') {
                activeSubs++;
                if (company.subscriptionTier === 'STARTER') mrr += 150;
                if (company.subscriptionTier === 'GROWTH') mrr += 1500;
            } else if (company.subscriptionStatus === 'canceled' || company.subscriptionStatus === 'past_due') {
                canceledSubs++;
            }
        });

        // Basic churn rate calculation based on totals
        const totalEverSubscribed = activeSubs + canceledSubs;
        const churnRate = totalEverSubscribed > 0 ? (canceledSubs / totalEverSubscribed) * 100 : 0;

        return res.json({
            mrr,
            activeSubs,
            canceledSubs,
            churnRate: churnRate.toFixed(1)
        });
    } catch (error) {
        console.error('SuperAdmin revenue error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
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

        // Map errors to a clean format
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

        // Standardize output to remove sensitive fields just in case
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
