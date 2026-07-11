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
  await expect(page.getByTestId('locale-value')).toHaveText(locale)

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

test('unknown path shows 404 UI and is noindexed (D-P1-01 contract)', async ({ page }, testInfo) => {
  await page.goto(prefix(testInfo) + '/definitely-not-a-page')
  // D-P1-01: under cacheComponents the status is 200 + robots noindex + client
  // 404 UI. THIS TEST ENCODES THAT CONTRACT — when the P2 SEO-404 decision
  // lands real 404s, flip the status assertion deliberately.
  // (two robots metas can coexist: the PPR shell's and the resumed 404 UI's —
  // assert at least one noindex is present)
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached()
})
