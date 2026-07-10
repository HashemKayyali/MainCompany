import { expect, test, type Page } from '@playwright/test'
import {
  PUBLIC_ROUTES,
  assertBodyUnlocked,
  assertNoHorizontalOverflow,
  chatRoot,
  closeChat,
  installApiMocks,
  installAuthenticatedSession,
  installConsoleGuards,
  openChat,
  waitForAppReady,
} from './fixtures'

test.beforeEach(async ({ page }) => {
  await installApiMocks(page)
})

const OVERFLOW_WIDTHS = [320, 360, 375, 390, 412, 430]

async function gotoApp(page: Page, route: string) {
  await page.goto(route, { waitUntil: 'domcontentloaded' })
  await waitForAppReady(page)
}

async function navigateFromMobileMenu(page: Page, href: string) {
  const drawer = page.locator('[role="dialog"][aria-label*="navigation" i]')
  await page.locator('header button[aria-label="Menu"]').click()
  await expect(drawer).toBeVisible()
  await drawer.locator(`a[href="${href}"]`).first().click()
  await expect(page).toHaveURL(new RegExp(`${href.replace(/\//g, '\\/')}$`))
  await expect(drawer).toHaveCount(0)
}

async function goBackTo(page: Page, pattern: RegExp) {
  await page.goBack({ waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(pattern)
}

async function goForwardTo(page: Page, pattern: RegExp) {
  await page.goForward({ waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(pattern)
}

async function openBikeBlenderFromProducts(page: Page) {
  const link = page.getByRole('link', { name: /^Open Bike Blender$/ }).first()
  await link.scrollIntoViewIfNeeded()
  await link.click()
  await expect(page).toHaveURL(/\/products\/bike-blender$/)
}

async function openProductZoom(page: Page) {
  const firstPhoto = page.locator('button[aria-label*="View photo" i]').first()
  if (await firstPhoto.count()) await firstPhoto.click()
  const enlarge = page.locator('button[aria-label*="Enlarge" i]').first()
  await expect(enlarge).toBeVisible()
  await enlarge.click()
  await expect(page.locator('.fixed.inset-0').filter({ has: page.locator('img') }).first()).toBeVisible()
}

test('chat back navigation does not resurrect transient state', async ({ page }) => {
  test.setTimeout(120_000)
  const guard = await installConsoleGuards(page)

  await gotoApp(page, '/')
  await page.evaluate(() => window.scrollTo(0, 180))
  const homeScroll = await page.evaluate(() => window.scrollY)

  await openChat(page)
  await closeChat(page)
  await navigateFromMobileMenu(page, '/products')
  await goBackTo(page, /\/$/)

  await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName.toLowerCase())).not.toBe('textarea')
  await assertBodyUnlocked(page)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.max(0, homeScroll - 40))

  await navigateFromMobileMenu(page, '/products')
  await openChat(page)
  await goBackTo(page, /\/$/)
  await assertBodyUnlocked(page)
  await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveCount(0)
  await goForwardTo(page, /\/products$/)
  await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveCount(0)
  await assertBodyUnlocked(page)

  guard.assertClean()
})

test('repeated history stress does not leak chat or body lock', async ({ page }) => {
  test.setTimeout(150_000)
  const guard = await installConsoleGuards(page)
  await gotoApp(page, '/')

  for (let index = 0; index < 2; index += 1) {
    await openChat(page)
    await closeChat(page)
    await navigateFromMobileMenu(page, '/products')
    await openBikeBlenderFromProducts(page)
    await goBackTo(page, /\/products$/)
    await goBackTo(page, /\/$/)
    await goForwardTo(page, /\/products$/)
    await goForwardTo(page, /\/products\/bike-blender$/)
    await goBackTo(page, /\/products$/)
    await goBackTo(page, /\/$/)
    await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveCount(0)
    await assertBodyUnlocked(page)
  }

  guard.assertClean()
})

test('chat scroll lock restores page position', async ({ page }) => {
  const guard = await installConsoleGuards(page)
  await gotoApp(page, '/products')
  await page.evaluate(() => window.scrollTo(0, Math.min(900, document.documentElement.scrollHeight - innerHeight)))
  const before = await page.evaluate(() => window.scrollY)

  await openChat(page)
  await expect.poll(() => page.evaluate(() => ({
    locked: document.documentElement.dataset.scrollLocked,
    position: document.body.style.position,
    top: document.body.style.top,
  }))).toEqual({
    locked: 'true',
    position: 'fixed',
    top: `-${before}px`,
  })

  await closeChat(page)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.max(0, before - 8))
  await assertBodyUnlocked(page)

  guard.assertClean()
})

test('authenticated chat composer uses mobile-safe font and releases focus', async ({ page, browserName }) => {
  test.skip(browserName !== 'webkit', 'Composer geometry is explicitly verified on mobile WebKit projects.')
  const guard = await installConsoleGuards(page)
  await installAuthenticatedSession(page)

  await gotoApp(page, '/')
  await openChat(page)

  const composer = page.locator('section[role="dialog"] textarea').first()
  await expect(composer).toBeVisible()
  await composer.focus()

  await expect.poll(() => composer.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16)
  const geometry = await page.evaluate(() => {
    const panel = document.querySelector('section[role="dialog"]')?.getBoundingClientRect()
    const viewport = window.visualViewport
    return {
      panelTop: panel?.top ?? -1,
      panelBottom: panel?.bottom ?? -1,
      viewportTop: viewport?.offsetTop ?? 0,
      viewportBottom: (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight),
    }
  })
  expect(geometry.panelTop).toBeGreaterThanOrEqual(geometry.viewportTop - 2)
  expect(geometry.panelBottom).toBeLessThanOrEqual(geometry.viewportBottom + 2)

  await closeChat(page)
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName.toLowerCase())).not.toBe('textarea')
  await openChat(page)
  await expect.poll(() => page.evaluate(() => document.activeElement?.tagName.toLowerCase())).not.toBe('textarea')

  guard.assertClean()
})

test('rapid chat interactions do not leave pointer-blocking locks', async ({ page }) => {
  test.setTimeout(120_000)
  const guard = await installConsoleGuards(page)
  await gotoApp(page, '/')

  for (let index = 0; index < 4; index += 1) {
    await openChat(page)
    await closeChat(page)
  }

  await navigateFromMobileMenu(page, '/products')
  await goBackTo(page, /\/$/)
  await openChat(page)
  await goForwardTo(page, /\/products$/)
  await assertBodyUnlocked(page)

  await navigateFromMobileMenu(page, '/contact')
  await expect(page.locator('main')).toBeVisible()

  guard.assertClean()
})

test('modal, navbar, notification and lightbox overlays close on route navigation', async ({ page }) => {
  test.setTimeout(120_000)
  const guard = await installConsoleGuards(page)
  await installAuthenticatedSession(page)

  await gotoApp(page, '/')
  await page.locator('header button[aria-label="Menu"]').click()
  await expect(page.locator('[role="dialog"][aria-label*="navigation" i]')).toBeVisible()
  await page.locator('[role="dialog"][aria-label*="navigation" i] a[href="/products"]').click()
  await expect(page).toHaveURL(/\/products$/)
  await expect(page.locator('[role="dialog"][aria-label*="navigation" i]')).toHaveCount(0)
  await assertBodyUnlocked(page)

  await goBackTo(page, /\/$/)
  const notificationButton = page.locator('button[aria-haspopup="dialog"][aria-label="Notifications"]').first()
  await expect(notificationButton).toBeVisible()
  await notificationButton.click()
  await expect(page.locator('[role="dialog"][aria-label="Notifications"]')).toBeVisible()
  await goForwardTo(page, /\/products$/)
  await expect(page.locator('[role="dialog"][aria-label="Notifications"]')).toHaveCount(0)

  await gotoApp(page, '/gallery')
  await page.locator('button[aria-label="E2E Gallery - photo 1"]').click()
  await expect(page.locator('[role="dialog"][aria-label*="Image gallery" i]')).toBeVisible()
  await goBackTo(page, /\/products$/)
  await assertBodyUnlocked(page)

  await openBikeBlenderFromProducts(page)
  await openProductZoom(page)
  await goBackTo(page, /\/products$/)
  await assertBodyUnlocked(page)
  await expect(page.locator('#main-content')).toBeVisible()

  guard.assertClean()
})

test('Arabic mode keeps transient UI and directional controls usable', async ({ page }) => {
  const guard = await installConsoleGuards(page)
  await gotoApp(page, '/')

  await page.locator('header button[aria-label="Menu"]').click()
  await page.locator('[role="dialog"][aria-label*="navigation" i] button').filter({ hasText: /^AR$/ }).click()
  await expect(page.locator('[role="dialog"][aria-label*="navigation" i]')).toHaveCount(0)
  await expect.poll(() => page.evaluate(() => document.documentElement.dir)).toBe('rtl')

  await openChat(page)
  await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveAttribute('dir', 'rtl')
  await closeChat(page)

  await gotoApp(page, '/gallery')
  await page.locator('button[aria-label="E2E Gallery - photo 1"]').click()
  const lightbox = page.locator('[role="dialog"][aria-label*="Image gallery" i]')
  await expect(lightbox).toBeVisible()
  await lightbox.locator('button').nth(1).click()
  await expect(lightbox.locator('[aria-live="polite"]')).toContainText(/2\s*\/\s*3/)
  await page.keyboard.press('Escape')
  await assertBodyUnlocked(page)

  guard.assertClean()
})

test('browser fixture keeps nested body scroll locks owned until the final release', async ({ page }) => {
  test.setTimeout(60_000)
  const guard = await installConsoleGuards(page)
  await page.goto('/e2e/lock-fixture.html', { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => window.scrollTo(0, 420))
  const before = await page.evaluate(() => window.scrollY)

  await page.getByTestId('lock-a').click()
  await expect.poll(() => page.evaluate(() => ({
    locked: document.documentElement.dataset.scrollLocked,
    position: document.body.style.position,
    top: document.body.style.top,
  }))).toEqual({
    locked: 'true',
    position: 'fixed',
    top: `-${before}px`,
  })

  await page.getByTestId('lock-b').click()
  await page.getByTestId('lock-a').click()
  await expect.poll(() => page.evaluate(() => ({
    locked: document.documentElement.dataset.scrollLocked,
    position: document.body.style.position,
  }))).toEqual({ locked: 'true', position: 'fixed' })

  await page.getByTestId('lock-b').click()
  await assertBodyUnlocked(page)
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.max(0, before - 2))

  guard.assertClean()
})

for (const width of OVERFLOW_WIDTHS) {
  test(`horizontal overflow at ${width}px on public routes`, async ({ page }, testInfo) => {
    test.setTimeout(75_000)
    test.skip(testInfo.project.name !== 'chromium-small-android', 'Width matrix runs once; browser/device projects cover interaction behavior.')
    const guard = await installConsoleGuards(page)

    await page.setViewportSize({ width, height: 800 })
    for (const route of PUBLIC_ROUTES) {
      await test.step(`${route} at ${width}px`, async () => {
        await assertNoHorizontalOverflow(page, route)
      })
    }

    guard.assertClean()
  })
}
