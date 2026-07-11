# 06 — DATA & CACHE CONSTITUTION

## Cache model (ADR-19 — Next 16 Cache Components, single primary model)
DAL functions in `server/dal/*` are the only cache owners: `'use cache'` + `cacheTag(...)` inside the DAL function + `cacheLife` named profiles (`catalog` ≈1h, `daily` ≈24h) defined once in `server/cache/cache-life.ts`. Route-level `revalidate` constants and `unstable_cache` are banned (mixed models = review-blocking). Personal/session domains never use `use cache`. Invalidation uses the current non-deprecated `revalidateTag` form (exact signature verified + locked at FOUND-035; one-argument deprecated usage banned). Admin-edited entities require fresh-on-next-request semantics; pure marketing surfaces may use stale-while-revalidate profiles. New slugs resolve on demand; `generateStaticParams` is warm-up only, never correctness. Delete → tag invalidation → DAL null → `notFound()` → HTTP 404. Conformance: CACHE-MODEL suite (CACHE-005).

## Tag naming convention (single source: `server/cache/tags.ts`)
`catalog:products` · `catalog:product:{slug}` · `catalog:categories` · `catalog:category:{slug}` · `catalog:parts` · `builds:list` · `builds:categories` · `customers:list` · `gallery:albums` · `home:content` · `legal:{doc}`

## Domain registry (one owner each — Constitution §4)
| Domain | Source of truth | Owner/render | Cache | Invalidation | Staleness tol. | Failure behavior |
|---|---|---|---|---|---|---|
| products/parts | Supabase | server RSC (ISR) | cacheTag + cacheLife 'catalog' | admin mutation → `/api/revalidate` | mins–1h backstop | serve last good HTML |
| product detail | Supabase | RSC + `generateStaticParams` | `catalog:product:{slug}` · cacheLife 'catalog' | edit/delete → tag; delete → 404 | delete ≤ mins | last good / 404 |
| categories | Supabase | RSC | cacheTag · 'catalog' | same | same | same |
| custom builds (+cats) | Supabase | RSC | `builds:*` · 'catalog' | same | same | same |
| customers wall | Supabase | RSC | tag · cacheLife 'daily' | same | hours | same |
| gallery albums | Supabase | RSC list; images client-progressive | `gallery:albums` · 'catalog' | same | mins–1h | same |
| home composition | derived | RSC | `home:content` (+ member tags) | fan-out from catalog tags | 1h | same |
| search/filters | derived | URL state over server list | none extra | — | — | — |
| legal docs | repo/DB | RSC | 86400 | deploy/edit | day | — |
| profile | Supabase | server fetch | **no-store** | — | none | error+retry UI |
| requests/quotes | Supabase | server fetch + client detail | **no-store** | — | none | error+retry |
| notifications | Supabase | client + realtime | none | realtime | none | reconnect protocol |
| chat | Supabase | client + realtime | none | realtime | none | reconnect protocol |
| admin grids | Supabase | client fetch | **no-store** | explicit refresh | none | error+retry |
| cart/drafts | client | client localStorage (KEEP) | n/a | user actions | user-owned | — |

## Hard rules
1. **No cross-user caching:** any code path touching cookies/session is `no-store`; CI grep gate forbids `revalidate`/`force-cache`/`unstable_cache` in files importing `server/supabase/session` (QG-ARCH-3).
2. Every cached DAL read carries a cacheLife TTL backstop — missed tag invalidation self-heals within the profile window (≤1h catalog) (ADR-07/19).
3. Deletion invalidation: delete → detail tag + list tags + `home:content`; detail route returns `notFound()`; sitemap reflects automatically (live query).
4. Revalidation failure: admin UI shows "Saved — site refresh pending (auto ≤1h)" + Retry; `revalidate.failed` event; no outbox (ADR-07 revisit condition).
5. Invalidation graph: product → {product:{slug}, products, home} · category → {category:{slug}, categories, products, home} · gallery → {gallery:albums, home} · build → {builds:*, home} · customer → {customers:list, home}.
6. `force-dynamic` as a blanket escape hatch is banned (Master Plan §25.8): dynamic behavior comes from the domain registry above, never from silencing cache errors.
7. Module demo-data fallbacks (`src/data/defaults.ts` et al.) are not a data source in the new app — REMOVE (Deletion Ledger DEL-05).
