import { test as setup, expect } from '@playwright/test'

const AUTH_FILE = 'e2e/.auth/user.json'

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_ADMIN_EMAIL
  const password = process.env.TEST_ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD env vars are required.\n' +
      'Run: TEST_ADMIN_EMAIL=you@example.com TEST_ADMIN_PASSWORD=xxx npx playwright test'
    )
  }

  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for redirect to admin
  await page.waitForURL(/\/(admin|studio)/, { timeout: 15_000 })
  await expect(page).not.toHaveURL(/\/login/)

  await page.context().storageState({ path: AUTH_FILE })
})
