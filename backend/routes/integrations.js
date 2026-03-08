const express = require('express');
const prisma = require('../db');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ---------------------------------------------------------------------------
// POST /api/integrations/shopify/connect  (Protected)
// Validates Shopify credentials against the live API, then saves to DB.
// ---------------------------------------------------------------------------
router.post('/shopify/connect', authMiddleware, async (req, res) => {
    try {
        const { shopName, accessToken } = req.body;

        if (!shopName || !accessToken) {
            return res.status(400).json({ error: 'shopName and accessToken are required.' });
        }

        // --- 1. Validate credentials against live Shopify API ---
        const shopifyUrl = `https://${shopName}/admin/api/2024-01/shop.json`;

        let shopifyRes;
        try {
            shopifyRes = await fetch(shopifyUrl, {
                method: 'GET',
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
            });
        } catch (fetchErr) {
            console.error('Shopify API fetch error:', fetchErr.message);
            return res.status(400).json({
                error: 'Could not reach Shopify. Please check your store name (e.g. yourstore.myshopify.com).',
            });
        }

        if (!shopifyRes.ok) {
            console.error(`Shopify API returned ${shopifyRes.status}`);
            return res.status(400).json({
                error: 'Invalid Shopify credentials. Please check your token and store name.',
            });
        }

        const shopData = await shopifyRes.json();
        console.log(`✅ Shopify validated: ${shopData?.shop?.name} (${shopName})`);

        // --- 2. Save credentials to the Company record ---
        const companyId = req.user.companyId;

        await prisma.company.update({
            where: { id: companyId },
            data: {
                shopifyShopName: shopName,
                shopifyToken: accessToken,
            },
        });

        return res.json({
            message: 'Shopify connected successfully.',
            shopName: shopData?.shop?.name,
            domain: shopData?.shop?.domain,
        });
    } catch (err) {
        console.error('Shopify connect error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/integrations/meta/connect  (Protected)
// Validates Meta Ads credentials against the Graph API, then saves to DB.
// ---------------------------------------------------------------------------
router.post('/meta/connect', authMiddleware, async (req, res) => {
    try {
        const { adAccountId, accessToken } = req.body;

        if (!adAccountId || !accessToken) {
            return res.status(400).json({ error: 'adAccountId and accessToken are required.' });
        }

        // --- 1. Validate credentials against live Facebook Graph API ---
        const graphUrl = `https://graph.facebook.com/v19.0/${adAccountId}?access_token=${accessToken}`;

        let metaRes;
        try {
            metaRes = await fetch(graphUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
        } catch (fetchErr) {
            console.error('Meta Graph API fetch error:', fetchErr.message);
            return res.status(400).json({
                error: 'Could not reach Meta Graph API. Please check your credentials.',
            });
        }

        const metaData = await metaRes.json();

        if (metaData.error) {
            console.error(`Meta Graph API error: ${metaData.error.message}`);
            return res.status(400).json({
                error: 'Invalid Meta Ads credentials. Please check your Ad Account ID and Access Token.',
            });
        }

        console.log(`✅ Meta Ads validated: Account ${metaData.name || metaData.id} (${adAccountId})`);

        // --- 2. Save credentials to the Company record ---
        const companyId = req.user.companyId;

        await prisma.company.update({
            where: { id: companyId },
            data: {
                metaAdAccountId: adAccountId,
                metaAccessToken: accessToken,
            },
        });

        return res.json({
            message: 'Meta Ads connected successfully.',
            accountId: metaData.id,
            accountName: metaData.name || null,
        });
    } catch (err) {
        console.error('Meta connect error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});
// ---------------------------------------------------------------------------
// POST /api/integrations/ga4/connect  (Protected)
// Validates Google Analytics 4 credentials, then saves to DB.
// ---------------------------------------------------------------------------
router.post('/ga4/connect', authMiddleware, async (req, res) => {
    try {
        const { propertyId, credentialsJson } = req.body;

        if (!propertyId || !credentialsJson) {
            return res.status(400).json({ error: 'Property ID and Service Account JSON are required.' });
        }

        let parsedCredentials;
        try {
            parsedCredentials = JSON.parse(credentialsJson);
        } catch (e) {
            return res.status(400).json({ error: 'Invalid JSON format for credentials.' });
        }

        // --- 1. Validate credentials against Google Analytics Data API ---
        try {
            const analyticsDataClient = new BetaAnalyticsDataClient({
                credentials: {
                    client_email: parsedCredentials.client_email,
                    private_key: parsedCredentials.private_key,
                }
            });

            // Make a test call to see if we have access to this property
            await analyticsDataClient.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate: 'today', endDate: 'today' }],
                metrics: [{ name: 'activeUsers' }],
            });

        } catch (authErr) {
            console.error('GA4 Validation Error:', authErr.message);
            return res.status(400).json({
                error: 'Could not access the GA4 property. Ensure the Service Account has Viewer permissions on this property ID.',
            });
        }

        console.log(`✅ GA4 validated: Property ${propertyId}`);

        // --- 2. Save credentials to the Company record ---
        await prisma.company.update({
            where: { id: req.user.companyId },
            data: {
                ga4PropertyId: propertyId,
                ga4Credentials: parsedCredentials,
            },
        });

        return res.json({ message: 'Google Analytics 4 connected successfully.' });
    } catch (err) {
        console.error('GA4 connect error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

// ---------------------------------------------------------------------------
// POST /api/integrations/klaviyo/connect  (Protected)
// Validates Klaviyo Private API Key, then saves to DB.
// ---------------------------------------------------------------------------
router.post('/klaviyo/connect', authMiddleware, async (req, res) => {
    try {
        const { apiKey } = req.body;

        if (!apiKey) {
            return res.status(400).json({ error: 'Klaviyo Private API Key is required.' });
        }

        // --- 1. Validate credentials against Klaviyo API ---
        let klaviyoRes;
        try {
            klaviyoRes = await fetch('https://a.klaviyo.com/api/profiles/?page[size]=1', {
                method: 'GET',
                headers: {
                    'Authorization': `Klaviyo-API-Key ${apiKey}`,
                    'accept': 'application/json',
                    'revision': '2024-02-15'
                },
            });
        } catch (fetchErr) {
            console.error('Klaviyo API fetch error:', fetchErr.message);
            return res.status(400).json({
                error: 'Could not reach Klaviyo API. Please check your key.',
            });
        }

        if (!klaviyoRes.ok) {
            console.error(`Klaviyo API returned ${klaviyoRes.status}`);
            return res.status(400).json({
                error: 'Invalid Klaviyo API Key. Ensure it is a valid Private API Key.',
            });
        }

        console.log(`✅ Klaviyo validated.`);

        // --- 2. Save credentials to the Company record ---
        await prisma.company.update({
            where: { id: req.user.companyId },
            data: { klaviyoApiKey: apiKey },
        });

        return res.json({ message: 'Klaviyo connected successfully.' });
    } catch (err) {
        console.error('Klaviyo connect error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
