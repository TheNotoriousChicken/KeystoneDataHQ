const rateLimit = require('express-rate-limit');

// ---------------------------------------------------------------------------
// Rate Limiters
// ---------------------------------------------------------------------------

// General API limiter — 100 requests per 15 minutes per IP
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
});

// Stricter auth limiter — 15 attempts per 15 minutes per IP
// Protects login/register from brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts. Please try again later.' },
});

module.exports = { apiLimiter, authLimiter };
