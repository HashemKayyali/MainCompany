# Eventies Image Performance Upgrade Report

## Scope

This patch implements a unified image delivery system for the current React/Vite + Supabase Eventies codebase. The goal is to reduce first-visit image bytes, prioritize truly critical images, avoid blank image states and layout shifts, reuse browser/CDN cache more effectively, and prepare the same UI code for optional Supabase image transformations later.

## Main findings

### 1. Fourteen files named `.webp` were not actually WebP

Their binary contents were PNG while the filename extension was `.webp`. Together they used **28.16 MiB**. They were converted to real WebP assets while keeping their original dimensions and visual intent. Their combined size is now **2.01 MiB**, a reduction of approximately **92.8%**.

The full `public/images` directory changed from approximately **31.52 MiB** to **5.21 MiB**. The full supplied `public` directory changed from approximately **37.15 MiB** to **10.79 MiB**.

### 2. Card-sized UI could receive the canonical large image

The project already had media framing metadata and an image variant upload helper, but the normal uploader path did not return a single media value that connected the main image to a smaller preview sibling. This patch makes upload output carry both identities inside the existing `#m=` metadata payload. No database schema migration is required.

### 3. Image loading behavior was distributed across many components

A central delivery layer now owns presets, source selection, optional responsive transformation URLs, placeholder selection, preloading, and loaded-image memory.

### 4. Several below-the-fold sections could compete with the initial viewport

The home gallery no longer eagerly requests all Bento images. Critical and non-critical images now have intentionally different loading/fetch priority behavior.

## Architecture added

### `src/lib/image-delivery.ts`

Adds image presets:

- `tiny`
- `logo`
- `thumbnail`
- `card`
- `category`
- `gallery`
- `detail`
- `hero`
- `fullscreen`

It also provides:

- source selection from embedded preview or canonical image
- optional Supabase render transformation URLs
- responsive `srcSet` generation when transformations are enabled
- placeholder source selection
- duplicate-safe preloading
- idle preloading
- a page-session loaded-image cache to suppress repeated fade/flicker
- Supabase image-origin preconnect

### `src/components/ui/FramedImage.tsx`

The existing component is now the main image-delivery UI primitive. It keeps framing/crop behavior while adding:

- preset-based delivery
- preview placeholder background
- source/srcset/sizes support
- stable loading state
- loaded-image memory
- controlled loading priority
- error fallback compatibility
- reserved geometry through existing framing layout

## Upload pipeline changes

The upload flow now:

1. decodes the selected image once
2. bounds both width and height
3. generates an optimized preview variant
4. generates an optimized hero/detail variant
5. uploads the pair atomically
6. rolls back the sibling if the second upload fails
7. returns one media value with canonical hero source plus embedded preview source

Current output targets:

- hero maximum dimension: 1600
- preview maximum dimension: 720
- hero WebP quality: 0.78
- preview WebP quality: 0.74

The preview identity is now understood by:

- storage identity extraction
- safe deletion
- asset upload sessions
- persistence reconciliation
- storage garbage collection reference indexing

This prevents preview variants from being accidentally treated as orphan files.

## Delivery behavior

### Critical images

Hero/detail images that are actually critical can be eager and high priority.

### Below-the-fold images

Cards, galleries, related products, and other non-critical images use lighter presets and lazy behavior.

### Intent prefetch

Selected navigation surfaces warm likely next images and/or routes on user intent:

- product cards
- popular services
- category cards
- product hero cards
- navbar search results
- product gallery thumbnails
- gallery cards and lightbox adjacency
- gallery albums

The existing fast product-card rotation interval on `ProductsPage` was intentionally left unchanged.

## Cache changes

`vercel.json` keeps the existing immutable one-year cache for hashed `/assets/*` and now adds browser cache policies for:

- `/images/*`
- `/brand/*`

The policy is:

`public, max-age=86400, stale-while-revalidate=604800`

Supabase-hosted images remain governed by Supabase Storage/CDN behavior and upload object cache settings.

## Static asset optimization

The 14 mislabeled image files were fixed and recompressed. Additional optimization included:

- `earth-blue-marble.jpg`: about 580 KiB → 492 KiB
- lossless PNG recompression for `hero-bg-event.png`
- lossless PNG recompression for `og-default.png`
- navbar horizontal logo now uses an existing optimized WebP variant (~20 KiB instead of ~102 KiB PNG)
- brand icon now uses an existing optimized WebP variant

The runtime home hero already points to `hero-bg-event.webp`, which is approximately 39 KiB. The remaining large PNG warning files are retained for compatibility/social or non-primary use.

## Image audit command

A new command is available:

```bash
npm run images:audit
```

It checks:

- whether file signatures match image filename extensions
- whether large static image files exceed the warning threshold

Current result:

- 0 format mismatches
- 2 size warnings (`og-default.png` and `hero-bg-event.png`)

Warnings do not fail the command; format mismatches do.

## Supabase Free / Pro compatibility

Default behavior works without Supabase image transformations. The lighter card/gallery presets can use the embedded preview sibling generated during new uploads.

To enable transformed Supabase render URLs after the project is on a compatible Supabase plan, set:

```env
VITE_IMAGE_TRANSFORMATIONS_ENABLED=true
```

When absent or false, transformed render URLs and transformation `srcSet` generation are disabled.

## Database migration

**No database migration is required.**

Preview source metadata is embedded inside the project's existing media hash payload (`#m=`), and all relevant parsing/deletion/GC paths were updated to preserve and understand it.

## Validation completed

### TypeScript

Strict type checking passed against the supplied source tree using a temporary validation config.

### Vitest

Full suite result:

- 15 test files passed
- 190 tests passed
- 0 failed

The suite was run with local dummy Supabase test environment variables because the Supabase client requires a URL/key at module initialization.

### Image audit

- 0 format mismatches
- 2 large-file warnings

### Production build limitation

A true `npm run build` was not run because the upload set did not include the app's `index.html`, `vite.config.ts`, or the normal project TypeScript configs used by the production build. The provided source was type-checked and the complete available Vitest suite passed.

## Deployment checklist

1. Apply this patch on branch `perf/image-delivery-system`.
2. Keep `VITE_IMAGE_TRANSFORMATIONS_ENABLED` absent/false while remaining on the non-transformation path.
3. Deploy to Preview and check Home, Products, Product Details, Categories, Gallery, Custom Builds, cart/checkout, and admin image upload/edit/delete flows.
4. In browser DevTools, test first load with cache disabled and a throttled mobile network profile.
5. After upgrading to a compatible Supabase plan, enable `VITE_IMAGE_TRANSFORMATIONS_ENABLED=true`, deploy Preview, and re-run the same route checks before production promotion.
6. Run `npm run images:audit` when adding batches of new static assets.

