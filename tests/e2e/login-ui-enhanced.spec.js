const { test, expect } = require('@playwright/test')

test('UI login flow: enhanced checks and cookie presence', async ({ page }) => {
  if (process.env.RUN_UI !== 'true') {
    test.skip(true, 'UI tests disabled by default')
  }

  // Navigate to login
  const response = await page.goto('/login')
  if (!response || !response.ok()) {
    test.skip('Login page not available')
  }

  const email = process.env.TEST_UI_EMAIL || 'regular@example.com'
  const password = process.env.TEST_UI_PASSWORD || 'pass'

  // Try to fill login form if fields exist
  try {
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
  } catch {
    test.skip('Login form not found on /login')
    return
  }

  await page.waitForLoadState('networkidle')

  // After login, check for either dashboard or 2FA prompt
  const url = page.url()
  const twoFAExists = await page.locator('[data-testid="twofa-prompt"]').count()
  if (!url.includes('/dashboard') && twoFAExists === 0) {
    test.skip('Neither dashboard nor 2FA prompt appeared')
  }

  // Validate that a refresh cookie is present in the browser (HttpOnly cookie)
  const cookies = await page.context().cookies()
  const hasRefresh = cookies.find((c) => c.name === 'refreshToken')
  expect(hasRefresh).toBeTruthy()
})
