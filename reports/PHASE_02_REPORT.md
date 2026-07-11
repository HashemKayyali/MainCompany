# PHASE 02 REPORT — Public Catalog + SEO + Images

Date: 2026-07-11 · Branch `eventies-next-reconstruction` · App `eventies-next/`

## Status: **substantial core DONE and verified; four items BLOCKED on human gates; visual-heavy surfaces and Arabic content are follow-ups.** QG-P2 is **not yet fully met** — the blockers are enumerated with exact reasons.

Build: **107 pages** compile; tsc / lint / arch-gate (QG-ARCH-3/4, ENV-002) / i18n-cov / 76 unit tests all green. Verified on a local prod server.

## Done and verified

- **SEO spine (SEO-001..016):** typed metadata builder with field-for-field parity formulas transcribed from the audited prerender; per-locale canonical + hreflang en/ar/x-default + OG/Twitter; global Organization+WebSite JSON-LD on every page; ItemList (listings), Product (detail), CollectionPage, BreadcrumbList; sitemap route handler (live query, **45 URLs = DB truth**, xhtml alternates + /custom-builds); robots.txt byte-identical; manifest.
  - **SEO-014 parity run: 9 routes, 0 unexplained deltas** vs the P0 baseline (`reports/seo-parity/PARITY_DIFF.json`) — only the constitution-approved `og-default.png→.jpg` swap.
  - **Approved delta (OQ-1):** Product JSON-LD ships WITHOUT `offers` per 11 §JSON-LD ("ship Product without offers rather than misleading schema"). Deliberate, constitution-authorized divergence from the Vite prerender.
- **Catalog surfaces (RSC on the ADR-19 cache model):** layout shell (header/nav island/footer, skip-link, semantic landmarks, language switcher); /products listing with URL-param category filter; product card; /products/[slug] detail (ISR warm via generateStaticParams) + parts + thumbnails; /categories list + detail; /custom-builds; /customers; /gallery (progressive grid island — batches/IO/content-visibility/stable-keys + lightbox with prefetch±1 and RTL arrows); /about + /contact shells; legal ×5 (ported bilingual dict); loading + localized not-found.
- **Images (ADR-08):** next/image custom Cloudinary loader wired — verified live transforms (`c_limit,w_*,f_auto,q_auto`); SmartImage error-fallback + ratio boxes; detail-main LCP eager+high.
- **CAT-018 redirects:** all five alias→primary as **308**, both EN and /ar (verified via curl).
- **/ar:** every route renders through `[locale]` with Arabic chrome (nav/footer/catalog dictionaries); dir=rtl.
- **I18N-009 / DBMIG-004:** additive `*_ar` migration FILE authored (nullable, frozen-Vite-safe).

## BLOCKED — exact reasons (not self-resolvable)

1. **CAT-010 / SEO-404 (real HTTP 404):** a missing/deleted product or category renders the localized **not-found UI with `<meta robots=noindex>` but at HTTP 200**, not 404 — the **D-P1-01 cacheComponents PPR limitation** (the static shell commits 200 before the dynamic `notFound()` runs; route-segment `dynamic` opt-outs are build-rejected under cacheComponents). Making these real 404s means **opting the detail routes out of the ADR-19 cache model** — an architecture trade-off that is a ⛔ **human ADR decision**, not self-approved. SEO impact is contained (the page is noindexed), but the strict gate is unmet.
2. **DBMIG-002 staging DB → DBMIG-004/005, I18N-010/011, ARB-001..010:** the `*_ar` columns can't be applied to staging (no branch/staging DB — owner action, `docs/DBMIG_PIPELINE.md`), and can't be applied to prod (⛔ human gate). So the AR read-path coalesce selects (I18N-010), coverage report (I18N-011), and the entire Arabic backfill + launch gate (ARB) are blocked. **`/ar` renders structurally but shows EN content until the columns exist and are backfilled.**
3. **CAT-024 visual-parity approval:** a ⛔ human gate by definition; the pages are functional and accessible but not pixel-matched to the Vite visuals.
4. **IMG-008 GC batch:** human-run.

## Deferred within P2 (buildable, not done this session — scope)

- CAT-002 WebGL hero as ssr:false island (static server hero shipped instead); CAT-004 gallery strip; CAT-019 search dialog; CAT-021 reveal animations; CAT-025/026 + FAQ/how-it-works marketing sections — the home is real, indexable, and cutover-shaped but not the full 16-section stack.
- CACHE-005 CACHE-MODEL conformance suite; IMG-014 bundle/image budget report; A11Y-007/008 (motion/contrast, tied to the deferred animations); route-group folders (marketing)/(catalog) (routes live directly under [locale] — organizational only, same URLs).

## Discoveries / new tasks proposed

- **NEW (⛔ ADR): real-404 strategy under cacheComponents** — decide per-route-group whether detail routes leave the PPR/cache model to emit HTTP 404, or whether noindex-at-200 is accepted for deleted entities (with a redirect-to-listing alternative). Blocks the SEO-404 gate.
- **Folder-structure note:** pages placed under `[locale]/*` rather than `[locale]/(marketing|catalog)/*` — propose adopting the groups in a follow-up (cosmetic, no URL change).

## Exit criteria (QG-P2)

**Partial.** SEO parity (EN) passes with zero unexplained deltas; catalog + images + i18n plumbing green; **SEO-404 blocked (ADR)**, **/ar content blocked (DBMIG-002 + ARB)**, **visual parity pending human approval**. Group A EN cutover-readiness is **conditional** on the SEO-404 ADR and the deferred home sections. **Phase 3 not started.**
