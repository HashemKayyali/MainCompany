import { expect, test } from '@playwright/test'

function prefix(testInfo: { project: { metadata: Record<string, unknown> } }): string {
  return (testInfo.project.metadata.pathPrefix as string) ?? ''
}

test('auth pages are localized and noindexed', async ({ page }, testInfo) => {
  const response = await page.goto(`${prefix(testInfo)}/login`)
  expect(response?.status()).toBe(200)
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  await expect(page.locator('form')).toBeVisible()
})

test('contact form handler rejects a missing Turnstile token', async ({ request }) => {
  const response = await request.post('/api/forms/contact', {
    data: {
      name: 'Phase Three',
      email: 'phase3@example.com',
      phone: '',
      message: 'This request has no security challenge token.',
      turnstileToken: '',
    },
  })
  expect(response.status()).toBe(403)
  await expect(response.json()).resolves.toMatchObject({ ok: false, code: 'CHALLENGE' })
})

test('public mutation handlers reject cross-site requests', async ({ request }) => {
  const response = await request.post('/api/forms/contact', {
    headers: { origin: 'https://evil.example', 'sec-fetch-site': 'cross-site' },
    data: {},
  })
  expect(response.status()).toBe(403)
  await expect(response.json()).resolves.toMatchObject({ ok: false, code: 'ORIGIN' })
})
