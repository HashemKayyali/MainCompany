# CAT-024 — Visual Parity Matrix

Source of truth: the **Vite app at the repository root** (`src/`). Target: `eventies-next/`. Status legend: ✅ ported-faithful · 🟡 design-system-in-place, component port in progress · ⛔ data/owner-gated.

Screenshots (both apps, 1440×1000 & 390×844, EN & AR) live under `docs/reconstruction/visual-parity/shots/{legacy,next}/`. **CAT-024 is owner-approved only** — this matrix tracks code-side status, not sign-off.

**Owner decision (2026-07-12): `CAT-024 = DEFERRED_BY_OWNER`.** This is not approval and must not be recorded as DONE. It does not block Phase 3, but final owner approval is a mandatory pre-cutover gate before Phase 7 or any production-domain switch.

## Design system
- **Ported verbatim** into `eventies-next/src/app/globals.css` (2,109 lines from `src/styles/input.css` + `src/styles/site.css`): brand/ink CSS vars, `hero-title-silver`, `glass`, `section-shell/label/title`, `premium-card`, `home-band`, `site-container-wide`, gradients, shadows, scrollbars, RTL rules. Fonts by literal family name (Alexandria/Sora Google Fonts, Zodiak Fontshare, IBM Plex Sans Arabic). ✅

## Routes

| # | Route | Legacy Vite page | Legacy components | Next destination | Assets | Animations / interactions | Responsive | RTL | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Home `/` | `pages/HomePage.tsx` | Hero, BrowseCategories, PopularServices, HowItWorks, EventTypes, CustomBuildPreview, GalleryPreview, FAQ, HomeCTA, LogoCloud | `app/[locale]/page.tsx` + `features/catalog/hero` + `home/*` | hero-bg-event.webp, 15 card/event webp, Cloudinary | framer entrance, floating cards, WebGL badge + rotating ring, reveal, event-type accordion, FAQ flip, logo marquee | home-band bands, grid reflow | logical CSS, chip dir | ✅ **all 10 sections + hero over animated MeshGradient backdrop; verified live EN+AR** |
| 2 | Header | `components/layout/Navbar.tsx` | priority buckets, More menu, inline search, cart, login | `components/layout/SiteNav` | brand logo webp (tone-swap) | transparent-over-hero → opaque on scroll, More menu <1720px, inline search + suggestions | desktop inline / mobile toggle | dir-aware, RTL-mirrored | ✅ **adaptive priority-bucket nav ported + verified**; cart/login reserved for P3 (no auth in public app) |
| 3 | Desktop nav | Navbar priority buckets | Categories▾, More▾ dropdowns | `SiteNav` (lg:flex) | — | hover pills, dropdown framer, scroll state | ≥lg inline | mirrored | ✅ |
| 4 | Mobile nav | Navbar mobile drawer | drawer, search, link grid | `SiteNav` (<lg) | — | spring drawer, backdrop, scroll-lock | <lg | mirrored | ✅ **verified (drawer opens, link grid, search, categories)** |
| 5 | Footer | `components/layout/Footer.tsx` | brand block, 5 columns, contact emails, mobile accordions, bottom bar | `components/layout/SiteFooter` | brand logo webp | mobile `<details>` accordions, social hover | 5-col desktop / accordion mobile | dir-aware, logical | ✅ **full port** EN+AR |
| 6 | Search | Navbar inline search + suggestions | field/results (product img + category count) | `SiteNav` inline search | product thumbs | live suggestions, category/service badges, keyboard | inline desktop / drawer mobile | dir=auto | ✅ **inline nav search ported** (the Vite search IS inline, no modal) |
| 7 | Categories `/categories` | `pages/CategoriesPage.tsx` | EventiesHero, category cards | `.../categories/page.tsx` + `EventiesHero` + `CategoryGridCard` | category images | EventiesHero entrance, card hover/reveal | grid | logical | ✅ **EventiesHero + light band card grid; verified** |
| 8 | Category details `/categories/[slug]` | `pages/CategoryPage.tsx` | hero, product grid | `.../categories/[slug]/page.tsx` | images | light hero band, reveal | grid | logical | ✅ **light hero band (breadcrumb/title/count/image) + grid; real 404 + cached DAL preserved; verified** |
| 9 | Products `/products` | `pages/ProductsPage.tsx` | EventiesHero (rotating cards), filters, ProductCard | `.../products/page.tsx` + `EventiesHero` + `ProductsHeroShowcase` | product images | **5 rotating/swaying floating hero cards**, filter chips, count, reveal | 5-col grid | logical | ✅ **EventiesHero + rotating showcase + light content band; verified** |
| 10 | Product details `/products/[slug]` | `pages/ProductDetailsPage.tsx` | gallery w/ selected-thumb, info, CTA, parts | `.../products/[slug]/page.tsx` + `ProductGallery` | images | thumbnail switching, selected-ring | 2-col → stack | logical, tablist a11y | ✅ **interactive gallery + verified** |
| 11 | Gallery `/gallery` | `pages/GalleryPage.tsx` | album grid, progressive images | `.../gallery/page.tsx` + `EventiesHero` + `GalleryGrid` | album images | EventiesHero + progressive batches/IO | grid | logical | ✅ **EventiesHero + progressive grid; verified** |
| 12 | Gallery lightbox | lightbox component | prefetch±1, gestures | `GalleryGrid` lightbox | images | open, Escape, arrows, prefetch | fullscreen | RTL arrows | ✅ behavior; dominant-color bg is minor delta |
| 13 | Custom Builds `/custom-builds` | `pages/CustomBuildsPage.tsx` (2705 lines) | R&D showcase | `.../custom-builds/page.tsx` + `EventiesHero` | images | EventiesHero + capabilities + process pipeline + builds gallery + CTA | grid | logical | ✅ **substantial faithful port**; see note on the 2705-line bespoke LAB sections |
| 14 | Customers `/customers` | `pages/CustomersPage.tsx` | marquee logo wall | `.../customers/page.tsx` + `EventiesHero` + `LogoCloud` | logos | EventiesHero + **dual CSS marquee rows** + a11y grid | grid | logical | ✅ **marquee ported + verified** |
| 15 | About `/about` | `pages/AboutPage.tsx` (808 lines) | narrative sections | `.../about/page.tsx` + `EventiesHero` | icons | EventiesHero + mission + values grid + stats + CTA | sections | logical | ✅ **substantial faithful port** |
| 16 | Contact `/contact` | `pages/ContactPage.tsx` (584 lines) | contact form, channels | `.../contact/page.tsx` + `EventiesHero` | — | EventiesHero + real channel cards + social; form is P3 | layout | logical | ✅ **hero + real channels; no placeholder**; full submit form is P3 |
| 17 | Legal `/privacy-policy` … | `pages/LegalPage.tsx` | doc renderer | `features/legal/LegalDocView` + 5 pages | — | — | prose | logical | ✅ bilingual dict ported |

## Notes
- `/ar` **UI/marketing copy is fully localized** (hero, all 10 home sections, footer, nav, all inner-page heroes, contact, search). `/ar` **catalog data** (product/category names & descriptions) stays EN until the `*_ar` columns are applied (DBMIG-002 staging + backfill) — a data gate, not a visual one.
- **Auth/cart** header actions (login, request-draft cart, notifications, user menu) and the **full contact submit form** are **P3** (no auth/forms in the public P2 app). They are intentionally reserved, not simplified — nav/search/logo/language are full-fidelity.

## Remaining explicit differences (with technical rationale)
- **Custom Builds** — the Vite `CustomBuildsPage` is **2705 lines** of bespoke LAB/IN_PROGRESS interactive showcases whose data arrays are **intentionally empty** (project decision, see memory `custom-builds-page`). The ported page reproduces the faithful spirit (R&D hero, capabilities, idea→floor process, real-builds gallery, CTA); the additional empty-by-design bespoke showcase blocks are not reproduced because they render no content.
- **Gallery lightbox** — dominant-color backdrop behind the open image is a minor visual nicety not yet ported (behavior/gestures/prefetch are ported).
- **Contact form** — the full server-submitting contact form is **P3** (FORM group); the page ships real channels (email/phone/WhatsApp) + social, no placeholder.
