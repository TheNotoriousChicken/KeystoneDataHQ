require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const authRoutes = require('./routes/auth');
const billingRoutes = require('./routes/billing');
const webhookRoute = require('./routes/webhook');
const integrationRoutes = require('./routes/integrations');
const dashboardRoutes = require('./routes/dashboard');
const teamRoutes = require('./routes/team');
const reportsRoutes = require('./routes/reports');
const settingsRoutes = require('./routes/settings');
const activityRoutes = require('./routes/activity');
const notificationsRoutes = require('./routes/notifications');
const superAdminRoutes = require('./routes/superAdmin');
const flagsRoutes = require('./routes/flags');
const broadcastRoutes = require('./routes/broadcast');

const app = express();
const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// Security & Logging Middleware
// ---------------------------------------------------------------------------
app.use(helmet());                              // Security headers (XSS, HSTS, etc.)
app.use(morgan('short'));                        // Request logging

app.use(cors({
<<<<<<< HEAD
    origin: [
        'http://localhost:5173',
        'https://keystonedatahq.com',
        'https://www.keystonedatahq.com',
        process.env.FRONTEND_URL
    ].filter(Boolean),
=======
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
>>>>>>> 42c2f46dab99a0890797d25e4a219a7b1da60c68
    credentials: true,
}));

// Serve static files from public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ⚠️ CRITICAL: Mount the Paddle webhook BEFORE express.json() so it
// receives the raw, unparsed body required for signature verification.
app.use('/api/billing/webhook', webhookRoute);

// Now parse JSON for all other routes.
app.use(express.json({ limit: '1mb' }));

// Apply general rate limiter to all /api routes
app.use('/api', apiLimiter);

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Apply stricter rate limiter to auth routes
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/billing', billingRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', superAdminRoutes);
app.use('/api/flags', flagsRoutes);
app.use('/api/broadcast', broadcastRoutes);

// ---------------------------------------------------------------------------
// 404 Handler — Catch unmatched routes
// ---------------------------------------------------------------------------
app.use((_req, res) => {
    res.status(404).json({ error: 'Endpoint not found.' });
});

// ---------------------------------------------------------------------------
// Global Error Handler — Must be LAST middleware
// ---------------------------------------------------------------------------
app.use(errorHandler);

// ---------------------------------------------------------------------------
// Graceful Shutdown
// ---------------------------------------------------------------------------
const server = app.listen(PORT, () => {
    console.log(`✅  Keystone API running → http://localhost:${PORT}`);
    console.log(`    Health check       → http://localhost:${PORT}/api/health`);

    // Start background cron jobs
    require('./jobs/cron');
});

// Handle graceful shutdown on SIGTERM / SIGINT
const shutdown = (signal) => {
    console.log(`\n🛑 ${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log('💤 Server closed.');
        process.exit(0);
    });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
