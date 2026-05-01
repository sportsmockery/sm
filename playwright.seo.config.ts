import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/seo',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 4,
  reporter: [['list']],
  use: {
    baseURL: process.env.SEO_TEST_URL || 'https://test.sportsmockery.com',
    actionTimeout: 30_000,
  },
  timeout: 30_000,
})
