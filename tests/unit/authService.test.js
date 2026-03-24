import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('bcrypt', () => ({ compare: vi.fn(), hash: vi.fn(() => 'hashed') }));
vi.mock('jsonwebtoken', () => ({ sign: vi.fn(() => 'UNIT_TOKEN') }));
vi.mock('crypto', () => ({ randomInt: vi.fn(() => 123456) }));
vi.mock('../../backend/utils/auditLogger', () => ({ logActivity: vi.fn() }));
vi.mock('../../backend/utils/founderGuard', () => ({ isFounderEmail: vi.fn(() => false) }));
vi.mock('../../backend/utils/email', () => ({ sendTwoFactorEmail: vi.fn() }));

// Import the service with a mocked Prisma client using a dynamic import to cope with CommonJS export
let createAuthService;
beforeEach(async () => {
  const mod = await import('../../backend/services/authService.js');
  createAuthService = mod.default?.createAuthService ?? mod.createAuthService;
});

function makeMockPrisma(fakeUser) {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue(fakeUser),
      update: vi.fn().mockResolvedValue(true),
    },
  };
}

describe('Auth Service - loginUser (Phase 2)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in existing user without 2FA and returns a token', async () => {
    const mockUser = {
      id: 1,
      email: 'regular@example.com',
      passwordHash: 'hash',
      emailVerified: true,
      twoFactorEnabled: false,
      isSuperAdmin: false,
      company: { id: 1, name: 'Acme', subscriptionTier: 'GROWTH', onboardingCompleted: true },
    };
    const prisma = makeMockPrisma(mockUser);
    const bcrypt = await import('bcrypt');
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const service = createAuthService(prisma);
    const res = await service.loginUser({ email: mockUser.email, password: 'pass', req: {} });

    expect(res).toHaveProperty('token', 'UNIT_TOKEN');
    expect(res).toHaveProperty('refreshToken');
    // Optional: ensure refreshToken exists and is a string
    expect(typeof res.refreshToken).toBe('string');
    expect(res).toHaveProperty('user');
    expect(res.user.email).toBe(mockUser.email);
  });

  it('requires 2FA via APP path', async () => {
    const mockUser = {
      id: 2,
      email: '2fa-app@example.com',
      passwordHash: 'hash',
      emailVerified: true,
      twoFactorEnabled: true,
      twoFactorMethod: 'APP',
      company: { id: 2, name: 'Beta', subscriptionTier: 'GROWTH', onboardingCompleted: false },
    };
    const prisma = makeMockPrisma(mockUser);
    const bcrypt = await import('bcrypt');
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const service = createAuthService(prisma);
    const res = await service.loginUser({ email: mockUser.email, password: 'pass', req: {} });

    expect(res).toHaveProperty('requiresTwoFactor');
    expect(res.method).toBe('APP');
    expect(typeof res.tempToken).toBe('string');
  });

  it('rejects login when email is not verified', async () => {
    const mockUser = {
      id: 3,
      email: 'notverified@example.com',
      passwordHash: 'hash',
      emailVerified: false,
      twoFactorEnabled: false,
      company: { id: 3, name: 'Gamma', subscriptionTier: 'STARTER', onboardingCompleted: true },
    };
    const prisma = makeMockPrisma(mockUser);
    const bcrypt = require('bcrypt');
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const service = createAuthService(prisma);
    await expect(service.loginUser({ email: mockUser.email, password: 'pass', req: {} })).rejects.toThrow('Please verify your email before signing in.');
  });

  it('rejects login with wrong password', async () => {
    const mockUser = {
      id: 4,
      email: 'wrongpass@example.com',
      passwordHash: 'hash',
      emailVerified: true,
      twoFactorEnabled: false,
      company: { id: 4, name: 'Delta', subscriptionTier: 'GROWTH', onboardingCompleted: true },
    };
    const prisma = makeMockPrisma(mockUser);
    const bcrypt = require('bcrypt');
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const service = createAuthService(prisma);
    await expect(service.loginUser({ email: mockUser.email, password: 'wrong', req: {} })).rejects.toThrow('Invalid email or password.');
  });

  it('2FA EMAIL path triggers code write and email', async () => {
    const mockUser = {
      id: 5,
      email: '2fa-email@example.com',
      passwordHash: 'hash',
      emailVerified: true,
      twoFactorEnabled: true,
      twoFactorMethod: 'EMAIL',
      company: { id: 5, name: 'Epsilon', subscriptionTier: 'GROWTH', onboardingCompleted: true },
    };
    const prisma = makeMockPrisma(mockUser);
    const bcrypt = require('bcrypt');
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    const emailMod = require('../../backend/utils/email');
    emailMod.sendTwoFactorEmail = vi.fn().mockImplementation((email, code) => Promise.resolve());

    const service = createAuthService(prisma);
    const res = await service.loginUser({ email: mockUser.email, password: 'pass', req: {} });
    expect(res).toHaveProperty('requiresTwoFactor');
    expect(res.method).toBe('EMAIL');
    expect(typeof res.tempToken).toBe('string');
    expect(prisma.user.update).toBeCalled();
  });
});
