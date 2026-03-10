const { ZodError } = require('zod');

/**
 * Express middleware to validate request bodies against a Zod schema.
 * @param {import('zod').ZodSchema} schema
 */
const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            // Send back a formatted error message for the first error
            const firstError = err.errors[0];
            const field = firstError.path.join('.');
            return res.status(400).json({
                error: `${field ? field + ': ' : ''}${firstError.message}`,
                details: err.errors
            });
        }
        next(err);
    }
};

module.exports = validate;
