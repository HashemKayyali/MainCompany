# Navbar Responsive Rebuild — Audit Report

Date: 2026-07-05
Scope: public site header ([src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx)) — desktop bar, mobile drawer, search, dropdowns, EN/AR.

---

## 1. Original root causes

The public header is a single component (`Navbar.tsx`) with pure-CSS breakpoints (no JS width logic — good). The overflow was structural:

1. **Rigid full-desktop layout turned on far too early.** At `lg` (1024px) the bar rendered a fixed 238px logo (`shrink-0`), **all 8 nav links** (~700px intrinsic, more in Arabic), a search field with a **fixed** width `w-[clamp(260px,28vw,430px)]` (a rigid block — never able to shrink below its clamp), plus language/cart/login buttons. Total intrinsic width ≈ 1550–1700px. Nothing in the row was allowed to shrink and there was no priority collapse, so **every viewport between 1024px and ~1600px overflowed** — exactly the "between breakpoints" band QA kept hitting (root-cause letters A, B, D, E, L, T, W from the brief).
2. **`sm` (640px) enabled all utility text labels simultaneously** — language hint text, "Request Draft", "Login" — while the logo also jumped to 238px. The 640–1023px band overflowed, worst in Arabic (`مسودة الطلب`, `تسجيل الدخول`) (L, M, N).
3. **Smallest phones overflowed:** at 320px the bar needed logo 165px + three 44px buttons + gaps + container padding ≈ 331px (D, A).
4. **Arabic amplification:** longer labels and a longer search placeholder (`ابحث في الفئات أو الخدمات...`) inside a non-shrinkable field (N, Q). Browser zoom reproduced the same failures because it just narrows the effective CSS viewport into the broken bands (O).

Not guilty: RTL ordering (the bar is intentionally forced LTR via `.nav-shell-ar { direction:ltr }` — a stable brand layout), absolute-positioned controls (dropdowns are anchored correctly), container padding (`.site-container` uses fluid clamp padding already).

## 2. Files changed

| File | Change |
|---|---|
| [src/components/layout/Navbar.tsx](src/components/layout/Navbar.tsx) | Priority nav split + More menu, flexible search, fluid logo, label breakpoints moved to 2xl, Escape handling, drawer safe-area, `min-w-0`/`shrink-0` corrections, fluid gaps |
| [src/components/layout/LanguageSwitcher.tsx](src/components/layout/LanguageSwitcher.tsx) | Hint label ("العربية"/"English") shows only at ≥1536px; `whitespace-nowrap` |
| [src/styles/site.css](src/styles/site.css) | Search placeholder truncates with ellipsis instead of forcing width |

No auth logic, routes, brand assets, or breakpoint variables elsewhere were touched. `--app-navbar-height` and the 74px bar height are unchanged, so hero offsets, anchor scrolling, and sticky behavior are untouched.

## 3. New responsive architecture

Single flex row inside `.site-container` (which already has `min-width:0` and fluid margins), with fluid gap `gap-[clamp(8px,1.2vw,18px)]`:

```
[logo shrink-0, fluid width] [nav shrink-0, priority-collapsed] [right cluster: flex-1 min-w-0 justify-end]
                                                                  └─ [search w-full min-w-150 max-w-430] [utils shrink-0…]
```

The **search field is the single elastic element** — it absorbs and releases width between a usable minimum (150px) and a comfortable maximum (430px). Everything else is content-sized and collapses by *mode*, not by squeezing. Nothing in the bar can force overflow: the only unbounded-width items (nav labels) are whitespace-nowrap *and* mode-gated so their worst-case sum always fits the mode's minimum viewport (verified live in both languages).

## 4. Breakpoint / mode strategy

Modes are chosen by available width for the actual content, not device names:

| Mode | Range | Composition |
|---|---|---|
| 1 — Mobile | <768px | Fluid logo `clamp(104px,34vw,165px)`, cart icon, login/avatar icon, hamburger. Everything else in drawer. Fits down to 280px. |
| 2 — Compact tablet | 768–1023px | + language switcher (icon + AR/EN). Still drawer-based nav. |
| 3 — Compact desktop | 1024–1535px | Logo 183px, priority links (Home, Categories▾, Services, Gallery) + **More▾** menu, flexible search, icon-only utilities, no hamburger. |
| 4 — Standard desktop | 1536–1719px | + text labels on language/cart/login/account; search grows. |
| 5 — Wide / ultrawide | ≥1720px | All 8 links inline, More menu hidden, search capped at 430px, content centered by `.site-container` max-width (2240px) so ultrawide screens don't stretch gaps. |

1720px is content-derived: the full 8-link set + logo + minimum search + labeled utilities measures ~1650px in English and ~1690px in Arabic.

## 5. Search behavior by mode

- **Modes 1–2:** full-width search field inside the mobile drawer (unchanged UX).
- **Modes 3–5:** inline pill, `w-full min-w-[150px] max-w-[430px]` inside a `flex-1 min-w-0` cluster — shrinks to 150px under pressure (measured 212px at 1024px), grows to 430px when free. Input has `min-w-0 flex-1`; placeholder truncates with ellipsis (`.nav-search-input::placeholder`) so the long Arabic placeholder can never force width. Suggestions panel `w-[min(460px,92vw)]` anchored to the pill — measured fully inside the viewport at 1024px. ⌘K focus shortcut unchanged.

## 6. Navigation visibility / priority

- **Primary (always visible on desktop):** Home, Categories (dropdown), Services, Gallery.
- **Secondary (More menu below 1720px, inline above):** Custom Builds, Customers, About, Contact.
- Every destination remains reachable at every width (drawer holds the full set on mobile/tablet). No label is ever shrunk or truncated to stay visible; links are `whitespace-nowrap` so labels can't wrap into broken second lines.
- More trigger shows the active-pill state when a secondary route is current.

## 7. Authenticated vs logged-out

- Logged out: login is icon-only (44px) until 2xl, then icon + "Login"/"تسجيل الدخول".
- Logged in: avatar-only (44px) until 2xl, then avatar + first name truncated at `max-w-[96px]` + chevron — the logged-in button's width is **bounded by construction**, so a long display name cannot overflow (long-name case covered structurally; see Remaining risks for the live-login caveat).
- Cart badge is absolutely positioned over the icon (caps at "99+"), so item count never changes bar width.

## 8. English result

Zero page overflow, zero header elements outside the viewport, single-row bar at every tested width from 280→3840px (full matrix in §10). Mode compositions verified: 4+More at 1366px, all 8 links + 430px search at ≥1720px.

## 9. Arabic result

Same audit re-run with `dir=rtl` and Arabic labels active: zero overflow at 280, 320, 653×280, 768, 1024, 1057, 1173, 1311, 1546, 1730, 3440. All 8 Arabic links (`الرئيسية، الفئات، الخدمات، المعرض، تنفيذ مخصص، العملاء، من نحن، تواصل معنا`) fit inline at 1720px. The bar keeps its intentional forced-LTR brand layout (`.nav-shell-ar`); search input text/placeholder align right; dropdown panels get `dir="rtl"` content. Language switching live did not break layout.

## 10. Viewport test matrix

Automated in-browser audit at each size (`document.documentElement.scrollWidth ≤ clientWidth`, every header descendant's rect inside viewport, single-row check, bar height 74px). **All pass, EN; bold also re-tested in AR:**

- Phones: **320×568**, 360×640, 375×667, 412×915 ✓
- Foldables: **280×653**, 540×720, **653×280** ✓
- Tablets: **768×1024**, **1024×768**, 1080×1920 (portrait kiosk) ✓
- Odd widths: 777, 913, 999, **1057**, **1173**, 1280×720, **1311**, **1366×768**, 1499 ✓
- Desktop: 1440-class (1499), **1546×864**, **1730×900**, 1920×1080 ✓
- Large/TV/ultrawide: 2560×1440, **3440×1440**, 3840×2160 ✓

Routes covered at constrained width (1024, Arabic): Home, /products, /gallery, /login, /rental-cart, 404 — all zero overflow. (/my-requests and /profile redirect to login when logged out; their header is the same component.)

## 11. Browser zoom

Zoom narrows the effective CSS viewport, which the pure-CSS modes handle by design (no zoom detection anywhere). Equivalent effective widths all tested clean: 1920 @125% = 1536 ✓, @150% = 1280 ✓, @175% ≈ 1097 (1080 ✓), @200% = 960 (913/999 ✓), @80% = 2400 (2560 ✓).

## 12. Dropdowns / menus

Categories (326px), More (224px), search suggestions (460px), user menu (272px) — all measured fully inside the viewport at the tightest desktop width (1024px). Verified live: open on click, `aria-expanded` toggles, **Escape closes**, **click-outside closes**, reopen works. No dropdown lives inside an overflow-hidden parent; anchoring is physical (left/right) inside the intentionally LTR bar, panel *content* follows the document direction.

## 13. Mobile drawer

Verified at 375×667 (and bar itself down to 280px): opens from top (direction-neutral, correct for both LTR/RTL), full-width and inside viewport, body scroll locked, contains **all 7 nav links + Categories + Request Draft + Login + search field + language switcher**, closes on Escape (new) and backdrop (existing), safe-area bottom padding added (`env(safe-area-inset-bottom)`), max-height 92vh with internal scroll so it works on 280px-tall landscape screens.

## 14. Accessibility

- All icon-only buttons have `aria-label` (cart with item count, menu, account, close, search).
- `aria-expanded`/`aria-haspopup` on Categories, More, user menu, hamburger; `role="menu"`/`menuitem` on panels; `role="dialog" aria-modal` on drawer; `aria-current="page"` on active links (including inside More).
- New global Escape handler closes any open popover/drawer. Tab order follows visual order (logo → nav → search → utilities). Focus-visible styling inherits the existing global styles.

## 15. TypeScript result

`npx tsc --noEmit` — **pass, no errors.**

## 16. Build result

`npm run build` (vite build + SEO prerender) — **pass**; 38 routes prerendered. (Pre-existing chunk-size warnings for three/shaders vendors, unrelated to this change.)

## 17. Remaining known risks

1. **Logged-in live test not executed** — no test credentials in this environment. The logged-in control is structurally bounded (avatar-only <1536px; truncated 96px name above), so overflow is not possible by construction, but a visual pass with a real account is recommended.
2. **1024–1100px Arabic is the tightest band** (search near its 150px floor). Audited clean with current labels; if nav copy is ever lengthened significantly, re-check this band or move a link into `SECONDARY_NAV_LINKS`.
3. **Adding a nav link** requires choosing its priority bucket (`PRIMARY_NAV_LINKS` vs `SECONDARY_NAV_LINKS` in Navbar.tsx); adding to primary without re-measuring could reintroduce pressure at 1024px.
4. The audit script was run ad hoc via the dev-preview console and left **no test code in the bundle**; the project has no Playwright setup, so the matrix isn't CI-enforced.
5. Screenshot capture of the WebGL homepage hero times out in the headless preview (capture-tool limitation only); DOM-level audits on Home all pass, and /about screenshots confirm visual balance in both languages.

*Not committed, per instructions.*
