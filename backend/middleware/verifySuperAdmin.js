/**
 * Express middleware that checks if the authenticated user is a Super Admin.
 * Must run AFTER authMiddleware so that req.user exists.
 */
function verifySuperAdmin(req, res, next) {
    if (req.user && req.user.isSuperAdmin === true) {
        next();
    } else {
        return res.status(403).json({ error: 'Super Admin access required.' });
    }
}

module.exports = verifySuperAdmin;
