# Public Website i18n / RTL / Bidi Audit Report (Phase 7.6)

Branch: `admin-panel-redesign-mobile-first` · Uncommitted · Date: 2026-07-04

## 1. Executive summary
Same architecture as Phase 7.5 (dictionaries + `arPhraseMap` + `DocumentI18nBridge` DOM walker with `data-i18n-skip` opt-out). Public partial translation was again a **coverage problem**: 190 public-scope UI phrases had no Arabic entry. After fixes: **26 remain, all intentional** (SEO metas, brand/technical tokens, entity-encoding/regex false positives). Dynamic DB content is now bridge-protected + bidi-isolated on the highest-traffic public surfaces via the shared `BidiText`.

## 2. Architecture / discovery
- Routes discovered from `src/utils/route-preload.ts` + `router` (eager: `/`, `/products`, `/custom-builds`, `/categories`, `/customers`, `/gallery`, `/about`, `/contact`; lazy: product/category details, auth flows, profile, rental-cart, checkout, order-summary, purchase-quote, my-requests(+details), legal pages, 404).
- 106 public-scope files scanned (`src/pages` minus admin, `src/components` minus admin, `src/contexts`, `src/config`) by the new **`scripts/audit-public-i18n.mjs`** (same proven extraction logic as the admin script; read-only).

## 3. Coverage numbers
| | count |
|---|---|
| `arPhraseMap` keys before | 1423 |
| Public missing phrases before | **190** |
| Added (Phase 7.6 block + apostrophe variants) | ~168 |
| Missing after | **26 — all intentional** |

Intentional exclusions: SEO meta titles/descriptions (8+5 legal metas — kept English because `prerender-seo.mjs` indexes EN HTML; translating meta would alter indexed content), `Eventies`, `WhatsApp`, `JOD`, `API`, `Supabase not configured` (dev-only), `Auth Callback` (transient), `Promise` (regex FP), 3 `&amp;`/`&apos;` source-encoding false-negatives whose **decoded runtime forms are covered**.

## 4. Notable failure cases found & fixed
- **Case F (exact-string mismatch), real instances:** JSX `&apos;` renders a *straight* apostrophe (U+0027) at runtime while existing map entries used curly `’` (bridge does not normalize apostrophes) → added straight variants for NotFound/MyRequests/MyRequestDetails strings. Also the HomePage meta phrase had drifted `—` → `,` (comma variant added).
- **Fragment sentences** (`Page not` + `found`, `Something went` + `wrong` split across spans): per-fragment entries added — flagged as fragile in §8.
- **Duplicate-entry collisions** caught by `tsc` (3 total across both passes) — resolved by keeping the pre-existing entries.
- Auth/toast/status chrome (`UserContext` toasts, `RequestJourney` timeline labels, `GoogleIdentityButton` states, ErrorBoundary, AdminGuard fallbacks) — all now covered.

## 5. Dynamic-content protection & bidi (shared strategy)
- **`BidiText` promoted to `src/components/ui/BidiText.tsx`** (Option B): admin path `src/components/admin/BidiText.tsx` is now a re-export — one implementation, zero import churn, no competing abstraction.
- Applied to public **`ProductCard`** (name, shortDescription, DB category label) — covers Products page, Home featured, related carousels, and the admin live preview — and **`ProductDetailsPage`** (breadcrumb name + `<h1>`).
- Technical LTR: Footer `tel:` links already had `dir="ltr"`; email addresses are all-strong-LTR runs (stable); request numbers/slugs handled in 7.5 for admin.

## 6. SEO / prerender safety
- No route, slug, canonical, JSON-LD, OG, or meta architecture touched. Meta strings intentionally left EN. `npm run build` ran `prerender-seo.mjs` successfully (38 routes generated).

## 7. Live verification
| Check | Result |
|---|---|
| `/products` AR (375px) | ✅ RTL, Arabic chrome, English DB names/categories LTR via `<bdi>` (computed `direction: ltr`), no raw keys, no overflow |
| AR → EN switch (no reload) | ✅ instant, zero Arabic leftovers, `dir` flips |
| EN → AR switch | ✅ same bridge mechanism, verified in 7.5 + this pass |
| tsc / build | ✅ / ✅ (`✓ built in 13.49s`) |
| Statically inspected only | Gallery, About, Auth pages, Cart/Checkout/Quote flows, Legal, 404 (string coverage via audit script; not every page loaded in browser this pass) |

## 8. Remaining risks
1. **BidiText coverage is targeted**: ProductCard + ProductDetails title. Gallery captions, custom-build titles, request-item names, profile display name still rely on "not in phrase map ⇒ untranslated" (safe today, but a DB value exactly matching a UI phrase would be translated there). Mechanical follow-up.
2. Fragment translations (`Page not`/`Something went`) depend on markup shape; if those components are refactored, re-run the audit.
3. Arabic copy is MSA authored in-pass; native review recommended.
4. `header-3.tsx` contains template-ish nav strings (`Analytics`, `API`, `Integrations`) that look like unused menu data — translated the used ones; consider pruning dead data in Phase 8.
5. Pages verified statically (audit script) but not browsed this pass (list in §7) should get a click-through in Phase 8's bilingual sweep.
