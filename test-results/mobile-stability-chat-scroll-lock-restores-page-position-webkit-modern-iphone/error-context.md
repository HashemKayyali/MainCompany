# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-stability.spec.ts >> chat scroll lock restores page position
- Location: e2e\mobile-stability.spec.ts:114:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

  Object {
    "locked": "true",
    "position": "fixed",
-   "top": "-900px",
+   "top": "-958px",
  }

Call Log:
- Timeout 8000ms exceeded while waiting on the predicate
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
          - button "Menu" [ref=e23] [cursor=pointer]:
            - img [ref=e24]
    - main [ref=e25]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]:
            - img [ref=e30]
            - generic [ref=e33]: Service Catalog - Jordan
          - heading "Discover event services and rentals for every kind of occasion." [level=1] [ref=e34]
          - paragraph [ref=e35]: Browse interactive games, screens, booths, production support, and event services from trusted providers across Jordan. Compare options and submit a rental or purchase quote request for review.
          - generic [ref=e36]:
            - link "Browse Services" [ref=e37]:
              - /url: "#products-catalog"
              - text: Browse Services
              - img [ref=e38]
            - link "Explore Categories" [ref=e40]:
              - /url: /categories
          - generic [ref=e41]:
            - generic [ref=e42]: Browse
            - link "Eventies" [ref=e43]:
              - /url: /categories/eventies
            - link "The Terminal VR" [ref=e44]:
              - /url: /categories/terminal-vr
        - generic [ref=e45]:
          - link "Bike Branding Bike Race Bike Beam Bike VR Bike Blender Eventies Bike Branding Eventies Bike Race Eventies Bike Beam The Terminal VR Bike VR Eventies Bike Blender" [ref=e48]:
            - /url: /products/bike-blender
            - generic [ref=e49]:
              - img "Bike Branding" [ref=e51]
              - img "Bike Race" [ref=e53]
              - img "Bike Beam" [ref=e55]
              - img "Bike VR" [ref=e57]
              - img "Bike Blender" [ref=e59]
            - generic [ref=e62]:
              - generic [ref=e63]:
                - generic [ref=e64]: Eventies
                - heading "Bike Branding" [level=3] [ref=e65]
              - generic [ref=e66]:
                - generic [ref=e67]: Eventies
                - heading "Bike Race" [level=3] [ref=e68]
              - generic [ref=e69]:
                - generic [ref=e70]: Eventies
                - heading "Bike Beam" [level=3] [ref=e71]
              - generic [ref=e72]:
                - generic [ref=e73]: The Terminal VR
                - heading "Bike VR" [level=3] [ref=e74]
              - generic [ref=e75]:
                - generic [ref=e76]: Eventies
                - heading "Bike Blender" [level=3] [ref=e77]
          - link "Bike VR Bike Blender Bike Tower Bike Beam Bike Branding The Terminal VR Bike VR Eventies Bike Blender Eventies Bike Tower Eventies Bike Beam Eventies Bike Branding" [ref=e80]:
            - /url: /products/bike-branding
            - generic [ref=e81]:
              - img "Bike VR" [ref=e83]
              - img "Bike Blender" [ref=e85]
              - img "Bike Tower" [ref=e87]
              - img "Bike Beam" [ref=e89]
              - img "Bike Branding" [ref=e91]
            - generic [ref=e94]:
              - generic [ref=e95]:
                - generic [ref=e96]: The Terminal VR
                - heading "Bike VR" [level=3] [ref=e97]
              - generic [ref=e98]:
                - generic [ref=e99]: Eventies
                - heading "Bike Blender" [level=3] [ref=e100]
              - generic [ref=e101]:
                - generic [ref=e102]: Eventies
                - heading "Bike Tower" [level=3] [ref=e103]
              - generic [ref=e104]:
                - generic [ref=e105]: Eventies
                - heading "Bike Beam" [level=3] [ref=e106]
              - generic [ref=e107]:
                - generic [ref=e108]: Eventies
                - heading "Bike Branding" [level=3] [ref=e109]
          - link "Bike Branding Bike Blender Bike Tower Eventies Bike Branding Eventies Bike Blender Eventies Bike Tower" [ref=e112]:
            - /url: /products/bike-tower
            - generic [ref=e113]:
              - img "Bike Branding" [ref=e115]
              - img "Bike Blender" [ref=e117]
              - img "Bike Tower" [ref=e119]
            - generic [ref=e122]:
              - generic [ref=e123]:
                - generic [ref=e124]: Eventies
                - heading "Bike Branding" [level=3] [ref=e125]
              - generic [ref=e126]:
                - generic [ref=e127]: Eventies
                - heading "Bike Blender" [level=3] [ref=e128]
              - generic [ref=e129]:
                - generic [ref=e130]: Eventies
                - heading "Bike Tower" [level=3] [ref=e131]
          - link "Bike Beam Bike Blender Bike VR Eventies Bike Beam Eventies Bike Blender The Terminal VR Bike VR" [ref=e134]:
            - /url: /products/bike-vr
            - generic [ref=e135]:
              - img "Bike Beam" [ref=e137]
              - img "Bike Blender" [ref=e139]
              - img "Bike VR" [ref=e141]
            - generic [ref=e144]:
              - generic [ref=e145]:
                - generic [ref=e146]: Eventies
                - heading "Bike Beam" [level=3] [ref=e147]
              - generic [ref=e148]:
                - generic [ref=e149]: Eventies
                - heading "Bike Blender" [level=3] [ref=e150]
              - generic [ref=e151]:
                - generic [ref=e152]: The Terminal VR
                - heading "Bike VR" [level=3] [ref=e153]
          - link "Bike Race Eventies Bike Race" [ref=e156]:
            - /url: /products/bike-race
            - img "Bike Race" [ref=e159]
            - generic [ref=e163]:
              - generic [ref=e164]: Eventies
              - heading "Bike Race" [level=3] [ref=e165]
      - generic [ref=e168]:
        - generic [ref=e169]:
          - generic [ref=e172]: Services
          - heading "Discover event services and rentals for every kind of occasion." [level=2] [ref=e174]
          - paragraph [ref=e175]: Filter the catalog by category, compare the available options, and open any service to rent it or request a purchase quote for review.
        - generic [ref=e176]:
          - generic [ref=e177]:
            - generic [ref=e178]:
              - generic [ref=e179]:
                - generic [ref=e180]:
                  - img [ref=e181]
                  - generic [ref=e182]: Service category
                - heading "Service Catalog" [level=2] [ref=e183]
              - generic [ref=e184]:
                - img [ref=e185]
                - generic [ref=e190]: "6"
                - generic [ref=e191]: total services
            - generic [ref=e193]:
              - button "All (6)" [ref=e194] [cursor=pointer]
              - button "✨ Eventies (5)" [ref=e195] [cursor=pointer]
              - button "🥽 The Terminal VR (1)" [ref=e196] [cursor=pointer]
          - separator [ref=e197]
          - generic [ref=e199]:
            - article [ref=e200] [cursor=pointer]:
              - link "Open Bike Blender" [ref=e201]:
                - /url: /products/bike-blender
                - img "Bike Blender" [ref=e202]
                - generic [ref=e203]:
                  - generic [ref=e204]: Featured
                  - generic [ref=e205]: Most Popular
              - generic [ref=e207]:
                - generic [ref=e210]: Eventies
                - generic [ref=e211]:
                  - link "Bike Blender" [ref=e212]:
                    - /url: /products/bike-blender
                    - heading "Bike Blender" [level=3] [ref=e213]
                  - paragraph [ref=e214]: Pedal-powered smoothie station. Ride the bike, blend your own fresh drink live.
                - generic [ref=e216]:
                  - generic [ref=e217]: Per Day
                  - generic [ref=e218]: 250 JOD
                - generic [ref=e219]:
                  - button "Add to Rental" [ref=e220]:
                    - img [ref=e221]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e225]:
                    - img [ref=e226]
                    - text: Request Quote
            - article [ref=e229] [cursor=pointer]:
              - link "Open Bike Tower" [ref=e230]:
                - /url: /products/bike-tower
                - img "Bike Tower" [ref=e231]
                - generic [ref=e232]:
                  - generic [ref=e233]: Featured
                  - generic [ref=e234]: Competitive
              - generic [ref=e236]:
                - generic [ref=e239]: Eventies
                - generic [ref=e240]:
                  - link "Bike Tower" [ref=e241]:
                    - /url: /products/bike-tower
                    - heading "Bike Tower" [level=3] [ref=e242]
                  - paragraph [ref=e243]: Two-player LED tower race. Pedal to light up your tower first.
                - generic [ref=e245]:
                  - generic [ref=e246]: Per Day
                  - generic [ref=e247]: 350 JOD
                - generic [ref=e248]:
                  - button "Add to Rental" [ref=e249]:
                    - img [ref=e250]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e254]:
                    - img [ref=e255]
                    - text: Request Quote
            - article [ref=e258] [cursor=pointer]:
              - link "Open Bike VR" [ref=e259]:
                - /url: /products/bike-vr
                - img "Bike VR" [ref=e260]
                - generic [ref=e261]:
                  - generic [ref=e262]: Featured
                  - generic [ref=e263]: Immersive
              - generic [ref=e265]:
                - generic [ref=e268]: The Terminal VR
                - generic [ref=e269]:
                  - link "Bike VR" [ref=e270]:
                    - /url: /products/bike-vr
                    - heading "Bike VR" [level=3] [ref=e271]
                  - paragraph [ref=e272]: VR cycling through stunning digital worlds.
                - generic [ref=e274]:
                  - generic [ref=e275]: Per Day
                  - generic [ref=e276]: 400 JOD
                - generic [ref=e277]:
                  - button "Add to Rental" [ref=e278]:
                    - img [ref=e279]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e283]:
                    - img [ref=e284]
                    - text: Request Quote
            - article [ref=e287] [cursor=pointer]:
              - link "Open Bike Race" [ref=e288]:
                - /url: /products/bike-race
                - img "Bike Race" [ref=e289]
                - generic [ref=e291]: Racing
              - generic [ref=e293]:
                - generic [ref=e296]: Eventies
                - generic [ref=e297]:
                  - link "Bike Race" [ref=e298]:
                    - /url: /products/bike-race
                    - heading "Bike Race" [level=3] [ref=e299]
                  - paragraph [ref=e300]: Live cycling race with real-time stats on screen.
                - generic [ref=e302]:
                  - generic [ref=e303]: Per Day
                  - generic [ref=e304]: 300 JOD
                - generic [ref=e305]:
                  - button "Add to Rental" [ref=e306]:
                    - img [ref=e307]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e311]:
                    - img [ref=e312]
                    - text: Request Quote
            - article [ref=e315] [cursor=pointer]:
              - link "Open Bike Branding" [ref=e316]:
                - /url: /products/bike-branding
                - img "Bike Branding" [ref=e317]
                - generic [ref=e319]: Custom
              - generic [ref=e321]:
                - generic [ref=e324]: Eventies
                - generic [ref=e325]:
                  - link "Bike Branding" [ref=e326]:
                    - /url: /products/bike-branding
                    - heading "Bike Branding" [level=3] [ref=e327]
                  - paragraph [ref=e328]: Fully branded cycling experience.
                - generic [ref=e330]:
                  - generic [ref=e331]: Per Day
                  - generic [ref=e332]: 150 JOD
                - generic [ref=e333]:
                  - button "Add to Rental" [ref=e334]:
                    - img [ref=e335]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e339]:
                    - img [ref=e340]
                    - text: Request Quote
            - article [ref=e343] [cursor=pointer]:
              - link "Open Bike Beam" [ref=e344]:
                - /url: /products/bike-beam
                - img "Bike Beam" [ref=e345]
                - generic [ref=e347]: LED Show
              - generic [ref=e349]:
                - generic [ref=e352]: Eventies
                - generic [ref=e353]:
                  - link "Bike Beam" [ref=e354]:
                    - /url: /products/bike-beam
                    - heading "Bike Beam" [level=3] [ref=e355]
                  - paragraph [ref=e356]: Pedal-powered LED beam. Harder you ride, brighter the show.
                - generic [ref=e358]:
                  - generic [ref=e359]: Per Day
                  - generic [ref=e360]: 300 JOD
                - generic [ref=e361]:
                  - button "Add to Rental" [ref=e362]:
                    - img [ref=e363]
                    - text: Add to Rental
                  - button "Request Quote" [ref=e367]:
                    - img [ref=e368]
                    - text: Request Quote
    - contentinfo "Site footer" [ref=e371]:
      - generic [ref=e373]:
        - generic [ref=e374]:
          - generic [ref=e376]:
            - link "Eventies home" [ref=e377]:
              - /url: /
              - img "Eventies" [ref=e378]
            - paragraph [ref=e379]: Eventies helps clients discover event services, compare trusted providers across Jordan, and submit clear requests from one organized marketplace.
            - generic [ref=e380]:
              - img [ref=e381]
              - generic [ref=e384]: Trusted event services marketplace
            - generic [ref=e385]:
              - link "Follow Eventies on Instagram" [ref=e386]:
                - /url: https://instagram.com/bike_blender
                - img [ref=e387]
              - link "Follow Eventies on Facebook" [ref=e390]:
                - /url: https://facebook.com/BikeBlender
                - img [ref=e391]
              - link "Follow Eventies on WhatsApp" [ref=e393]:
                - /url: https://wa.me/962788611234
                - img [ref=e394]
          - generic [ref=e396]:
            - group [ref=e397]:
              - generic "Categories" [ref=e398] [cursor=pointer]:
                - generic [ref=e399]: Categories
                - img [ref=e401]
            - group [ref=e403]:
              - generic "Company" [ref=e404] [cursor=pointer]:
                - generic [ref=e405]: Company
                - img [ref=e407]
            - group [ref=e409]:
              - generic "Support" [ref=e410] [cursor=pointer]:
                - generic [ref=e411]: Support
                - img [ref=e413]
            - group [ref=e415]:
              - generic "Legal" [ref=e416] [cursor=pointer]:
                - generic [ref=e417]: Legal
                - img [ref=e419]
            - group [ref=e421]:
              - generic "Contact" [ref=e422] [cursor=pointer]:
                - generic [ref=e423]: Contact
                - img [ref=e425]
        - generic [ref=e428]:
          - paragraph [ref=e429]: © 2026 Eventies. All rights reserved.
          - generic [ref=e430]:
            - link "Privacy" [ref=e431]:
              - /url: /privacy-policy
            - link "Terms" [ref=e432]:
              - /url: /terms
            - link "Cookies" [ref=e433]:
              - /url: /cookie-policy
            - generic [ref=e434]: Made in Jordan
    - dialog "Chat with Eventies" [ref=e436]:
      - banner [ref=e437]:
        - generic [ref=e438]:
          - img [ref=e440]
          - generic [ref=e443]:
            - generic [ref=e444]:
              - heading "Eventies Support" [level=2] [ref=e445]
              - img [ref=e446]
            - paragraph [ref=e449]: Send us your question and our team will reply here.
          - button "Close chat" [ref=e450] [cursor=pointer]:
            - img [ref=e451]
      - generic [ref=e455]:
        - img [ref=e458]
        - heading "Sign in to start a conversation" [level=3] [ref=e460]
        - paragraph [ref=e461]: Your chat history stays connected to your Eventies account.
        - link "Sign in" [ref=e463]:
          - /url: /login?redirect=%2Fproducts
          - generic [ref=e464]: Sign in
          - img [ref=e465]
```

# Test source

```ts
  25  | 
  26  | async function navigateFromMobileMenu(page: Page, href: string) {
  27  |   const drawer = page.locator('[role="dialog"][aria-label*="navigation" i]')
  28  |   await page.locator('header button[aria-label="Menu"]').click()
  29  |   await expect(drawer).toBeVisible()
  30  |   await drawer.locator(`a[href="${href}"]`).first().click()
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
> 125 |   }))).toEqual({
      |        ^ Error: expect(received).toEqual(expected) // deep equality
  126 |     locked: 'true',
  127 |     position: 'fixed',
  128 |     top: `-${before}px`,
  129 |   })
  130 | 
  131 |   await closeChat(page)
  132 |   await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThanOrEqual(Math.max(0, before - 8))
  133 |   await assertBodyUnlocked(page)
  134 | 
  135 |   guard.assertClean()
  136 | })
  137 | 
  138 | test('authenticated chat composer uses mobile-safe font and releases focus', async ({ page, browserName }) => {
  139 |   test.skip(browserName !== 'webkit', 'Composer geometry is explicitly verified on mobile WebKit projects.')
  140 |   const guard = await installConsoleGuards(page)
  141 |   await installAuthenticatedSession(page)
  142 | 
  143 |   await gotoApp(page, '/')
  144 |   await openChat(page)
  145 | 
  146 |   const composer = page.locator('section[role="dialog"] textarea').first()
  147 |   await expect(composer).toBeVisible()
  148 |   await composer.focus()
  149 | 
  150 |   await expect.poll(() => composer.evaluate(element => Number.parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(16)
  151 |   const geometry = await page.evaluate(() => {
  152 |     const panel = document.querySelector('section[role="dialog"]')?.getBoundingClientRect()
  153 |     const viewport = window.visualViewport
  154 |     return {
  155 |       panelTop: panel?.top ?? -1,
  156 |       panelBottom: panel?.bottom ?? -1,
  157 |       viewportTop: viewport?.offsetTop ?? 0,
  158 |       viewportBottom: (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight),
  159 |     }
  160 |   })
  161 |   expect(geometry.panelTop).toBeGreaterThanOrEqual(geometry.viewportTop - 2)
  162 |   expect(geometry.panelBottom).toBeLessThanOrEqual(geometry.viewportBottom + 2)
  163 | 
  164 |   await closeChat(page)
  165 |   await expect.poll(() => page.evaluate(() => document.activeElement?.tagName.toLowerCase())).not.toBe('textarea')
  166 |   await openChat(page)
  167 |   await expect.poll(() => page.evaluate(() => document.activeElement?.tagName.toLowerCase())).not.toBe('textarea')
  168 | 
  169 |   guard.assertClean()
  170 | })
  171 | 
  172 | test('rapid chat interactions do not leave pointer-blocking locks', async ({ page }) => {
  173 |   test.setTimeout(120_000)
  174 |   const guard = await installConsoleGuards(page)
  175 |   await gotoApp(page, '/')
  176 | 
  177 |   for (let index = 0; index < 4; index += 1) {
  178 |     await openChat(page)
  179 |     await closeChat(page)
  180 |   }
  181 | 
  182 |   await navigateFromMobileMenu(page, '/products')
  183 |   await goBackTo(page, /\/$/)
  184 |   await openChat(page)
  185 |   await goForwardTo(page, /\/products$/)
  186 |   await assertBodyUnlocked(page)
  187 | 
  188 |   await navigateFromMobileMenu(page, '/contact')
  189 |   await expect(page.locator('main')).toBeVisible()
  190 | 
  191 |   guard.assertClean()
  192 | })
  193 | 
  194 | test('modal, navbar, notification and lightbox overlays close on route navigation', async ({ page }) => {
  195 |   test.setTimeout(120_000)
  196 |   const guard = await installConsoleGuards(page)
  197 |   await installAuthenticatedSession(page)
  198 | 
  199 |   await gotoApp(page, '/')
  200 |   await page.locator('header button[aria-label="Menu"]').click()
  201 |   await expect(page.locator('[role="dialog"][aria-label*="navigation" i]')).toBeVisible()
  202 |   await page.locator('[role="dialog"][aria-label*="navigation" i] a[href="/products"]').click()
  203 |   await expect(page).toHaveURL(/\/products$/)
  204 |   await expect(page.locator('[role="dialog"][aria-label*="navigation" i]')).toHaveCount(0)
  205 |   await assertBodyUnlocked(page)
  206 | 
  207 |   await goBackTo(page, /\/$/)
  208 |   const notificationButton = page.locator('button[aria-haspopup="dialog"][aria-label="Notifications"]').first()
  209 |   await expect(notificationButton).toBeVisible()
  210 |   await notificationButton.click()
  211 |   await expect(page.locator('[role="dialog"][aria-label="Notifications"]')).toBeVisible()
  212 |   await goForwardTo(page, /\/products$/)
  213 |   await expect(page.locator('[role="dialog"][aria-label="Notifications"]')).toHaveCount(0)
  214 | 
  215 |   await gotoApp(page, '/gallery')
  216 |   await page.locator('button[aria-label="E2E Gallery - photo 1"]').click()
  217 |   await expect(page.locator('[role="dialog"][aria-label*="Image gallery" i]')).toBeVisible()
  218 |   await goBackTo(page, /\/products$/)
  219 |   await assertBodyUnlocked(page)
  220 | 
  221 |   await openBikeBlenderFromProducts(page)
  222 |   await openProductZoom(page)
  223 |   await goBackTo(page, /\/products$/)
  224 |   await assertBodyUnlocked(page)
  225 |   await expect(page.locator('#main-content')).toBeVisible()
```