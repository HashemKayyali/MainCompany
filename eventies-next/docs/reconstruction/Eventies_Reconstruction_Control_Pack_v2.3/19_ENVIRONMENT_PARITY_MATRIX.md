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

---
## P0 population (BASE-006 / ENV-001 / ENV-003 / ENV-004 / ENV-005 — 2026-07-11)

Full inventory + evidence: `reports/baseline/environment-inventory.md`. Summary of matrix updates:

- **ENV-001 (DONE):** 13 keys inventoried with per-environment presence and VITE_→NEXT_PUBLIC_ mapping. Two dead keys found in `.env.local`, referenced nowhere in code: `VITE_GOOGLE_CLIENT_ID`, `VITE_IMAGE_UPLOAD_PROVIDER` (D-P0-06) — exclude from Next env schema.
- **ENV-003 (DONE):** `VITE_IMAGE_TRANSFORMATIONS_ENABLED` prod value = **unset ⇒ false** (proven from the inlined literal in the deployed bundle `/assets/index-CSQsoKSI.js`); local is also unset ⇒ **no local/prod mismatch exists today**. Next flag decision: same-named NEXT_PUBLIC_ flag, default false, finalized in FOUND-022.
- **ENV-004 (BLOCKED):** needs any live preview-deployment URL (or dashboard access) to curl X-Robots-Tag; no preview URL reachable from this session.
- **BASE-021 (PARTIAL — public-observable values captured; dashboard remainder BLOCKED):** GoTrue `/auth/v1/settings` (anon-readable, no secrets): providers enabled = **google + email only** (all others false, anonymous off); `disable_signup=false`; **`mailer_autoconfirm=true` → email confirmation is NOT required on signup** (security-relevant; feeds SEC-002); `phone_autoconfirm=false`; `saml_enabled=false`; `passkeys_enabled=false`. Still requiring owner dashboard access: auth **rate-limit values**, **MFA/TOTP enrollment availability**, project **region confirmation** (DNS evidence already says eu-west-1). These go to 05 §Supabase-native limits when captured.
- **ENV-005 (DONE, follow-up flagged):** Supabase DB region = **AWS eu-west-1** (DNS AAAA ∈ published `2a05:d018::/35` eu-west-1 range); Vercel function region observed = **iad1** (`X-Vercel-Id: fra1::iad1::…`). **Cross-region confirmed** (D-P0-07, H/P): sitemap fn TTFB 0.67–0.86 s vs 0.21–0.24 s static. Decision needed before P2 cutover: pin Next function region near eu-west-1 (dub1/lhr1/fra1). Dashboard-side region confirmation folded into BASE-021 (owner access).
