const prisma = require('../db');

/**
 * Creates an audit log entry.
 *
 * @param {Object} params
 * @param {string} params.action - The action being performed (e.g., 'USER_LOGIN', 'TEAM_INVITE_SENT')
 * @param {string} params.companyId - The ID of the company
 * @param {string} [params.userId] - The ID of the user performing the action (optional)
 * @param {string} [params.details] - Additional contextual details (optional)
 * @param {Object} [params.req] - The Express request object to extract IP/UserAgent (optional)
 */
async function logActivity({ action, companyId, userId, details, req }) {
    try {
        let ipAddress = null;
        let userAgent = null;

        if (req) {
            ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
            userAgent = req.get('User-Agent');
        }

        await prisma.auditLog.create({
            data: {
                action,
                companyId,
                userId: userId || null,
                details: details || null,
                ipAddress,
                userAgent,
            },
        });
    } catch (error) {
        // We log the error but don't throw, to prevent blocking the main request flow
        console.error(`Failed to write audit log [${action}]:`, error);
    }
}

module.exports = {
    logActivity,
};
