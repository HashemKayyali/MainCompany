# 10 — IMAGE CONSTITUTION

## Delivery (ADR-08)
Custom loader `lib/image-loader.ts` delegating to the KEPT `toCloudinaryTransformUrl` (`c_limit,w_{n},f_auto,q_auto`); Vercel optimizer bypassed (no image billing). `next/image` + loader on catalog/marketing surfaces; ported `<img srcset>` components inside admin interiors and lightbox internals. Legacy Supabase-Storage URLs served via the existing render-API fallback (read-only estate).

## Per-surface registry (preset = legacy `image-delivery.ts` presets, KEPT)
| Surface | Preset | Component | sizes | Loading | Placeholder/CLS | Max transfer target |
|---|---|---|---|---|---|---|
| Hero (LCP) | hero | next/image, `fetchPriority="high"` + `loading="eager"` (+ `preload` only if template analysis designates it THE LCP asset) | 100vw | eager, preconnect exists | explicit W/H | ≤180 KB |
| Category banner | category | next/image | 100vw→50vw | lazy below fold | W/H | ≤120 KB |
| Product card | card | next/image | per grid cols | lazy | W/H ratio box | ≤90 KB |
| Product detail main | detail | next/image; `fetchPriority="high"`+eager only when template analysis marks it the LCP candidate, otherwise default lazy | 100vw→60vw | eager first, rest lazy | W/H | ≤200 KB |
| Thumbnails | thumbnail | next/image | fixed px | lazy | W/H | ≤30 KB |
| Gallery grid | gallery | progressive batches (~12) + IO | col-based | first viewport eager, rest lazy | ratio boxes; `content-visibility:auto` | ≤130 KB each |
| Lightbox | fullscreen | ported component | — | on open; prefetch ±1 only | dominant-color bg | ≤350 KB |
| Avatars | tiny | next/image fixed | fixed | lazy | circle skeleton | ≤10 KB |
| Logos | logo | next/image | fixed | lazy | W/H | ≤25 KB |
| Admin previews | thumbnail | ported `<img>` | fixed | lazy | W/H | ≤30 KB |
| Social OG | static file | — | — | — | 1200×630 | **≤100 KB** (P0 fix: current 1.5 MB) |
Failure fallback: single shared `image-fallback.svg` (exists in public/) via one error-handling wrapper.

## Next 16 loading strategy rules (V2.1)
Do not use legacy `priority` reflexively. Per surface: LCP hero/detail-first → `fetchPriority="high"` + `loading="eager"` (+ `preload` only for the single true LCP asset, decided per template, never several); everything below the fold → default lazy; NEVER combine conflicting signals (e.g. lazy + fetchPriority high, or preload + lazy). Exact `next/image` prop mapping for the pinned 16.x is verified at FOUND-035 and locked in `lib/image-loader.ts` docs.

## Upload & estate policy
- New uploads: Cloudinary ONLY (folder-whitelisted signed uploads via the KEPT Edge Fn). Supabase Storage receives no new images.
- Enforcement via **signed upload preset** (ADR-21): preset defines `allowed_formats` (jpg,png,webp,avif) + `max_file_size` (provisional 10 MB), enforced server-side by Cloudinary; Edge Fn authorizes preset+folder only. Client checks are UX. Negative test UPL-NEG blocking — SEC-012/ADMIN-015.
- Per-admin signing quota (provisional 30/h) — SEC-013.
- GC procedure: existing storage-gc tooling scheduled monthly; SAFE_CANDIDATE batches deleted after report review; verify step mandatory; reports committed to `storage-gc-reports/`.
- Orphans: Cloudinary-asset-without-DB-row and DB-row-without-asset both surfaced by the identity layer + GC reports; reconciliation is an operational runbook item, not silent code.
