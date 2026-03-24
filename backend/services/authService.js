// Lightweight Auth Service with dependency injection for Prisma client
// This enables unit testing by injecting a mock prisma client.
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
/**
 * AuthService: factory bound to a Prisma client instance.
 * Exposes loginUser({ email, password, req }): Promise resolving to login result.
 * - On success (non-2FA): { token, user }
 * - On 2FA required: { requiresTwoFactor, method, tempToken }
 * The refreshToken rotation is handled by the route and may be included in the response when applicable.
 */
const crypto = require('crypto');
const { logActivity } = require('../utils/auditLogger');
const { isFounderEmail } = require('../utils/founderGuard');
// Email utilities kept for parity; used by higher-level routes, not in this service yet
const { sendTwoFactorEmail } = require('../utils/email');
const { generateRefreshToken } = require('../utils/refreshToken');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '7d';

function createAuthService(prismaInstance) {
  // Ensure a prisma instance is provided
  const prisma = prismaInstance;

  async function loginUser({ email, password, req }) {
    const user = await prisma.user.findUnique({ where: { email }, include: { company: true } });
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password.');
    }

    // Email must be verified
    if (!user.emailVerified) {
      throw new Error('Please verify your email before signing in.');
    }

    // 2FA: if enabled, return a temporary token and method so frontend can prompt for 2FA
    if (user.twoFactorEnabled) {
      const tempToken = jwt.sign(
        {
          userId: user.id,
          companyId: user.companyId,
          role: user.role,
          is2FAPending: true,
        },
        process.env.JWT_SECRET,
        { expiresIn: '10m' }
      );
      // If 2FA via EMAIL, generate and email a code
      if (user.twoFactorMethod === 'EMAIL') {
        const code = crypto.randomInt(100000, 999999).toString();
        const hashedCode = await bcrypt.hash(code, SALT_ROUNDS);
        // 10 minutes expiry
        const expires = new Date(Date.now() + 10 * 60 * 1000);
        await prisma.user.update({
          where: { id: user.id },
          data: { emailAuthCode: hashedCode, emailAuthCodeExpires: expires }
        });
        await sendTwoFactorEmail(user.email, code).catch(err => console.error('Failed to send 2FA email', err));
      }
      return {
        requiresTwoFactor: true,
        method: user.twoFactorMethod,
        tempToken,
      };
    }

    // Non-2FA path: issue a real JWT and update last login
    const isFounder = isFounderEmail(user.email);
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const token = jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin || isFounder,
      },
      process.env.JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );

    await logActivity({ action: 'USER_LOGIN', companyId: user.companyId, userId: user.id, req });

    const payloadUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin || isFounder,
      emailVerified: user.emailVerified,
      company: {
        id: user.company.id,
        name: user.company.name,
        subscriptionTier: user.company.subscriptionTier,
        onboardingCompleted: user.company.onboardingCompleted,
      },
    };

    // Issue a refresh token for session continuation
    const refreshToken = generateRefreshToken({
      userId: user.id,
      companyId: user.companyId,
      role: user.role,
      isSuperAdmin: user.isSuperAdmin || isFounder,
    });

    return { token, refreshToken, user: payloadUser };
  }

  // Exposed API
  return {
    loginUser,
  };
}

module.exports = { createAuthService };
