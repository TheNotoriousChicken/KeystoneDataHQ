/**
 * Role-based access control middleware.
 *
 * Usage:
 *   router.post('/admin-only', authMiddleware, requireRole('ADMIN'), handler);
 *   router.get('/multi-role', authMiddleware, requireRole('ADMIN', 'EDITOR'), handler);
 *
 * Must be used AFTER authMiddleware (needs req.user.role).
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ error: 'Authentication required.' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'You do not have permission to perform this action.',
            });
        }

        next();
    };
}

module.exports = requireRole;
