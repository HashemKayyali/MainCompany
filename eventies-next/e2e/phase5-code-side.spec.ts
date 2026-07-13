import { expect, test } from '@playwright/test'

test('realtime surfaces are localized and preserve bidi content', async ({ page }) => {
  await page.goto('/phase5-fixture')
  await expect(page.getByTestId('phase5-fixture')).toBeVisible()
  await expect(page.locator('[dir="auto"]')).toHaveCount(4)
  await expect(page.locator('html')).toHaveAttribute('dir', /ltr|rtl/)
})

test('message length is enforced and controls are keyboard reachable', async ({ page }) => {
  await page.goto('/phase5-fixture')
  const input = page.getByLabel(/Message|الرسالة/)
  await input.focus()
  await expect(input).toBeFocused()
  await expect(input).toHaveAttribute('maxlength', '4000')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: /Send message|إرسال الرسالة/ })).toBeFocused()
})

test('signed-out notification route preserves a safe return path', async ({ page }) => {
  await page.goto('/notifications')
  await expect(page).toHaveURL(/\/login\?redirect=.*notifications/)
})

test('chat widget is a lazy interactive island on public pages', async ({ page }) => {
  await page.goto('/about')
  const open = page.getByRole('button', { name: /Open support chat|فتح محادثة الدعم/ })
  await expect(open).toBeVisible()
  await open.click()
  await expect(page.getByRole('dialog', { name: /Eventies support|دعم إيفنتيز/ })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})
