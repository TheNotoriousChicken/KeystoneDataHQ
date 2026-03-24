const { test, expect } = require('@playwright/test')

const BASE = '' // baseURL is provided by Playwright config as baseURL

test.describe('API login (E2E)', () => {
  test('login without 2FA via API', async ({ request }) => {
    const email = process.env.TEST_USER_EMAIL || 'regular@example.com'
    const password = process.env.TEST_USER_PASSWORD || 'pass'
    const res = await request.post('/api/auth/login', {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' }
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('token')
  })

  test('login with 2FA APP path (optional)', async ({ request }) => {
    const email = process.env.TEST_TWOFA_APP_EMAIL
    if (!email) { test.skip(); return }
    const password = process.env.TEST_TWOFA_APP_PASSWORD || 'pass'
    const res = await request.post('/api/auth/login', {
      data: { email, password },
      headers: { 'Content-Type': 'application/json' }
    })
    // Expect either 200 with token or 200 with 2FA prompt depending on account setup
    const body = await res.json()
    expect([200, 202]).toContain(res.status())
  })
})
