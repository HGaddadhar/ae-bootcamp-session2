// @ts-check
const { defineConfig, devices } = require('@playwright/test');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3030';

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `PORT=${new URL(BACKEND_URL).port} npm run start:backend`,
      url: BACKEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
    {
      command: `PORT=${new URL(FRONTEND_URL).port} npm run start:frontend`,
      url: FRONTEND_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
  ],
});
