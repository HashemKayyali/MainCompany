import { defineConfig, devices } from '@playwright/test'

/**
 * FOUND-030 — E2E projects in the new app: en/ar × desktop/mobile, targeting
 * the local prod build by default and a preview URL via E2E_BASE_URL in CI.
 * Mirrors the Phase-0 skeleton (playwright.baseline.config.ts in the Vite
 * repo) so specs stay portable between the two.
 */
const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 3457)
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`
const useLocalServer = !process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: useLocalServer
    ? {
        command: `npm run start -- -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      }
    : undefined,
  projects: [
    { name: 'en-desktop', use: { ...devices['Desktop Chrome'], locale: 'en-US' }, metadata: { appLocale: 'en', pathPrefix: '' } },
    { name: 'en-mobile', use: { ...devices['Pixel 7'], locale: 'en-US' }, metadata: { appLocale: 'en', pathPrefix: '' } },
    { name: 'ar-desktop', use: { ...devices['Desktop Chrome'], locale: 'ar-JO' }, metadata: { appLocale: 'ar', pathPrefix: '/ar' } },
    { name: 'ar-mobile', use: { ...devices['Pixel 7'], locale: 'ar-JO' }, metadata: { appLocale: 'ar', pathPrefix: '/ar' } },
  ],
})
