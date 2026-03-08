const express = require('express');
const router = express.Router();
const prisma = require('../db');

// ---------------------------------------------------------------------------
// GET /api/flags
// Returns a global map of all platform feature flags.
// This route is PUBLIC so the frontend can read flags before auth.
// ---------------------------------------------------------------------------
router.get('/', async (_req, res) => {
    try {
        const flags = await prisma.featureFlag.findMany();

        // Convert array to a simple key-value map for the frontend:
        // { "disable_meta_sync": true, "enable_new_charts": false }
        const flagMap = {};
        for (const flag of flags) {
            flagMap[flag.key] = flag.isEnabled;
        }

        return res.json(flagMap);
    } catch (error) {
        console.error('Feature flags get error:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
