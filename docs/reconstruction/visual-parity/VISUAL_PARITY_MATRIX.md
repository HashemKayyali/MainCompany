# CAT-024 — Visual Parity Matrix

Source of truth: the **Vite app at the repository root** (`src/`). Target: `eventies-next/`. Status legend: ✅ ported-faithful · 🟡 design-system-in-place, component port in progress · ⛔ data/owner-gated.

Screenshots (both apps, 1440×1000 & 390×844, EN & AR) live under `docs/reconstruction/visual-parity/shots/{legacy,next}/`. **CAT-024 is owner-approved only** — this matrix tracks code-side status, not sign-off.

## Design system
- **Ported verbatim** into `eventies-next/src/app/globals.css` (2,109 lines from `src/styles/input.css` + `src/styles/site.css`): brand/ink CSS vars, `hero-title-silver`, `glass`, `section-shell/label/title`, `premium-card`, `home-band`, `site-container-wide`, gradients, shadows, scrollbars, RTL rules. Fonts by literal family name (Alexandria/Sora Google Fonts, Zodiak Fontshare, IBM Plex Sans Arabic). ✅

## Routes

| # | Route | Legacy Vite page | Legacy components | Next destination | Assets | Animations / interactions | Responsive | RTL | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Home `/` | `pages/HomePage.tsx` | Hero, BrowseCategories, PopularServices, HowItWorks, EventTypes, CustomBuildPreview, GalleryPreview, FAQ, HomeCTA, LogoCloud | `app/[locale]/page.tsx` + `features/catalog/hero`, `home/HomeSections` | hero-bg-event.webp, category/product images (Cloudinary) | framer entrance, floating cards, WebGL badge, reveal-on-scroll, gallery warmup | home-band bands, grid reflow | logical CSS, chip dir | 🟡 hero+sections ported; full band stack (FAQ/LogoCloud/GalleryPreview) pending |
| 2 | Header | `components/layout/Navbar.tsx` | priority nav buckets, More menu, search, cart, login | `components/layout/SiteHeader` + `NavMenu` | brand logo webp | adaptive nav modes (<1720px More menu), search dialog | desktop inline / mobile toggle | dir-aware | 🟡 functional; adaptive-bucket parity + cart/login pending (auth is P3) |
| 3 | Desktop nav | Navbar priority buckets | — | `NavMenu` (md:flex) | — | hover states | ≥md inline | — | 🟡 |
| 4 | Mobile nav | Navbar mobile drawer | — | `NavMenu` (<md toggle) | — | drawer open/close | <md | — | 🟡 drawer vs Vite panel |
| 5 | Footer | `components/layout/Footer.tsx` | link columns, contact | `components/layout/SiteFooter` | — | — | grid cols | dir-aware | 🟡 columns present; exact composition pending |
| 6 | Search | Navbar search + dialog | search field/results | `features/catalog/SearchDialog` | — | open/focus/Escape/backdrop | modal | dir=auto | ✅ behavior; visual polish pending |
| 7 | Categories `/categories` | `pages/CategoriesPage.tsx` | EventiesHero, category cards | `app/[locale]/categories/page.tsx` | category images | reveal, hover | grid | logical | 🟡 grid vs Vite hero+cards |
| 8 | Category details `/categories/[slug]` | `pages/CategoryPage.tsx` | hero, product grid | `.../categories/[slug]/page.tsx` | images | — | grid | logical | 🟡 |
| 9 | Products `/products` | `pages/ProductsPage.tsx` | EventiesHero (rotating cards), SectionHeading, ProductCard, Chip filters, FramedImage | `.../products/page.tsx` + `ProductCard` | images | hero card rotation, filter chips, framer list | grid | logical | 🟡 listing+filter present; EventiesHero + FramedImage pending |
| 10 | Product details `/products/[slug]` | `pages/ProductDetailsPage.tsx` | gallery w/ selected-thumb, info sections, CTA, parts | `.../products/[slug]/page.tsx` | images | thumbnail switching, image state | 2-col → stack | logical | 🟡 static gallery; interactive thumbnail-switch gallery pending |
| 11 | Gallery `/gallery` | `pages/GalleryPage.tsx` | album grid, progressive images | `.../gallery/page.tsx` + `GalleryGrid` | album images | progressive batches, IO, content-visibility | grid | logical | ✅ progressive grid ported |
| 12 | Gallery lightbox | lightbox component | prefetch±1, gestures | `GalleryGrid` lightbox | images | open, Escape, arrows, prefetch | fullscreen | RTL arrows | ✅ behavior; dominant-color bg pending |
| 13 | Custom Builds `/custom-builds` | `pages/CustomBuildsPage.tsx` (128KB) | rich build showcase | `.../custom-builds/page.tsx` | images | rich sections | grid | logical | 🟡 card grid vs full showcase |
| 14 | Customers `/customers` | `pages/CustomersPage.tsx` | marquee logo wall | `.../customers/page.tsx` | logos | marquee animation | grid | logical | 🟡 static grid vs marquee |
| 15 | About `/about` | `pages/AboutPage.tsx` (59KB) | rich narrative sections | `.../about/page.tsx` | images | reveal | sections | logical | 🟡 shell vs full narrative |
| 16 | Contact `/contact` | `pages/ContactPage.tsx` (36KB) | contact form, channels | `.../contact/page.tsx` | — | form (P3) | layout | logical | 🟡 form is P3; placeholder REMOVED |
| 17 | Legal `/privacy-policy` … | `pages/LegalPage.tsx` | doc renderer | `features/legal/LegalDocView` + 5 pages | — | — | prose | logical | ✅ bilingual dict ported |

## Notes
- `/ar` content is EN until the `*_ar` columns are applied (DBMIG-002 staging + backfill) — a data gate, not a visual one.
- Contact form + cart/login header actions are **P3** (auth/forms) by phase scope — not visual regressions.
