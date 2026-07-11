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

## Explicit remaining differences (not yet at full parity)
1. **Hero backdrop**: static dark gradient vs the Vite fixed animated `MeshGradient`
   (paper-design) shader behind a transparent navbar. The WebGL corner badge is ported;
   the full-bleed animated backdrop + transparent-over-hero navbar architecture is the main
   hero delta.
2. **Navbar**: functional (all primary links, search, language toggle, mobile menu) but not
   yet the Vite adaptive priority-bucket nav (More menu < 1720px). Cart/login are P3.
3. **Products / Categories / Custom Builds / About**: content-complete but not yet the full
   Vite `EventiesHero` (rotating cards) / rich narrative layouts.
4. **/customers**: static grid vs the Vite logo marquee (the home `LogoCloud` marquee IS
   ported).

## Constraints honoured
No `--prod`; production domain and production Vercel project untouched; not merged into
`main`; Phase 3 not begun; `npm audit fix --force` not run. **CAT-024 remains owner-approval
only.**
