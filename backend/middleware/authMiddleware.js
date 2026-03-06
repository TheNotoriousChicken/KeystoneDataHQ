const jwt = require('jsonwebtoken');

/**
 * Express middleware that protects routes by verifying a JWT.
 *
 * Expects: Authorization: Bearer <token>
 * Attaches: req.user = { userId, companyId, role }
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            companyId: decoded.companyId,
            role: decoded.role,
            isSuperAdmin: decoded.isSuperAdmin || false
        };
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}

module.exports = authMiddleware;
