# 19 — ENVIRONMENT PARITY MATRIX

| Dimension | Local | Vercel Preview | Production | Task |
|---|---|---|---|---|
| Env vars | `.env.local`: VITE_SUPABASE_URL/ANON_KEY, VITE_GOOGLE_CLIENT_ID, NEXT_PUBLIC_GOOGLE_CLIENT_ID, VITE_IMAGE_UPLOAD_PROVIDER (+ sitemap server keys) | mapped set | full set | ENV-001: full inventory + VITE_→NEXT_PUBLIC_ mapping table; ENV-002: kill the existing dual-prefix fork deliberately |
| Flags | VITE_IMAGE_TRANSFORMATIONS_ENABLED — **document prod value** (transform pipeline is flag-gated; mismatch = classic "works locally") | same | same | ENV-003 |
| Supabase project/region | project `dqizzlcsioqykfeldtsj` (from index.html preconnect) | same shared DB | same | ENV-005: record region; compare Vercel function region (SSR adds server→DB hop — latency check before P2 cutover) |
| OAuth callbacks | localhost URI | preview URIs policy: **decide** — enable via Supabase callback or disable OAuth on previews (OQ-2) | prod URI | ENV-006 |
| Turnstile | test keys | test keys | live keys | P3 |
| CSP | report-only | report-only | report-only → enforce P7 | SEC-004 |
| Cookies/domain | localhost | *.vercel.app (bridge tests here) | www.eventiesjo.com | P1B |
| noindex | n/a | verify Vercel default X-Robots-Tag on previews | vercel.json list → metadata robots parity | ENV-004 |
| Build | next dev | preview build | prod build; NO prerender script post-P2 | P2 |
| Sitemap keys | SUPABASE_URL/ANON_KEY server-side | same | same (service-role fallback only) | preserved from api/sitemap.ts |

Historical production-only differences to investigate in P0 (evidence-driven): transform flag mismatch (above); StrictMode double-effects absent in prod (OAuth double-exchange guard exists for dev — keep behavior); prod console stripping (`esbuild.pure`) hiding warnings — replaced by Sentry.
Gate: QG-ENV — matrix diff reviewed before every cutover.
