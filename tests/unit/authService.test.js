// Unit tests for authService
const { createAuthService } = require('../../backend/services/authService');
const bcrypt = require('bcrypt');

// Mock dependencies
jest.mock('../../backend/utils/auditLogger', () => ({ logActivity: jest.fn() }));
jest.mock('../../backend/utils/founderGuard', () => ({ isFounderEmail: jest.fn((email) => email === 'tejas@keystonedatahq.com') }));
jest.mock('../../backend/utils/email', () => ({ sendTwoFactorEmail: jest.fn().mockResolvedValue(true) }));
jest.mock('../../backend/utils/refreshToken', () => ({ generateRefreshToken: jest.fn().mockReturnValue('mock-refresh-token') }));

describe('AuthService', () => {
    let authService;
    let mockPrisma;

    beforeEach(() => {
        mockPrisma = {
            user: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };
        authService = createAuthService(mockPrisma);
        process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
    });

    test('throws on non-existent user', async () => {
        mockPrisma.user.findUnique.mockResolvedValue(null);
        await expect(authService.loginUser({ email: 'nobody@test.com', password: 'pass123', req: {} }))
            .rejects.toThrow('Invalid email or password.');
    });

    test('throws on wrong password', async () => {
        const hash = await bcrypt.hash('correctpassword', 10);
        mockPrisma.user.findUnique.mockResolvedValue({
            id: '1', email: 'user@test.com', passwordHash: hash,
            emailVerified: true, twoFactorEnabled: false, isSuperAdmin: false,
            companyId: 'c1', role: 'ADMIN',
            company: { id: 'c1', name: 'Test Co', subscriptionTier: 'STARTER', onboardingCompleted: false },
        });
        await expect(authService.loginUser({ email: 'user@test.com', password: 'wrongpassword', req: {} }))
            .rejects.toThrow('Invalid email or password.');
    });

    test('throws if email not verified', async () => {
        const hash = await bcrypt.hash('password123', 10);
        mockPrisma.user.findUnique.mockResolvedValue({
            id: '1', email: 'user@test.com', passwordHash: hash,
            emailVerified: false, twoFactorEnabled: false, isSuperAdmin: false,
            companyId: 'c1', role: 'ADMIN',
            company: { id: 'c1', name: 'Test Co', subscriptionTier: 'STARTER', onboardingCompleted: false },
        });
        await expect(authService.loginUser({ email: 'user@test.com', password: 'password123', req: {} }))
            .rejects.toThrow('Please verify your email before signing in.');
    });

    test('returns token + user on successful login', async () => {
        const hash = await bcrypt.hash('password123', 10);
        mockPrisma.user.findUnique.mockResolvedValue({
            id: '1', email: 'user@test.com', passwordHash: hash,
            firstName: 'Test', lastName: 'User',
            emailVerified: true, twoFactorEnabled: false, isSuperAdmin: false,
            companyId: 'c1', role: 'ADMIN',
            company: { id: 'c1', name: 'Test Co', subscriptionTier: 'STARTER', onboardingCompleted: false },
        });
        mockPrisma.user.update.mockResolvedValue({});

        const result = await authService.loginUser({ email: 'user@test.com', password: 'password123', req: {} });
        expect(result).toHaveProperty('token');
        expect(result).toHaveProperty('refreshToken');
        expect(result.user.email).toBe('user@test.com');
    });

    test('returns 2FA response when enabled', async () => {
        const hash = await bcrypt.hash('password123', 10);
        mockPrisma.user.findUnique.mockResolvedValue({
            id: '1', email: 'user@test.com', passwordHash: hash,
            emailVerified: true, twoFactorEnabled: true, twoFactorMethod: 'APP',
            twoFactorSecret: 'SECRET', isSuperAdmin: false,
            companyId: 'c1', role: 'ADMIN',
            company: { id: 'c1', name: 'Test Co', subscriptionTier: 'GROWTH', onboardingCompleted: true },
        });

        const result = await authService.loginUser({ email: 'user@test.com', password: 'password123', req: {} });
        expect(result.requiresTwoFactor).toBe(true);
        expect(result.method).toBe('APP');
        expect(result).toHaveProperty('tempToken');
    });
});
