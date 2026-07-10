# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-stability.spec.ts >> rapid chat interactions do not leave pointer-blocking locks
- Location: e2e\mobile-stability.spec.ts:172:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: locator.click: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('[role="dialog"][aria-label*="navigation" i]').locator('a[href="/contact"]').first()
    - locator resolved to <a href="/contact" class="inline-flex min-h-[46px] items-center rounded-xl border px-3.5 font-display text-[13px] font-semibold transition-all border-violet-100 bg-white text-ink-700 hover:bg-violet-50">Contact</a>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is not stable
  - retrying click action
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - link "Skip to content" [ref=e4]:
    - /url: "#main-content"
  - generic [ref=e5]:
    - banner [ref=e6]:
      - generic [ref=e8]:
        - link "Eventies home" [ref=e9]:
          - /url: /
        - generic [ref=e11]:
          - link "Request draft" [ref=e12]:
            - /url: /rental-cart
            - img [ref=e14]
          - link [ref=e18]:
            - /url: /login
            - img [ref=e20]
          - button "Menu" [expanded] [ref=e23] [cursor=pointer]:
            - img [ref=e24]
      - dialog "Mobile navigation" [ref=e28]:
        - generic [ref=e31]:
          - button "Switch to Arabic" [ref=e32] [cursor=pointer]:
            - img [ref=e33]
            - generic [ref=e37]: AR
          - button "Close menu" [ref=e38] [cursor=pointer]:
            - img [ref=e39]
        - generic [ref=e42]:
          - img [ref=e43]
          - textbox "Search" [ref=e46]:
            - /placeholder: Search categories or services...
        - generic [ref=e47]:
          - link "Home" [ref=e48]:
            - /url: /
          - link "Services" [ref=e49]:
            - /url: /products
          - link "Custom Builds" [ref=e50]:
            - /url: /custom-builds
          - link "Customers" [ref=e51]:
            - /url: /customers
          - link "Gallery" [ref=e52]:
            - /url: /gallery
          - link "About" [ref=e53]:
            - /url: /about
          - link "Contact" [ref=e54]:
            - /url: /contact
        - link "Categories" [ref=e55]:
          - /url: /categories
          - generic [ref=e56]:
            - img [ref=e57]
            - text: Categories
          - img [ref=e62]
        - generic [ref=e64]:
          - link "Request Draft" [ref=e65]:
            - /url: /rental-cart
            - img [ref=e66]
            - text: Request Draft
          - link "Login" [ref=e70]:
            - /url: /login
            - img [ref=e71]
            - text: Login
    - main [ref=e74]:
      - generic [ref=e76]:
        - generic [ref=e77]:
          - generic [ref=e78]:
            - img [ref=e79]
            - generic [ref=e82]: Service Catalog - Jordan
          - heading "Discover event services and rentals for every kind of occasion." [level=1] [ref=e83]
          - paragraph [ref=e84]: Browse interactive games, screens, booths, production support, and event services from trusted providers across Jordan. Compare options and submit a rental or purchase quote request for review.
          - generic [ref=e85]:
            - link "Browse Services" [ref=e86]:
              - /url: "#products-catalog"
              - text: Browse Services
              - img [ref=e87]
            - link "Explore Categories" [ref=e89]:
              - /url: /categories
          - generic [ref=e90]:
            - generic [ref=e91]: Browse
            - link "Eventies" [ref=e92]:
              - /url: /categories/eventies
            - link "The Terminal VR" [ref=e93]:
              - /url: /categories/terminal-vr
        - generic [ref=e94]:
          - link "Bike Tower Bike Beam Bike Race Eventies Bike Tower Eventies Bike Beam Eventies Bike Race" [ref=e97]:
            - /url: /products/bike-race
            - generic [ref=e98]:
              - img "Bike Tower" [ref=e100]
              - img "Bike Beam" [ref=e102]
              - img "Bike Race" [ref=e104]
            - generic [ref=e107]:
              - generic [ref=e108]:
                - generic [ref=e109]: Eventies
                - heading "Bike Tower" [level=3] [ref=e110]
              - generic [ref=e111]:
                - generic [ref=e112]: Eventies
                - heading "Bike Beam" [level=3] [ref=e113]
              - generic [ref=e114]:
                - generic [ref=e115]: Eventies
                - heading "Bike Race" [level=3] [ref=e116]
          - link "Bike Branding Bike Race Bike VR Eventies Bike Branding Eventies Bike Race The Terminal VR Bike VR" [ref=e119]:
            - /url: /products/bike-vr
            - generic [ref=e120]:
              - img "Bike Branding" [ref=e122]
              - img "Bike Race" [ref=e124]
              - img "Bike VR" [ref=e126]
            - generic [ref=e129]:
              - generic [ref=e130]:
                - generic [ref=e131]: Eventies
                - heading "Bike Branding" [level=3] [ref=e132]
              - generic [ref=e133]:
                - generic [ref=e134]: Eventies
                - heading "Bike Race" [level=3] [ref=e135]
              - generic [ref=e136]:
                - generic [ref=e137]: The Terminal VR
                - heading "Bike VR" [level=3] [ref=e138]
          - link "Bike VR Bike Branding The Terminal VR Bike VR Eventies Bike Branding" [ref=e141]:
            - /url: /products/bike-branding
            - generic [ref=e142]:
              - img "Bike VR" [ref=e144]
              - img "Bike Branding" [ref=e146]
            - generic [ref=e149]:
              - generic [ref=e150]:
                - generic [ref=e151]: The Terminal VR
                - heading "Bike VR" [level=3] [ref=e152]
              - generic [ref=e153]:
                - generic [ref=e154]: Eventies
                - heading "Bike Branding" [level=3] [ref=e155]
          - link "Bike Tower Eventies Bike Tower" [ref=e158]:
            - /url: /products/bike-tower
            - img "Bike Tower" [ref=e161]
            - generic [ref=e165]:
              - generic [ref=e166]: Eventies
              - heading "Bike Tower" [level=3] [ref=e167]
          - link "Bike Blender Eventies Bike Blender" [ref=e170]:
            - /url: /products/bike-blender
            - img "Bike Blender" [ref=e173]
            - generic [ref=e177]:
              - generic [ref=e178]: Eventies
              - heading "Bike Blender" [level=3] [ref=e179]
      - generic [ref=e182]:
        - generic [ref=e183]:
          - generic [ref=e186]: Services
          - heading "Discover event services and rentals for every kind of occasion." [level=2] [ref=e188]
          - paragraph [ref=e189]: Filter the catalog by category, compare the available options, and open any service to rent it or request a purchase quote for review.
        - generic [ref=e190]:
          - generic [ref=e191]:
            - generic [ref=e192]:
              - generic [ref=e193]:
                - generic [ref=e194]:
                  - img [ref=e195]
                  - generic [ref=e196]: Service category
                - heading "Service Catalog" [level=2] [ref=e197]
              - generic [ref=e198]:
                - img [ref=e199]
                - generic [ref=e204]: "6"
                - generic [ref=e205]: total services
            - generic [ref=e207]:
              - button "All (6)" [ref=e208] [cursor=pointer]
              - button "✨ Eventies (5)" [ref=e209] [cursor=pointer]
              - button "🥽 The Terminal VR (1)" [ref=e210] [cursor=pointer]
          - separator [ref=e211]
          - generic [ref=e213]:
            - article [ref=e214] [cursor=pointer]:
              - link "Open Bike Blender" [ref=e215]:
                - /url: /products/bike-blender
                - img "Bike Blender" [ref=e216]
                - generic [ref=e217]:
                  - generic [ref=e218]: Featured
                  - generic [ref=e219]: Most Popular
              - generic [ref=e221]:
                - generic [ref=e224]: Eventies
                - generic [ref=e225]:
                  - link "Bike Blender" [ref=e226]:
                    - /url: /products/bike-blender
                    - heading "Bike Blender" [level=3] [ref=e227]
                  - paragraph [ref=e228]: Pedal-powered smoothie station. Ride the bike, blend your own fresh drink live.
                - generic [ref=e230]:
                  - generic [ref=e231]: Per Day
                  - generic [ref=e232]: 250 JOD
                - generic [ref=e233]:
                  - button "Add to Rental" [ref=e234]:
                    - img [ref=e235]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e239]:
                    - img [ref=e240]
                    - text: Request Quote
            - article [ref=e243] [cursor=pointer]:
              - link "Open Bike Tower" [ref=e244]:
                - /url: /products/bike-tower
                - img "Bike Tower" [ref=e245]
                - generic [ref=e246]:
                  - generic [ref=e247]: Featured
                  - generic [ref=e248]: Competitive
              - generic [ref=e250]:
                - generic [ref=e253]: Eventies
                - generic [ref=e254]:
                  - link "Bike Tower" [ref=e255]:
                    - /url: /products/bike-tower
                    - heading "Bike Tower" [level=3] [ref=e256]
                  - paragraph [ref=e257]: Two-player LED tower race. Pedal to light up your tower first.
                - generic [ref=e259]:
                  - generic [ref=e260]: Per Day
                  - generic [ref=e261]: 350 JOD
                - generic [ref=e262]:
                  - button "Add to Rental" [ref=e263]:
                    - img [ref=e264]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e268]:
                    - img [ref=e269]
                    - text: Request Quote
            - article [ref=e272] [cursor=pointer]:
              - link "Open Bike VR" [ref=e273]:
                - /url: /products/bike-vr
                - img "Bike VR" [ref=e274]
                - generic [ref=e275]:
                  - generic [ref=e276]: Featured
                  - generic [ref=e277]: Immersive
              - generic [ref=e279]:
                - generic [ref=e282]: The Terminal VR
                - generic [ref=e283]:
                  - link "Bike VR" [ref=e284]:
                    - /url: /products/bike-vr
                    - heading "Bike VR" [level=3] [ref=e285]
                  - paragraph [ref=e286]: VR cycling through stunning digital worlds.
                - generic [ref=e288]:
                  - generic [ref=e289]: Per Day
                  - generic [ref=e290]: 400 JOD
                - generic [ref=e291]:
                  - button "Add to Rental" [ref=e292]:
                    - img [ref=e293]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e297]:
                    - img [ref=e298]
                    - text: Request Quote
            - article [ref=e301] [cursor=pointer]:
              - link "Open Bike Race" [ref=e302]:
                - /url: /products/bike-race
                - img "Bike Race" [ref=e303]
                - generic [ref=e305]: Racing
              - generic [ref=e307]:
                - generic [ref=e310]: Eventies
                - generic [ref=e311]:
                  - link "Bike Race" [ref=e312]:
                    - /url: /products/bike-race
                    - heading "Bike Race" [level=3] [ref=e313]
                  - paragraph [ref=e314]: Live cycling race with real-time stats on screen.
                - generic [ref=e316]:
                  - generic [ref=e317]: Per Day
                  - generic [ref=e318]: 300 JOD
                - generic [ref=e319]:
                  - button "Add to Rental" [ref=e320]:
                    - img [ref=e321]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e325]:
                    - img [ref=e326]
                    - text: Request Quote
            - article [ref=e329] [cursor=pointer]:
              - link "Open Bike Branding" [ref=e330]:
                - /url: /products/bike-branding
                - img "Bike Branding" [ref=e331]
                - generic [ref=e333]: Custom
              - generic [ref=e335]:
                - generic [ref=e338]: Eventies
                - generic [ref=e339]:
                  - link "Bike Branding" [ref=e340]:
                    - /url: /products/bike-branding
                    - heading "Bike Branding" [level=3] [ref=e341]
                  - paragraph [ref=e342]: Fully branded cycling experience.
                - generic [ref=e344]:
                  - generic [ref=e345]: Per Day
                  - generic [ref=e346]: 150 JOD
                - generic [ref=e347]:
                  - button "Add to Rental" [ref=e348]:
                    - img [ref=e349]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e353]:
                    - img [ref=e354]
                    - text: Request Quote
            - article [ref=e357] [cursor=pointer]:
              - link "Open Bike Beam" [ref=e358]:
                - /url: /products/bike-beam
                - img "Bike Beam" [ref=e359]
                - generic [ref=e361]: LED Show
              - generic [ref=e363]:
                - generic [ref=e366]: Eventies
                - generic [ref=e367]:
                  - link "Bike Beam" [ref=e368]:
                    - /url: /products/bike-beam
                    - heading "Bike Beam" [level=3] [ref=e369]
                  - paragraph [ref=e370]: Pedal-powered LED beam. Harder you ride, brighter the show.
                - generic [ref=e372]:
                  - generic [ref=e373]: Per Day
                  - generic [ref=e374]: 300 JOD
                - generic [ref=e375]:
                  - button "Add to Rental" [ref=e376]:
                    - img [ref=e377]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e381]:
                    - img [ref=e382]
                    - text: Request Quote
    - contentinfo "Site footer" [ref=e385]:
      - generic [ref=e387]:
        - generic [ref=e388]:
          - generic [ref=e390]:
            - link "Eventies home" [ref=e391]:
              - /url: /
              - img "Eventies" [ref=e392]
            - paragraph [ref=e393]: Eventies helps clients discover event services, compare trusted providers across Jordan, and submit clear requests from one organized marketplace.
            - generic [ref=e394]:
              - img [ref=e395]
              - generic [ref=e398]: Trusted event services marketplace
            - generic [ref=e399]:
              - link "Follow Eventies on Instagram" [ref=e400]:
                - /url: https://instagram.com/bike_blender
                - img [ref=e401]
              - link "Follow Eventies on Facebook" [ref=e404]:
                - /url: https://facebook.com/BikeBlender
                - img [ref=e405]
              - link "Follow Eventies on WhatsApp" [ref=e407]:
                - /url: https://wa.me/962788611234
                - img [ref=e408]
          - generic [ref=e410]:
            - group [ref=e411]:
              - generic "Categories" [ref=e412] [cursor=pointer]:
                - generic [ref=e413]: Categories
                - img [ref=e415]
            - group [ref=e417]:
              - generic "Company" [ref=e418] [cursor=pointer]:
                - generic [ref=e419]: Company
                - img [ref=e421]
            - group [ref=e423]:
              - generic "Support" [ref=e424] [cursor=pointer]:
                - generic [ref=e425]: Support
                - img [ref=e427]
            - group [ref=e429]:
              - generic "Legal" [ref=e430] [cursor=pointer]:
                - generic [ref=e431]: Legal
                - img [ref=e433]
            - group [ref=e435]:
              - generic "Contact" [ref=e436] [cursor=pointer]:
                - generic [ref=e437]: Contact
                - img [ref=e439]
        - generic [ref=e442]:
          - paragraph [ref=e443]: © 2026 Eventies. All rights reserved.
          - generic [ref=e444]:
            - link "Privacy" [ref=e445]:
              - /url: /privacy-policy
            - link "Terms" [ref=e446]:
              - /url: /terms
            - link "Cookies" [ref=e447]:
              - /url: /cookie-policy
            - generic [ref=e448]: Made in Jordan
    - button "Chat with Eventies" [ref=e451] [cursor=pointer]:
      - img [ref=e453]
```

# Test source

```ts
  1   | import { expect, test, type Page } from '@playwright/test'
  2   | import {
  3   |   PUBLIC_ROUTES,
  4   |   assertBodyUnlocked,
  5   |   assertNoHorizontalOverflow,
  6   |   chatRoot,
  7   |   closeChat,
  8   |   installApiMocks,
  9   |   installAuthenticatedSession,
  10  |   installConsoleGuards,
  11  |   openChat,
  12  |   waitForAppReady,
  13  | } from './fixtures'
  14  | 
  15  | test.beforeEach(async ({ page }) => {
  16  |   await installApiMocks(page)
  17  | })
  18  | 
  19  | const OVERFLOW_WIDTHS = [320, 360, 375, 390, 412, 430]
  20  | 
  21  | async function gotoApp(page: Page, route: string) {
  22  |   await page.goto(route, { waitUntil: 'domcontentloaded' })
  23  |   await waitForAppReady(page)
  24  | }
  25  | 
  26  | async function navigateFromMobileMenu(page: Page, href: string) {
  27  |   const drawer = page.locator('[role="dialog"][aria-label*="navigation" i]')
  28  |   await page.locator('header button[aria-label="Menu"]').click()
  29  |   await expect(drawer).toBeVisible()
> 30  |   await drawer.locator(`a[href="${href}"]`).first().click()
      |                                                     ^ Error: locator.click: Test timeout of 120000ms exceeded.
  31  |   await expect(page).toHaveURL(new RegExp(`${href.replace(/\//g, '\\/')}$`))
  32  |   await expect(drawer).toHaveCount(0)
  33  | }
  34  | 
  35  | async function goBackTo(page: Page, pattern: RegExp) {
  36  |   await page.goBack({ waitUntil: 'domcontentloaded' })
  37  |   await expect(page).toHaveURL(pattern)
  38  | }
  39  | 
  40  | async function goForwardTo(page: Page, pattern: RegExp) {
  41  |   await page.goForward({ waitUntil: 'domcontentloaded' })
  42  |   await expect(page).toHaveURL(pattern)
  43  | }
  44  | 
  45  | async function openBikeBlenderFromProducts(page: Page) {
  46  |   const link = page.getByRole('link', { name: /^Open Bike Blender$/ }).first()
  47  |   await link.scrollIntoViewIfNeeded()
  48  |   await link.click()
  49  |   await expect(page).toHaveURL(/\/products\/bike-blender$/)
  50  | }
  51  | 
  52  | async function openProductZoom(page: Page) {
  53  |   const firstPhoto = page.locator('button[aria-label*="View photo" i]').first()
  54  |   if (await firstPhoto.count()) await firstPhoto.click()
  55  |   const enlarge = page.locator('button[aria-label*="Enlarge" i]').first()
  56  |   await expect(enlarge).toBeVisible()
  57  |   await enlarge.click()
  58  |   await expect(page.locator('.fixed.inset-0').filter({ has: page.locator('img') }).first()).toBeVisible()
  59  | }
  60  | 
  61  | test('chat back navigation does not resurrect transient state', async ({ page }) => {
  62  |   test.setTimeout(120_000)
  63  |   const guard = await installConsoleGuards(page)
  64  | 
  65  |   await gotoApp(page, '/')
  66  |   await page.evaluate(() => window.scrollTo(0, 180))
  67  |   const homeScroll = await page.evaluate(() => window.scrollY)
  68  | 
  69  |   await openChat(page)
  70  |   await closeChat(page)
  71  |   await navigateFromMobileMenu(page, '/products')
  72  |   await goBackTo(page, /\/$/)
  73  | 
  74  |   await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveCount(0)
  75  |   await expect.poll(() => page.evaluate(() => document.activeElement?.tagName.toLowerCase())).not.toBe('textarea')
  76  |   await assertBodyUnlocked(page)
  77  |   await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.max(0, homeScroll - 40))
  78  | 
  79  |   await navigateFromMobileMenu(page, '/products')
  80  |   await openChat(page)
  81  |   await goBackTo(page, /\/$/)
  82  |   await assertBodyUnlocked(page)
  83  |   await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveCount(0)
  84  |   await goForwardTo(page, /\/products$/)
  85  |   await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveCount(0)
  86  |   await assertBodyUnlocked(page)
  87  | 
  88  |   guard.assertClean()
  89  | })
  90  | 
  91  | test('repeated history stress does not leak chat or body lock', async ({ page }) => {
  92  |   test.setTimeout(150_000)
  93  |   const guard = await installConsoleGuards(page)
  94  |   await gotoApp(page, '/')
  95  | 
  96  |   for (let index = 0; index < 2; index += 1) {
  97  |     await openChat(page)
  98  |     await closeChat(page)
  99  |     await navigateFromMobileMenu(page, '/products')
  100 |     await openBikeBlenderFromProducts(page)
  101 |     await goBackTo(page, /\/products$/)
  102 |     await goBackTo(page, /\/$/)
  103 |     await goForwardTo(page, /\/products$/)
  104 |     await goForwardTo(page, /\/products\/bike-blender$/)
  105 |     await goBackTo(page, /\/products$/)
  106 |     await goBackTo(page, /\/$/)
  107 |     await expect(chatRoot(page).locator('section[role="dialog"]')).toHaveCount(0)
  108 |     await assertBodyUnlocked(page)
  109 |   }
  110 | 
  111 |   guard.assertClean()
  112 | })
  113 | 
  114 | test('chat scroll lock restores page position', async ({ page }) => {
  115 |   const guard = await installConsoleGuards(page)
  116 |   await gotoApp(page, '/products')
  117 |   await page.evaluate(() => window.scrollTo(0, Math.min(900, document.documentElement.scrollHeight - innerHeight)))
  118 |   const before = await page.evaluate(() => window.scrollY)
  119 | 
  120 |   await openChat(page)
  121 |   await expect.poll(() => page.evaluate(() => ({
  122 |     locked: document.documentElement.dataset.scrollLocked,
  123 |     position: document.body.style.position,
  124 |     top: document.body.style.top,
  125 |   }))).toEqual({
  126 |     locked: 'true',
  127 |     position: 'fixed',
  128 |     top: `-${before}px`,
  129 |   })
  130 | 
```