import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? 4174)
const baseURL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npx vite --host 127.0.0.1 --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_SUPABASE_URL: 'http://localhost:54321',
      VITE_SUPABASE_ANON_KEY: 'e2e-anon-key',
    },
  },
  projects: [
    {
      name: 'chromium-small-android',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 360, height: 800 },
        browserName: 'chromium',
      },
    },
    {
      name: 'chromium-pixel',
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 412, height: 915 },
        browserName: 'chromium',
      },
    },
    {
      name: 'webkit-compact-iphone',
      use: {
        ...devices['iPhone SE'],
        viewport: { width: 375, height: 667 },
        browserName: 'webkit',
      },
    },
    {
      name: 'webkit-modern-iphone',
      use: {
        ...devices['iPhone 15'],
        viewport: { width: 430, height: 932 },
        browserName: 'webkit',
      },
    },
  ],
})
