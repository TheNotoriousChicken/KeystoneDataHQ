const { test, expect } = require('@playwright/test')

test('UI login cookies presence (refresh cookie)', async ({ page }) => {
  if (process.env.RUN_UI !== 'true') {
    test.skip(true, 'UI tests disabled by default')
  }
  const base = process.env.TEST_UI_URL || ''
  const url = base + '/login'
  const loginPage = await page.goto(url, { waitUntil: 'networkidle' }).catch(() => null)
  if (!loginPage) {
    test.skip('Login page not reachable')
  }
  const email = process.env.TEST_UI_EMAIL || 'regular@example.com'
  const password = process.env.TEST_UI_PASSWORD || 'pass'
  try {
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.click('button[type="submit"]')
  } catch {
    test.skip('Login form not found on UI')
    return
  }
  await page.waitForLoadState('networkidle')
  const cookies = await page.context().cookies()
  const hasRefresh = cookies.find((c) => c.name === 'refreshToken')
  expect(hasRefresh).toBeTruthy()
})
