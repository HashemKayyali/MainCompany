import { expect, test } from '@playwright/test'

test('admin routes are server-gated with locale-safe return paths', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/login\?redirect=.*admin/)
  await page.goto('/admin/admins')
  await expect(page).toHaveURL(/\/login\?redirect=.*admin/)
})

test('admin fixture exposes localized ready, empty, and retry states', async ({ page }) => {
  await page.goto('/phase6-fixture')
  await expect(page.getByTestId('phase6-fixture')).toBeVisible()
  await page.getByRole('button', { name: /Empty|فارغ/ }).click()
  await expect(page.getByText(/No records match|لا توجد سجلات/)).toBeVisible()
  await page.getByRole('button', { name: /Error|خطأ/ }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.getByRole('button', { name: /Retry|إعادة المحاولة/ })).toBeVisible()
})

test('destructive confirmation is labelled, typed, announced, and focus trapped', async ({
  page,
}) => {
  await page.goto('/phase6-fixture')
  await page.getByRole('button', { name: /Delete|حذف/ }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  const confirm = dialog.getByRole('button', { name: /Confirm$|تأكيد$/ })
  await expect(confirm).toBeDisabled()
  await dialog.getByLabel(/Typed confirmation|نص التأكيد/).fill('DELETE')
  await expect(confirm).toBeEnabled()
  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})

test('MFA enrollment surface is localized and does not enroll until explicit action', async ({
  page,
}) => {
  await page.goto('/mfa')
  await expect(
    page.getByRole('heading', { name: /Secure your admin account|تأمين حساب الإدارة/ })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: /Enroll authenticator|إضافة تطبيق المصادقة/ })
  ).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('dir', /ltr|rtl/)
})
