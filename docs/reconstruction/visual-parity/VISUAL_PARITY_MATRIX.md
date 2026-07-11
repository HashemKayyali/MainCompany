# CAT-024 — Visual Parity Matrix

Source of truth: the **Vite app at the repository root** (`src/`). Target: `eventies-next/`. Status legend: ✅ ported-faithful · 🟡 design-system-in-place, component port in progress · ⛔ data/owner-gated.

Screenshots (both apps, 1440×1000 & 390×844, EN & AR) live under `docs/reconstruction/visual-parity/shots/{legacy,next}/`. **CAT-024 is owner-approved only** — this matrix tracks code-side status, not sign-off.

## Design system
- **Ported verbatim** into `eventies-next/src/app/globals.css` (2,109 lines from `src/styles/input.css` + `src/styles/site.css`): brand/ink CSS vars, `hero-title-silver`, `glass`, `section-shell/label/title`, `premium-card`, `home-band`, `site-container-wide`, gradients, shadows, scrollbars, RTL rules. Fonts by literal family name (Alexandria/Sora Google Fonts, Zodiak Fontshare, IBM Plex Sans Arabic). ✅

## Routes

| # | Route | Legacy Vite page | Legacy components | Next destination | Assets | Animations / interactions | Responsive | RTL | Status |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Home `/` | `pages/HomePage.tsx` | Hero, BrowseCategories, PopularServices, HowItWorks, EventTypes, CustomBuildPreview, GalleryPreview, FAQ, HomeCTA, LogoCloud | `app/[locale]/page.tsx` + `features/catalog/hero` + `home/{BrowseCategories,PopularServices,HowItWorks,EventTypes,CustomBuildPreview,GalleryPreview,Faq,GetStarted,LogoCloud}` | hero-bg-event.webp, 15 card/event webp, Cloudinary images | framer entrance, floating cards, WebGL badge, reveal-on-scroll, event-type accordion, FAQ flip cards, logo marquee | home-band bands, grid reflow | logical CSS, chip dir | ✅ **all 10 sections ported + verified live** (real data, EN+AR i18n). Remaining: hero uses static dark gradient vs animated MeshGradient bg |
| 2 | Header | `components/layout/Navbar.tsx` | priority nav buckets, More menu, search, cart, login | `components/layout/SiteHeader` + `NavMenu` | brand logo webp | adaptive nav modes (<1720px More menu), search dialog | desktop inline / mobile toggle | dir-aware | 🟡 functional; adaptive-bucket parity + cart/login pending (auth is P3) |
| 3 | Desktop nav | Navbar priority buckets | — | `NavMenu` (md:flex) | — | hover states | ≥md inline | — | 🟡 |
| 4 | Mobile nav | Navbar mobile drawer | — | `NavMenu` (<md toggle) | — | drawer open/close | <md | — | 🟡 drawer vs Vite panel |
| 5 | Footer | `components/layout/Footer.tsx` | brand block, 5 link columns, contact emails, mobile accordions, bottom bar | `components/layout/SiteFooter` | brand logo webp | mobile `<details>` accordions, social hover | 5-col desktop / accordion mobile | dir-aware, logical props | ✅ **full port** (brand+trust badge+social, Categories/Company/Support/Legal/Contact, contact-email registry, Made-in-Jordan bar); EN+AR |
| 6 | Search | Navbar search + dialog | search field/results | `features/catalog/SearchDialog` | — | open/focus/Escape/backdrop | modal | dir=auto | ✅ behavior; visual polish pending |
| 7 | Categories `/categories` | `pages/CategoriesPage.tsx` | EventiesHero, category cards | `app/[locale]/categories/page.tsx` | category images | reveal, hover | grid | logical | 🟡 grid vs Vite hero+cards |
| 8 | Category details `/categories/[slug]` | `pages/CategoryPage.tsx` | hero, product grid | `.../categories/[slug]/page.tsx` | images | — | grid | logical | 🟡 |
| 9 | Products `/products` | `pages/ProductsPage.tsx` | EventiesHero (rotating cards), SectionHeading, ProductCard, Chip filters, FramedImage | `.../products/page.tsx` + `ProductCard` | images | hero card rotation, filter chips, framer list | grid | logical | 🟡 listing+filter present; EventiesHero + FramedImage pending |
| 10 | Product details `/products/[slug]` | `pages/ProductDetailsPage.tsx` | gallery w/ selected-thumb, info sections, CTA, parts | `.../products/[slug]/page.tsx` + `features/catalog/ProductGallery` | images | thumbnail switching, selected-ring state | 2-col → stack | logical, tablist a11y | ✅ **interactive gallery ported + verified** (thumbnail-switch, aria-selected, LCP-priority main); info sections + parts present |
| 11 | Gallery `/gallery` | `pages/GalleryPage.tsx` | album grid, progressive images | `.../gallery/page.tsx` + `GalleryGrid` | album images | progressive batches, IO, content-visibility | grid | logical | ✅ progressive grid ported |
| 12 | Gallery lightbox | lightbox component | prefetch±1, gestures | `GalleryGrid` lightbox | images | open, Escape, arrows, prefetch | fullscreen | RTL arrows | ✅ behavior; dominant-color bg pending |
| 13 | Custom Builds `/custom-builds` | `pages/CustomBuildsPage.tsx` (128KB) | rich build showcase | `.../custom-builds/page.tsx` | images | rich sections | grid | logical | 🟡 card grid vs full showcase |
| 14 | Customers `/customers` | `pages/CustomersPage.tsx` | marquee logo wall | `.../customers/page.tsx` | logos | marquee animation | grid | logical | 🟡 static grid vs marquee |
| 15 | About `/about` | `pages/AboutPage.tsx` (59KB) | rich narrative sections | `.../about/page.tsx` | images | reveal | sections | logical | 🟡 shell vs full narrative |
| 16 | Contact `/contact` | `pages/ContactPage.tsx` (36KB) | contact form, channels | `.../contact/page.tsx` | — | form (P3) | layout | logical | 🟡 form is P3; placeholder REMOVED |
| 17 | Legal `/privacy-policy` … | `pages/LegalPage.tsx` | doc renderer | `features/legal/LegalDocView` + 5 pages | — | — | prose | logical | ✅ bilingual dict ported |

## Notes
- `/ar` **UI/marketing copy is now fully localized** (hero, all 10 home sections, footer, contact, search labels, event types). `/ar` **catalog data** (product/category names & descriptions) stays EN until the `*_ar` columns are applied (DBMIG-002 staging + backfill) — a data gate, not a visual one.
- Contact form + cart/login header actions are **P3** (auth/forms) by phase scope — not visual regressions.

## Remaining faithful-port work (explicit differences)
- **Hero background**: Next hero uses a static dark gradient; Vite uses a fixed animated `MeshGradient` (paper-design) shader behind a transparent navbar. WebGL corner badge is ported; the full-bleed animated backdrop + transparent-over-hero navbar architecture is the main remaining hero delta.
- **Navbar**: functional (all primary links, search, language toggle, mobile menu) but not yet the Vite adaptive priority-bucket nav (More menu <1720px). Cart/login actions are P3.
- **Products listing / Categories / Custom Builds / About**: content-complete but not yet the full Vite `EventiesHero` (rotating cards) / rich narrative layouts.
- **Customers**: static grid vs Vite logo marquee (the home `LogoCloud` marquee IS ported; the `/customers` page marquee is pending).
