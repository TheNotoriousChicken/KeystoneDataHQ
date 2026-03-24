const baseURL = process.env.TEST_API_BASE_URL || 'http://localhost:4000'
module.exports = {
  testDir: './tests/e2e',
  timeout: 30000,
  presubmit: [],
  retries: 0,
  use: {
    baseURL,
  },
  projects: [
    { name: 'Chromium', use: { browserName: 'chromium' } },
  ],
  reporter: 'dot',
}
