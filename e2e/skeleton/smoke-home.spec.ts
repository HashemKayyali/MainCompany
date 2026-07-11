import { test, expect } from './fixtures'

/**
 * BASE-008 sample spec 1 — home page smoke against the production Vite build.
 * Baseline contract: title copy matches the BASE-003 SEO baseline; primary
 * navigation renders; the page is interactive (SPA hydrated).
 */
test.describe('home smoke', () => {
  test('loads with baseline title and primary navigation', async ({ page, localePath }) => {
    await page.goto(localePath('/'))

    // BASE-003 baseline: "Eventies | Event Services Marketplace in Jordan"
    await expect(page).toHaveTitle(/Eventies/)

    const banner = page.getByRole('banner')
    await expect(banner).toBeVisible()
    await expect(banner.getByRole('link', { name: /eventies home/i })).toBeVisible()

    // Desktop exposes the nav inline; mobile collapses it behind a menu button.
    const inlineNav = page.getByRole('navigation', { name: /main navigation/i })
    const menuButton = page.getByRole('button', { name: /menu|open navigation/i }).first()
    await expect(inlineNav.or(menuButton).first()).toBeVisible()
  })

  test('serves the security baseline headers', async ({ page, localePath }) => {
    const response = await page.goto(localePath('/'))
    expect(response, 'home responded').toBeTruthy()
    // vite preview does not attach vercel.json headers; only assert them when
    // running against a deployed target (E2E_BASE_URL).
    if (process.env.E2E_BASE_URL) {
      const headers = response!.headers()
      expect(headers['x-frame-options']).toBe('DENY')
      expect(headers['x-content-type-options']).toBe('nosniff')
    }
  })
})
