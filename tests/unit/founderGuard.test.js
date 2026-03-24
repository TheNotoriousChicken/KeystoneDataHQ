// Unit tests for founderGuard
const { isFounderEmail } = require('../../backend/utils/founderGuard');

describe('founderGuard', () => {
    const originalEnv = process.env.FOUNDERS_EMAILS;

    afterEach(() => {
        if (originalEnv !== undefined) {
            process.env.FOUNDERS_EMAILS = originalEnv;
        } else {
            delete process.env.FOUNDERS_EMAILS;
        }
    });

    test('returns true for default founder email', () => {
        delete process.env.FOUNDERS_EMAILS;
        expect(isFounderEmail('tejas@keystonedatahq.com')).toBe(true);
    });

    test('is case-insensitive', () => {
        delete process.env.FOUNDERS_EMAILS;
        expect(isFounderEmail('TEJAS@KEYSTONEDATAHQ.COM')).toBe(true);
    });

    test('returns false for non-founder email', () => {
        delete process.env.FOUNDERS_EMAILS;
        expect(isFounderEmail('random@user.com')).toBe(false);
    });

    test('returns false for null/undefined', () => {
        expect(isFounderEmail(null)).toBe(false);
        expect(isFounderEmail(undefined)).toBe(false);
        expect(isFounderEmail('')).toBe(false);
    });

    test('respects FOUNDERS_EMAILS env var', () => {
        process.env.FOUNDERS_EMAILS = 'admin@test.com,cto@test.com';
        // Need to re-require since it reads env at call time
        const { isFounderEmail: fn } = require('../../backend/utils/founderGuard');
        expect(fn('admin@test.com')).toBe(true);
        expect(fn('cto@test.com')).toBe(true);
        expect(fn('tejas@keystonedatahq.com')).toBe(false);
    });
});
