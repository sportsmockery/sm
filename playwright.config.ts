import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['html', { outputFolder: 'docs/PostIQ_Test/playwright-report' }],
    ['list'],
  ],
  use: {
    baseURL: process.env.TEST_URL || 'https://test.sportsmockery.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
  },
  timeout: 120_000,
  projects: [
    {
      name: 'api-tests',
      testMatch: /postiq-api\.spec\.ts/,
    },
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'ui-tests',
      testMatch: /postiq-ui\.spec\.ts/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
    },
  ],
})
