#!/usr/bin/env node
import { strict as assert } from 'assert';
import { createRequire } from 'module';

// Use CommonJS require for the CJS module in a modern ESM script
const require = createRequire(import.meta.url);
const { isFounderEmail } = require('../backend/utils/founderGuard');

// Tests
process.env.FOUNDERS_EMAILS = 'founder1@example.com,founder2@example.com';

try {
  assert.equal(isFounderEmail('founder1@example.com'), true, 'founder1 should be recognized');
  assert.equal(isFounderEmail('founder2@example.com'), true, 'founder2 should be recognized');
  assert.equal(isFounderEmail('user@example.com'), false, 'non-founder should not be recognized');
  console.log('FOUNDERS guard tests: PASSED');
  process.exit(0);
} catch (err) {
  console.error('FOUNDERS guard tests: FAILED', err);
  process.exit(1);
}
