# 11 — SEO CONSTITUTION

- Metadata ownership: `generateMetadata` per route via one typed builder (`server/metadata/builders.ts`). `usePageMeta` and `scripts/prerender-seo.mjs` die (DEL-01/07). The drifted `index.html` copy is fixed in Vite during P0 (freeze exception).
- Canonicals: absolute, `https://www.eventiesjo.com`, per-locale variant; EN URLs unchanged forever (ADR-03).
- hreflang: en/ar pairs + `x-default` on every localized route; `og:locale(:alternate)` mirrored; sitemap `xhtml:link` alternates (SEO-009).
- JSON-LD: Organization + WebSite (global), ItemList (listing pages), Product on detail pages — **offers semantics for rentals require business input** (open question OQ-1: public prices? availability?); if unresolved, ship Product without offers rather than misleading schema.
- Sitemap: ported `api/sitemap.ts` as `app/sitemap.xml/route.ts` ~verbatim (PRESERVE) + add `/custom-builds`, decide legal pages inclusion, verify category visibility filter, add alternates. Robots.txt unchanged.
- Deleted products: tag invalidation → `notFound()` → HTTP 404; disappears from sitemap automatically (live query).
- Redirects: 301s — `/privacy→/privacy-policy`-family consolidation (pick primaries = current canonicals in prerender script), `/terms-of-service`, `/cookies`, `/user-login→/login`, `/forgot-password→/reset-password`. Aliases never render 200 content.
- 404: real `not-found.tsx` per segment (fixes SPA soft-404).
- noindex: all private/auth routes via metadata robots (replacing vercel.json header list — parity-checked route-by-route); Vercel previews noindex (verify ENV-004).
- Social preview: og-default ≤100 KB; per-product OG uses the product image via Cloudinary transform (1200×630 crop preset — IMG task).

## SEO Parity Gate (blocking per route group — QG-SEO)
1. P0 captures baseline: script curls every public route (prod), extracts title/description/canonical/robots/OG/Twitter/JSON-LD to versioned JSON.
2. Before a route group cuts over: same extraction against the Next preview; diff must be empty or each delta explicitly approved in the phase report.
3. Post-cutover: GSC coverage monitored 2 weeks per group; Rich Results test on 5 product pages; regression → rollback per `20`.
