import { test, expect } from './fixtures'

/**
 * BASE-008 sample spec 2 — public catalog smoke against the production Vite build.
 * Exercises live Supabase-backed data (products listing → product detail) and
 * the SPA not-found surface. These flows are the Group A cutover contract.
 */
test.describe('catalog smoke', () => {
  test('products listing renders live catalog and opens a product', async ({ page, localePath }) => {
    await page.goto(localePath('/products'))
    await expect(page).toHaveTitle(/Eventies/)

    const productLink = page.locator('a[href^="/products/"]').first()
    await expect(productLink, 'at least one product card from live data').toBeVisible({ timeout: 20_000 })

    const href = await productLink.getAttribute('href')
    // Pin the locator to the exact href: the listing reshuffles while data
    // streams in, so `.first()` may re-resolve to a different card between
    // reading the attribute and acting. Cards also animate continuously, so
    // Playwright's stability check never settles — dispatch the click event
    // directly (same React Router navigation path, no hit-testing).
    await page.locator(`a[href="${href}"]`).first().dispatchEvent('click')
    await page.waitForURL(`**${href}`)
    await expect(page.getByRole('heading').first()).toBeVisible({ timeout: 20_000 })
  })

  test('unknown route shows the not-found surface (SPA soft-404 baseline)', async ({ page, localePath }) => {
    await page.goto(localePath('/definitely-not-a-real-page-p0'))
    // Baseline truth (route-inventory D-P0-05 family): SPA serves the NotFound
    // page. Next reconstruction upgrades this to a real HTTP 404 (SEO-404).
    await expect(page.getByText(/not found|doesn['’]t exist|404/i).first()).toBeVisible({ timeout: 15_000 })
  })
})
