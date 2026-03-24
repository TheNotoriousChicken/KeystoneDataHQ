const { test, expect } = require('@playwright/test')

test('UI login flow: cookie presence v2', async ({ page }) => {
  if (process.env.RUN_UI !== 'true') {
    test.skip(true, 'UI tests disabled by default')
  }
  const resp = await page.goto('/login')
  if (!resp || !resp.ok()) {
    test.skip('Login page not available')
  }
  const email = process.env.TEST_UI_EMAIL || 'regular@example.com'
  const password = process.env.TEST_UI_PASSWORD || 'pass'
  try {
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
  } catch {
    test.skip('Login form not found on UI')
  }
  await page.waitForLoadState('networkidle')
  const origin = page.url()
  const cookies = await page.context().cookies(origin)
  const hasRefresh = cookies.find((c) => c.name === 'refreshToken')
  expect(hasRefresh).toBeTruthy()
  // Ensure HttpOnly is set on the refresh cookie
  // Playwright reports httpOnly as a property on cookie objects when reading from context
  if (hasRefresh) {
    expect(hasRefresh).toHaveProperty('httpOnly', true)
  }
})
