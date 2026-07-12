# CAT-024 — Visual Reconstruction Progress Report

**Status: NOT approved (owner-only).** This report documents code-side progress on the
full component-by-component port of the Vite public experience into `eventies-next/`.
Source of truth: the Vite app at the repository root (`src/`).

## What was ported this pass (route-by-route)

### Home `/` — ✅ all 10 sections (verified live)
Replaced the simplified redesign with a faithful, component-by-component port of
`src/pages/HomePage.tsx`, in the exact section order with alternating `home-band`
theming:

| Section | Next component | Notes |
|---|---|---|
| Hero | `features/catalog/hero/HeroClient` | showcase card, floating For-Clients/For-Providers cards, WebGL pulsing badge, category chips, framer entrance |
| Browse by category | `home/BrowseCategories` + `CategoryGridCard` | up-to-10 cards sorted by live service count, radial glow, "View all" pill |
| Popular services | `home/PopularServices` | ServiceCard grid, per-day / on-request pricing, Popular badge |
| How it works | `home/HowItWorks` | 3 step cards (last dark/gradient) + chevron connectors |
| Plan by event type | `home/EventTypes` (client) | expanding image accordion, staggered reveal, deep-link arrow |
| Custom builds | `home/CustomBuildPreview` | R&D studio dark panel, randd.webp backdrop, build-signal chips, pipeline strip |
| Gallery | `home/GalleryPreview` | 6-col bento masonry from album images (product-image fallback) |
| FAQ | `home/Faq` (client) | heading + contact card, 3D flip cards, email linkify |
| Get started | `home/GetStarted` | 3-block CTA (provider dark / custom-build / final) |
| Logo cloud | `home/LogoCloud` | dual CSS marquee rows of client logos |

Verified on the local production build (`localhost:3466/en`): every section renders with
real Supabase data (category counts, product pricing, customer logos), client islands
hydrate (event-type accordion + FAQ flip confirmed interactive).

### Footer — ✅ full port
`components/layout/SiteFooter` now mirrors `src/components/layout/Footer.tsx`: brand block
(logo + description + trust badge + social row incl. WhatsApp), Categories / Company /
Support / Legal / Contact columns on desktop, `<details>` accordions on mobile (no JS),
the contact-email registry, and the Made-in-Jordan bottom bar. Categories are passed from
the layout to respect the `components/ ↔ server/` import boundary.

### Product details `/products/[slug]` — ✅ interactive gallery
`features/catalog/ProductGallery` (client island): large main image + selectable thumbnail
strip; clicking a thumbnail switches the main image with a selected-ring state. Keyboard
accessible (`role=tablist/tab`, `aria-selected`), RTL-safe, first image stays the LCP
candidate. Verified in real chromium: thumbnail click flips `aria-selected` and swaps the
main `src`.

### Known technical fixes (this pass)
- Localized **Event Types** on `/ar` (was a hardcoded English array).
- Localized **search result type labels** (service / category).
- **Contact page**: removed the placeholder WhatsApp number and "form coming soon" text;
  now renders real channels (email / phone / WhatsApp) from the ported `social.ts`.
- Repaired the stale `data-testid="locale-value"` E2E assertion; the 404 spec now asserts a
  **real HTTP 404** (ADR-23) for unknown paths and missing products.
- CI now runs **all four** E2E projects (en/ar × desktop/mobile).

## Localization
All ported UI/marketing copy is fully bilingual (EN + AR) via next-intl — hero, all 10 home
sections, footer, contact, search. Catalog **data** (product/category names & descriptions)
remains EN on `/ar` until the `*_ar` columns are applied (DBMIG-002 staging + backfill) — a
data gate, not a visual regression.

## Validation (all green)
`typecheck` · `lint` (import zones + i18n physical-direction) · `gate:arch`
(server-only / QG-ARCH-3/4 / ENV-002) · `gate:i18n` (en/ar in sync, 4 domains) ·
`gate:cycles` (madge, no cycles) · `format` · unit + contract tests (83 passed) ·
production `build` (74 static pages, home is SSG).

## Second pass — the four flagged differences are now closed (verified live)
1. **Hero backdrop** — ✅ fixed animated `MeshGradient` (paper-design `HeroBackground` island,
   motion + visibility gated, `ssr:false`) over the ported `AnimatedBackground` base, wired by
   `SiteBackground` on the hero routes. Hero is transparent, pulls up under the navbar, uses
   `hero-title-silver`, and carries the rotating "Eventies · Plan · Request · Celebrate" badge
   ring. Verified EN + AR (RTL).
2. **Navbar** — ✅ `SiteNav`: transparent-over-hero → opaque-on-scroll, priority buckets
   (Home · Categories▾ · Services · Gallery), More menu < 1720px, inline desktop search with
   live suggestions, mobile drawer (search + link grid + categories), brand-logo tone swap,
   RTL-mirrored. Verified desktop + mobile drawer.
3. **Products / Categories / Category detail / Gallery / Customers / Custom Builds / About /
   Contact** — ✅ every hero-background route now renders `EventiesHero` (white text over the
   backdrop) + a light content band. Products carries the **5 rotating/swaying floating hero
   cards** (`ProductsHeroShowcase`); Customers the **dual CSS logo marquee**; Custom Builds and
   About carry substantial multi-section content.
4. **/customers marquee** — ✅ ported (reused `LogoCloud`).

**Search** (item 10): the Vite search is an *inline* navbar field with a live suggestions
dropdown (not a modal) — now ported in `SiteNav`; the earlier Next `SearchDialog` modal was
removed.

## Validation (second pass — all green)
`format` · `typecheck` · `lint` · `gate:arch` · `gate:i18n` · `gate:cycles` · 83 unit/contract
tests · production build (74 pages) · **all 4 Playwright projects (20/20)** · **real HTTP 404**
(unknown path + missing product, EN + AR) · **SEO parity: 0 unexplained deltas across 9 routes**
· 4-viewport EN/AR screenshots regenerated under `shots/next/`.

## Explicit remaining differences (with technical rationale)
1. **Custom Builds** — the Vite `CustomBuildsPage` is **2705 lines** of bespoke LAB/IN_PROGRESS
   showcases whose data arrays are **intentionally empty** (project decision, memory
   `custom-builds-page`). The port reproduces the faithful spirit (R&D hero, capabilities,
   idea→floor process, real-builds gallery, CTA); the empty-by-design blocks render no content
   and are not reproduced.
2. **Gallery lightbox** — dominant-color backdrop behind the open image is a minor nicety not
   yet ported (open/Escape/arrows/prefetch behavior is ported).
3. **Auth/cart** header actions + the **full contact submit form** are **P3** (no auth/forms in
   the public P2 app) — intentionally reserved, not simplified.
4. `/ar` **catalog data** (product/category names) stays EN until `*_ar` columns are applied
   (DBMIG-002 staging + backfill) — a data gate, not a visual one.

## Constraints honoured
No `--prod`; production domain and production Vercel project untouched; not merged into
`main`; Phase 3 not begun; `npm audit fix --force` not run. **CAT-024 remains owner-approval
only.**
