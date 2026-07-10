import { defineConfig, devices } from '@playwright/test'

/**
 * BASE-008 — Phase 0 E2E skeleton config.
 *
 * Runs against the **production Vite build** (`vite preview` over dist/), unlike
 * playwright.config.ts which targets the dev server with stubbed Supabase env.
 * Build first: `npm run build`, then `npm run test:e2e:baseline`.
 *
 * Projects span locale (en/ar) × form factor (desktop/mobile). The Vite app is
 * EN-only; the `locale` dimension is wired now so the same specs run unchanged
 * against the Next preview once /ar exists (FOUND-030 flips LOCALE_PREFIXES).
 */
const PORT = Number(process.env.PLAYWRIGHT_BASELINE_PORT ?? 4175)
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`
const useLocalServer = !process.env.E2E_BASE_URL

export default defineConfig({
  testDir: './e2e/skeleton',
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
        command: `npx vite preview --host 127.0.0.1 --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      }
    : undefined,
  projects: [
    { name: 'en-desktop', use: { ...devices['Desktop Chrome'], locale: 'en-US' }, metadata: { appLocale: 'en' } },
    { name: 'en-mobile', use: { ...devices['Pixel 7'], locale: 'en-US' }, metadata: { appLocale: 'en' } },
    { name: 'ar-desktop', use: { ...devices['Desktop Chrome'], locale: 'ar-JO' }, metadata: { appLocale: 'ar' } },
    { name: 'ar-mobile', use: { ...devices['Pixel 7'], locale: 'ar-JO' }, metadata: { appLocale: 'ar' } },
  ],
})
