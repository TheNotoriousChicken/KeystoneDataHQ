// ---------------------------------------------------------------------------
// Global Error Handler Middleware
// Catches any unhandled errors thrown in route handlers and returns a
// consistent JSON error response instead of crashing the server.
// ---------------------------------------------------------------------------
const errorHandler = (err, _req, res, _next) => {
    console.error('💥 Unhandled Error:', err.stack || err.message || err);

    const statusCode = err.statusCode || 500;
    const message =
        process.env.NODE_ENV === 'production'
            ? 'Internal server error.'
            : err.message || 'Internal server error.';

    res.status(statusCode).json({
        error: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
};

module.exports = errorHandler;
