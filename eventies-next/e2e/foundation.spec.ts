import { test, expect } from '@playwright/test'

/**
 * P1 plumbing E2E: locale SSR + headers + 404 behavior — the executable form
 * of the QG-P1 exit criteria that are verifiable without a deployment.
 */

function prefix(testInfo: { project: { metadata: Record<string, unknown> } }): string {
  return (testInfo.project.metadata.pathPrefix as string) ?? ''
}

test('locale page SSRs with correct lang/dir and hreflang set', async ({ page }, testInfo) => {
  const locale = (testInfo.project.metadata.appLocale as string) ?? 'en'
  await page.goto(prefix(testInfo) + '/')

  const html = page.locator('html')
  await expect(html).toHaveAttribute('lang', locale)
  await expect(html).toHaveAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
  // The real home renders the localized hero headline (replaces the P1
  // foundation `data-testid=locale-value` probe, which no longer exists).
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  const hreflangs = page.locator('link[rel="alternate"][hreflang]')
  await expect(hreflangs).toHaveCount(3) // en + ar + x-default
})

test('report-only security headers are present (FOUND-013)', async ({ page }, testInfo) => {
  const response = await page.goto(prefix(testInfo) + '/')
  const headers = response!.headers()
  expect(headers['content-security-policy-report-only']).toContain("default-src 'self'")
  expect(headers['strict-transport-security']).toContain('max-age=63072000')
  expect(headers['x-frame-options']).toBe('DENY')
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['permissions-policy']).toContain('camera=()')
})

test('unknown path returns a REAL HTTP 404 and is noindexed (ADR-23)', async ({ page }, testInfo) => {
  // ADR-23 (traditional cache model): missing routes now return a genuine 404
  // status, not a 200 shell. Also noindexed.
  const response = await page.goto(prefix(testInfo) + '/definitely-not-a-page')
  expect(response?.status()).toBe(404)
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached()
})

test('missing product returns a real HTTP 404 (CAT-010)', async ({ page }, testInfo) => {
  const response = await page.goto(prefix(testInfo) + '/products/definitely-not-a-real-product-xyz')
  expect(response?.status()).toBe(404)
})
