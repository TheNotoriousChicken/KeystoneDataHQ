const { z } = require('zod');

const registerSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
    firstName: z.string().min(1, 'First name is required.'),
    lastName: z.string().min(1, 'Last name is required.'),
    companyName: z.string().optional(),
    inviteToken: z.string().optional()
}).refine(data => data.inviteToken || data.companyName, {
    message: "companyName is required when registering without an invite.",
    path: ["companyName"]
});

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address.'),
    password: z.string().min(1, 'Password is required.')
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address.')
});

const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required.'),
    password: z.string().min(8, 'Password must be at least 8 characters.')
});

const profileUpdateSchema = z.object({
    firstName: z.string().min(1, 'First name is required.').optional(),
    lastName: z.string().min(1, 'Last name is required.').optional(),
    email: z.string().email('Please enter a valid email address.').optional()
}).refine(data => data.firstName !== undefined || data.lastName !== undefined || data.email !== undefined, {
    message: "At least one field (firstName, lastName, email) must be provided to update.",
    path: ["firstName"]
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    profileUpdateSchema
};
