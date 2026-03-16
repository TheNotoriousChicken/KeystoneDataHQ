const prisma = require('../db');

const errorLogger = async (err, req, res, next) => {
    try {
        // Log 500-level errors to the database
        const status = err.status || res.statusCode || 500;
        
        if (status >= 500) {
            await prisma.errorLog.create({
                data: {
                    message: err.message || 'Unknown Error',
                    stack: err.stack,
                    path: req.originalUrl || req.path,
                    method: req.method,
                    userId: req.user?.userId || null,
                    companyId: req.user?.companyId || null,
                }
            });
            console.error(`[MINI-SENTRY] Captured Global Backend Error at ${req.originalUrl}:`, err.message);
        }
    } catch (loggingError) {
        console.error('[MINI-SENTRY] Failed to log error to database:', loggingError);
    }
    
    // Pass it down to the default Express error handler
    next(err);
};

module.exports = errorLogger;
