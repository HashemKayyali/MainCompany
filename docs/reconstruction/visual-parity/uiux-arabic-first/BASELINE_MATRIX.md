# Arabic-first visual baseline matrix

Captured: 2026-07-15  
Production: `https://www.eventiesjo.com/`  
Compared Preview: `https://eventies-next-preview-ayfdnvmwc-hashemkayyalis-projects.vercel.app`

The baseline was captured with the in-app Chromium browser after scrolling every page to
mount lazy/reveal content and waiting for the page to settle. Raw full-page PNGs are retained
locally under the ignored `raw/` directory; this tracked report records durable findings
without committing redundant large assets.

## Coverage completed

- Locales: Production English; Preview English and Arabic.
- Viewports: `1440x900` and `390x844` completed for the route inventory below.
- Routes: Home, Categories, category detail, Products, product detail, Gallery, Custom Builds,
  Customers, About, Contact, Login, My Requests, and Admin entry.
- Checks: `lang`, `dir`, final URL/redirect, title, first meaningful heading/text, document
  height, scroll width/client width, and horizontal overflow.
- Required viewports `360x800`, `768x1024`, and `1024x768` remain pending until a current safe
  Preview exists. Recapturing the stale Preview would not validate the current commits.

## Desktop document-height comparison (`1440x900`)

| Route | Production EN | Preview EN | Preview result |
| --- | ---: | ---: | --- |
| Home | 7,882 | 4,827 | Material section/content gap |
| Categories | 2,420 | 1,409 | Staging catalog mostly empty |
| Category detail | 1,938 | 900 | 404; equivalent Staging record missing |
| Products | 6,369 | 1,692 | Staging catalog mostly empty |
| Product detail | 3,043 | 900 | 404; equivalent Staging record missing |
| Gallery | 2,414 | 1,409 | Gallery data/album gap |
| Custom Builds | 7,581 | 2,645 | Material section/data gap |
| Customers | 2,435 | 1,409 | Customer data gap |
| About | 7,219 | 2,462 | Material section gap |
| Contact | 5,124 | 2,402 | Material section/detail gap |
| Login | 900 | 1,169 | Both render auth entry |
| My Requests | 1,092 | 1,169 | Both require authentication |
| Admin | 900 | 1,169 | Both redirect to login without credentials |

## Mobile document-height comparison (`390x844`)

| Route | Production EN | Preview EN | Preview AR | Finding |
| --- | ---: | ---: | ---: | --- |
| Home | 11,951 | 8,059 | 7,789 | Material content gap; RTL is active |
| Categories | 3,432 | 1,364 | 1,364 | Catalog data gap |
| Category detail | 2,668 | 990 | 969 | EN/AR 404 |
| Products | 16,864 | 1,863 | 1,762 | Catalog data gap dominates comparison |
| Product detail | 4,533 | 990 | 969 | EN/AR 404 |
| Gallery | 3,179 | 1,364 | 1,364 | Album data gap |
| Custom Builds | 10,165 | 3,746 | 3,640 | Material section/data gap |
| Customers | 3,801 | 1,400 | 1,400 | Customer data gap |
| About | 12,974 | 3,188 | 3,138 | Material section gap |
| Contact | 8,989 | 2,712 | 2,689 | Material section/detail gap |

## Direction and overflow results

- All measured pages reported `scrollWidth <= clientWidth`; no horizontal page overflow was
  detected at either completed viewport.
- Preview English reported `lang=en`, `dir=ltr`; Preview Arabic reported `lang=ar`, `dir=rtl`.
- Production exposes English routes only; `/ar` returns the Production 404. Arabic visual
  correctness must therefore follow the Arabic-first requirements and legacy behavior.
- Authenticated account/admin workflow parity could not be inspected without credentials.

## Priority conclusions

1. Equivalent Staging data is required for meaningful category/product/gallery/custom-build
   visual diffs. A 404 or empty grid is not valid parity evidence.
2. Product detail composition was substantially thinner in Next; the current branch now
   restores the production hierarchy, options, notes, trust/quote panel, and similar services.
3. About, Contact, Custom Builds, and Home remain the largest public-page P1 height/section
   gaps after the product-detail correction.
4. Final screenshots must be recaptured from the current commit after the Vercel Preview
   target regression is resolved.
