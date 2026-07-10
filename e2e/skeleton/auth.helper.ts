import type { Page } from '@playwright/test'

/**
 * BASE-008 — auth helper for the E2E skeleton.
 *
 * Password login through the real /login form. Credentials come from env so
 * no secret ever lives in the repo:
 *   E2E_USER_EMAIL / E2E_USER_PASSWORD
 *
 * Specs that need an authenticated session call `loginViaForm` and should
 * `test.skip(!hasAuthCredentials(), 'E2E_USER_* not configured')` — the Phase 0
 * sample specs are unauthenticated by design; authenticated flows arrive with
 * AU-FLOWS (P3) and reuse this helper via storageState.
 */
export function hasAuthCredentials(): boolean {
  return Boolean(process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD)
}

export async function loginViaForm(page: Page, localePath: (p: string) => string): Promise<void> {
  const email = process.env.E2E_USER_EMAIL
  const password = process.env.E2E_USER_PASSWORD
  if (!email || !password) throw new Error('E2E_USER_EMAIL / E2E_USER_PASSWORD are not set')

  await page.goto(localePath('/login'))
  await page.getByPlaceholder('Enter your email').fill(email)
  await page.getByPlaceholder('Enter your password').fill(password)
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  // Successful login navigates away from /login.
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 })
}
