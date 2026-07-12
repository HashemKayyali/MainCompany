import { expect, test } from '@playwright/test'

const prefix = (testInfo: { project: { metadata: Record<string, unknown> } }) =>
  (testInfo.project.metadata.pathPrefix as string) ?? ''

test('customer routes are session gated with a safe return path', async ({ page }, testInfo) => {
  await page.goto(`${prefix(testInfo)}/my-requests`)
  await expect(page).toHaveURL(/\/login\?redirect=/)
  await expect(page.locator('form')).toBeVisible()
})

test('transaction route preserves redirect intent when signed out', async ({ page }, testInfo) => {
  await page.goto(`${prefix(testInfo)}/checkout`)
  await expect(page).toHaveURL(/\/login\?redirect=/)
})

test('safe fixture renders localized status, items, and journey', async ({ page }, testInfo) => {
  await page.goto(`${prefix(testInfo)}/phase4-fixture`)
  await expect(page.getByText('RR-FIXTURE')).toBeVisible()
  await expect(page.getByText('Fixture Service')).toBeVisible()
  await expect(page.locator('ol')).toBeVisible()
})

test('safe fixture exposes empty and retry states', async ({ page }, testInfo) => {
  await page.goto(`${prefix(testInfo)}/phase4-fixture?state=empty`)
  await expect(page.locator('h1')).toBeVisible()
  await page.goto(`${prefix(testInfo)}/phase4-fixture?state=error`)
  await expect(page.locator('main').getByRole('button')).toBeVisible()
})
