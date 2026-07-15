# Eventies current UI/UX parity audit

Updated: 2026-07-15  
Working branch: `uiux-arabic-first-parity`  
Audited commit: `45af36c8`  
Target application: `eventies-next/` (Next.js `16.2.10`)  
Production visual reference: `https://www.eventiesjo.com/`  
Phase 7: **not started and out of scope**

> Deployment update (2026-07-15): framework/root detection is corrected and a
> Staging-environment Next `16.2.10` build passes, but Vercel finalization still resolves
> `.next` from the repository root. A clean project also reclassified explicit Preview
> deploys as Production; both attempts were stopped and deleted. Further deploys are blocked
> by the phase safety rules. See `PREVIEW_DEPLOYMENT_STATE.md` for the current evidence; the
> older conclusions below preserve the initial pre-change audit record.

## Executive audit verdict

The repository is clean and on the expected UI/UX branch. The isolated Vercel project
`eventies-next-preview` is healthy and already configured with framework `Next.js`, root
directory `eventies-next`, default output, and default install/build commands. The latest
known ready deployment is `dpl_9JP2gDQ4YQSbJUy8J3awdKyFySuo` at
`https://eventies-next-preview-ayfdnvmwc-hashemkayyalis-projects.vercel.app`.

The preview failures described in the handoff are reproducible from configuration evidence:
the repository-root `.vercel` link points to the Production/Vite-shaped `main-company`
project (`framework: vite`, root `.`), while the correct Preview project is
`eventies-next-preview` (`framework: nextjs`, root `eventies-next`). Running Vercel commands
from the repository root therefore selects the wrong project and package, which explains the
placeholder deployment, “No Next.js version detected”, wrong-root builds, and missing
`/vercel/path0/.next/package.json`. The smallest safe correction is to link and operate the
isolated Preview project from `eventies-next/`, verify Staging variables with the existing
fail-closed guard, and deploy Preview only. The root Vite project configuration must not be
deleted or repurposed.

The previous CAT-024 PASS-style reports are not sufficient for this phase. Source inspection
and live inspection already confirm P0 Arabic/RTL and resilience defects, plus material parity
gaps in account, product-detail, and admin experiences.

## Verified repository state

- Git branch: `uiux-arabic-first-parity`, tracking `origin/uiux-arabic-first-parity`.
- Working tree before this document: clean; no tracked or untracked user changes.
- HEAD: `45af36c8 chore: ignore local Vercel environment files`.
- Previous authoritative Phase 6 commit: `9af3bcc7`; Phase 6 reports say closed/PASS.
- Legacy reference: Vite/React under `src/`, `public/`, and root configuration.
- Target: App Router application under `eventies-next/src/app` with EN default URLs and
  `/ar` localized URLs.
- No database schema change, migration, Production access, Production deployment, merge,
  or Phase 7 work is required or authorized for this phase.
- The handoff initially named `https://eventies.com`, which currently resolves to a parked
  domain. The owner corrected the authoritative URL to `https://www.eventiesjo.com/`.

## Verified deployment state

| Surface | Evidence | State |
|---|---|---|
| Production design | `https://www.eventiesjo.com/` | Live legacy/Vite reference; EN-only (`/ar` returns a real 404) |
| Isolated Preview project | `eventies-next-preview` | Next.js preset; root `eventies-next`; default output/build/install |
| Latest known Preview | `dpl_9JP2gDQ4YQSbJUy8J3awdKyFySuo` | Ready; actual Next application, not placeholder |
| Repository-root Vercel link | `.vercel/project.json`, `.vercel/repo.json` | Wrong for Next work: linked to `main-company`, Vite, root `.` |
| Nested Next link | `eventies-next/.vercel/` | Operational scripts exist, but no current nested `project.json` was found |
| Environment safety | `scripts/assert-staging-environment.mjs` | Fail-closed guard requires Staging ref `ogfgaupebcabuoczoqcy` and rejects Production ref `dqizzlcsioqykfeldtsj` |

Preview acceptance for this phase: link only `eventies-next/` to `eventies-next-preview`, run
the environment guard without printing values, build from `eventies-next/`, deploy without
`--prod`, verify the Staging ref is present and the Production ref absent, and record the new
URL and commit in `PREVIEW_DEPLOYMENT_STATE.md`.

## Route inventory and parity status

| Area | Production / legacy route | Next route | Initial finding | Priority |
|---|---|---|---|---|
| Home | `/` | `/`, `/ar` | Ten-section port exists; must re-capture after scrolling because Reveal can hide content | P0 |
| Products | `/products` | `/products`, `/ar/products` | Port exists; filters, card density, Arabic data direction, and responsive hero need live diff | P1 |
| Product detail | `/products/:slug` | `/products/[slug]` | Next page is much simpler than the 751-line legacy workflow; pricing, options, quantities, availability, included content, suggestions, and CTA states require restoration/verification | P0 |
| Categories | `/categories` | `/categories`, `/ar/categories` | Port exists; live responsive/RTL comparison pending | P1 |
| Category detail | `/categories/:slug` | `/categories/[slug]` | Port exists; filters/card states and mixed-language data need verification | P1 |
| Gallery | `/gallery` | `/gallery`, `/ar/gallery` | Lightbox exists; dominant backdrop and complete RTL gesture behavior remain unverified | P1 |
| Custom builds | `/custom-builds` | `/custom-builds`, `/ar/custom-builds` | Next implementation is substantially smaller; visible production sections/interactions must decide which legacy blocks are truly empty vs missing | P1 |
| Customers | `/customers` | `/customers`, `/ar/customers` | Marquee exists; overflow and reduced-motion behavior need verification | P1 |
| About | `/about` | `/about`, `/ar/about` | Next implementation is substantially smaller; section-by-section diff required | P1 |
| Contact | `/contact` | `/contact`, `/ar/contact` | Real form now exists despite stale comments; Turnstile, errors, status, and mobile RTL require interaction tests | P0 |
| Support/help | production footer links `/help` | no page route; support API exists | Broken/missing route | P1 |
| Auth | `/login`, `/register`, password routes | localized equivalents | Functional shells exist; visual parity, focus, error, and bidi states pending | P0 |
| Account | `/profile`, `/my-requests`, detail, order summary | localized equivalents | Functional routes exist but are much smaller than legacy; real state walkthrough required | P0 |
| Commerce | `/rental-cart`, `/checkout`, `/purchase-quote` | localized equivalents | Core components exist; layout/state parity and RTL workflow testing pending | P0 |
| Notifications/chat | `/notifications` + global chat | localized notification route + global shell | Functional systems exist; focus, announcements, unread state, and RTL interaction pending | P0 |
| Admin | `/admin/*` | localized catch-all `/admin/[...section]` | Security/read models are preserved, but most legacy rich interiors have collapsed into one generic `AdminInterior` table; not parity | P0 |
| Legal | five canonical docs + aliases | five localized canonical docs + redirects | Present; typography/RTL prose and 200% zoom pending | P2 |

## Global design and implementation mismatches

### P0

1. **Arabic font pipeline is internally contradictory.**
   `eventies-next/src/lib/fonts.ts` defines three `next/font` families, but no layout imports or
   applies their class variables. `globals.css` simultaneously loads the same Google families
   through two external `@import` rules, and the layout adds Google preconnects. This defeats
   the documented self-hosting decision and risks duplicate requests, font swaps, and unstable
   Arabic metrics.
2. **Arabic headings can fall back to the wrong display face.**
   RTL display text uses a stack beginning with Latin display family `Zodiak`; Arabic fallback
   behavior and line metrics are not explicitly tokenized for headings, buttons, and body copy.
3. **All directional Lucide arrows are globally flipped.**
   `globals.css` rotates every `arrow-left`, `arrow-right`, `chevron-left`, and
   `chevron-right` under RTL. Components also apply local `rtl:rotate-180`, creating double or
   semantically incorrect mirroring. Only direction-dependent actions may flip.
4. **Reveal content is not fail-visible.**
   `components/ui/Reveal.tsx` renders Framer Motion with initial opacity `0`. If hydration,
   IntersectionObserver, navigation timing, screenshot automation, or a slow device prevents
   `whileInView`, meaningful content can remain invisible. Reduced motion is handled only after
   the client hook runs.
5. **The localized root layout loads the full products and categories catalog for every route.**
   `app/[locale]/layout.tsx` calls both DAL reads to build nav search even on auth, account,
   realtime, legal, and admin routes. This adds global data work and payload pressure unrelated
   to those routes.
6. **Mobile navigation lacks a verified dialog contract.**
   It locks body scroll and responds to Escape, but source inspection does not show a complete
   focus trap/restoration or dialog semantics for the drawer and dropdown surfaces.

### P1

- The global stylesheet is a roughly 2,900-line port with late RTL overrides that fight physical
  utility classes (`pl-*`, `.text-left`) instead of consistently using logical properties.
- Navbar is a 562-line client component and receives a full catalog search index from the server;
  this is a large global client/data boundary.
- Production is EN-only. Arabic visual truth must therefore be triangulated from the Arabic-first
  requirements, legacy component behavior, existing Next content, and owner review rather than
  treating a missing Production `/ar` route as a design baseline.
- Product detail and Admin are the clearest “static/generic shell” risks relative to the legacy
  implementation.
- Existing screenshot tooling covers only `1440x1000` and `390x844`, omits required tablet and
  small-mobile widths, and uses a fixed wait without explicitly scrolling each page.

### P2

- Zodiak still depends on an external Fontshare CSS import.
- Several stale comments claim forms/auth actions are not shipped although functional code now
  exists, increasing maintenance and audit ambiguity.
- Physical placement is legitimate for decorative product hero cards, but must be validated in
  RTL rather than globally mirrored.

## Arabic and RTL defects to verify/fix

- Apply an explicit Arabic body/display typography system with tested line-height, weights,
  wrapping, and letter spacing at 360, 390, 768, 1024, and 1440 widths and at 200% zoom.
- Keep phone numbers, email addresses, SKUs, prices, codes, and Latin product data isolated with
  `dir="ltr"` or `dir="auto"`/`bdi` as appropriate.
- Remove global icon flipping and mark only semantic previous/next/back/forward actions.
- Replace physical spacing/alignment overrides with logical properties where they affect flow.
- Verify navbar order, drawer reading/focus order, breadcrumb separators, carousel/lightbox
  gestures, tabs, form errors, tables, and mixed-language values independently.
- Verify no horizontal overflow using `scrollWidth <= clientWidth` at every target viewport.

## Responsive defects and risks

- Required baseline expands existing coverage to `360x800`, `390x844`, `768x1024`,
  `1024x768`, and `1440x900` for EN and AR.
- Admin generic tables are an immediate mobile overflow risk; rich legacy pages need deliberate
  card/table strategies rather than relying on horizontal scrolling.
- Very long Arabic headings, category names, customer data, emails, request IDs, and product
  descriptions require stress cases; current automated screenshots do not provide them.
- Fixed navbar and drawer height/scroll behavior require keyboard, touch, and orientation checks.

## Accessibility defects and risks

### P0

- Mobile drawer focus trap, initial focus, focus restoration, and background inertness are not
  established by the current implementation.
- Categories/More popovers use menu-like semantics but need complete keyboard navigation and focus
  return testing.
- Reveal must never hide semantic content from keyboard/screen-reader users.
- Gallery, auth, commerce, contact, realtime, and admin dialogs require Escape/focus tests.

### P1/P2

- Verify one H1 per page and sequential heading hierarchy after restoring missing sections.
- Verify 44px-equivalent touch targets and visible focus across nav, chips, thumbnails, pagination,
  admin actions, and form controls.
- Verify status/error messages are announced and do not rely on color alone.
- Run axe on representative public, auth, account, and admin routes; zero critical blockers is the
  acceptance threshold.

## Performance risks

- Root-layout catalog reads and serialization occur on unrelated routes.
- Full nav search index increases HTML/RSC and client hydration work globally.
- Duplicate external font loading conflicts with unused `next/font` configuration.
- Multiple always-mounted global client systems (`AuthSessionLifecycle`, `RealtimeShell`, animated
  background, navbar) need bundle and subscription inspection.
- Image priority/sizes must be checked per route; only one actual LCP image may be eager/high.
- Reveal/scroll effects and the 562-line navbar can add unnecessary client work on low-end phones.

## Exact files likely involved

- Preview: `.vercel/project.json`, `.vercel/repo.json` (diagnostic only),
  `eventies-next/.vercel/project.json` (local link), `eventies-next/vercel.json` if repository
  evidence ultimately requires a scoped file, `eventies-next/next.config.ts`,
  `eventies-next/scripts/assert-staging-environment.mjs`,
  `eventies-next/scripts/verify-preview-staging.mjs`.
- Typography/RTL: `eventies-next/src/app/[locale]/layout.tsx`,
  `eventies-next/src/app/globals.css`, `eventies-next/src/lib/fonts.ts`,
  `eventies-next/src/components/Bidi.tsx`.
- Reveal/motion: `eventies-next/src/components/ui/Reveal.tsx`, catalog/gallery components, and
  visual tooling.
- Global shell: `eventies-next/src/components/layout/SiteNav.tsx`, `SiteFooter.tsx`,
  `LanguageSwitcher.tsx`, `SiteBackground.tsx`.
- Public routes: corresponding pages under `eventies-next/src/app/[locale]/` and components under
  `eventies-next/src/features/catalog`, `features/gallery`, `features/forms`.
- Product detail: `eventies-next/src/app/[locale]/products/[slug]/page.tsx`,
  `features/catalog/ProductGallery.tsx`, `features/commerce/AddToDraftActions.tsx`, and legacy
  `src/pages/ProductDetailsPage.tsx` plus its product components as the behavioral reference.
- Account/realtime/admin: `eventies-next/src/features/account`, `features/commerce`,
  `features/realtime`, `features/admin`, localized route groups, and the corresponding legacy
  pages/components.
- Tests/evidence: `eventies-next/e2e`, `eventies-next/playwright.config.ts`,
  `eventies-next/scripts/visual-parity-shots.mjs`, and
  `docs/reconstruction/visual-parity/uiux-arabic-first/`.

## Acceptance criteria

### P0 release blockers

- A reproducible Preview build runs from `eventies-next/`, detects Next.js `16.2.10`, uses only
  Staging Supabase, renders the real app, and is never promoted to Production.
- Arabic typography is stable with no clipping, overlap, broken bidi, backwards controls, or page
  overflow at all required viewports and 200% zoom.
- Reveal content is visible without successful animation and under reduced motion.
- Navbar/drawer, auth, product-detail request flow, contact, commerce/account, notifications/chat,
  and representative admin workflows are keyboard/touch usable with correct focus behavior.
- Product-detail data/CTA behavior and Admin workflows are not reduced to generic visual shells.

### P1

- Key public routes match Production section order, hierarchy, spacing, media treatment, states,
  and responsive behavior in EN, with an owner-reviewable Arabic counterpart.
- `/help` is either implemented from repository evidence or the broken production/footer link is
  resolved to an existing support surface without removing support functionality.
- No console/hydration errors, failed critical images, or horizontal overflow.
- Route-level data loading avoids unrelated global reads and does not regress Phase 6 cache rules.

### Validation gate

- `npm ci`, format, lint, typecheck, architecture, i18n, cycle, unit/contract, production build,
  route smoke, Playwright EN/AR desktop/mobile, accessibility, visual comparison, and relevant
  Phase 6 regression checks pass without suppressing failures.
- Evidence records equivalent data, waits for fonts/images, scrolls pages before final screenshots,
  and distinguishes pre-existing failures from regressions.
- Final documentation records changed files, commands/results, remaining P1/P2 items, Preview URL,
  deployment commit, branch/commit, and confirms Production, Supabase Production, and Phase 7 were
  untouched.
