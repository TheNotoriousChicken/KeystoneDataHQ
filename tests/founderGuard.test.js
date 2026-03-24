// Lightweight tests to validate founder guard logic via a simple runner
// This file is intentionally minimal to avoid CI complexity without a full test suite.
const { isFounderEmail } = require('../backend/utils/founderGuard');

describe('Founder Guard', () => {
  const orig = process.env.FOUNDERS_EMAILS;
  afterAll(() => { process.env.FOUNDERS_EMAILS = orig; });

  test('identifies configured founders', () => {
    process.env.FOUNDERS_EMAILS = 'alice@example.com,bob@example.com';
    if (!isFounderEmail('alice@example.com') || !isFounderEmail('bob@example.com')) {
      throw new Error('Founder emails not recognized as expected');
    }
  });
});
