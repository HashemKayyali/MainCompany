# BASE-006 / ENV-001 / ENV-003 / ENV-004 / ENV-005 — Environment Inventory

Captured 2026-07-11 (Phase 0). **No secret values appear in this document** — key names, presence, and non-secret flag values only.

## Env-var inventory × environment (ENV-001)

Vite `envPrefix` is `['VITE_', 'NEXT_PUBLIC_']` (vite.config.ts:6) — the deliberate dual-prefix fork that ENV-002 kills in P1.

| Key | Read at | Local (.env.local) | Preview | Prod | Next.js mapping |
|---|---|---|---|---|---|
| `VITE_SUPABASE_URL` | `src/lib/supabase.ts`, `src/lib/image-delivery.ts`; server fallback in `api/sitemap.ts`, `scripts/prerender-seo.mjs` | present | assumed mapped (dashboard-verify) | present (site works) | `NEXT_PUBLIC_SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.ts`; server fallback same as above | present | assumed mapped | present | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `src/components/auth/GoogleIdentityButton.tsx` | present | assumed mapped | present (OAuth works) | unchanged (already NEXT_PUBLIC_) |
| `VITE_GOOGLE_CLIENT_ID` | **nowhere** (docs only) | present | — | unknown | **DEAD KEY — drop (D-P0-06)** |
| `VITE_IMAGE_UPLOAD_PROVIDER` | **nowhere** (docs only; superseded by Edge Fn pipeline) | present | — | unknown | **DEAD KEY — drop (D-P0-06)** |
| `VITE_IMAGE_TRANSFORMATIONS_ENABLED` | `src/lib/image-delivery.ts:42` | **unset → false** | unknown | **unset → false (bundle evidence below)** | flag decision below (ENV-003) |
| `SUPABASE_URL` | `api/sitemap.ts` (1st choice), `scripts/prerender-seo.mjs`, storage-gc scripts | not set (falls back to VITE_) | dashboard-verify | at least the VITE_ fallback works | server-only env (no NEXT_PUBLIC_) |
| `SUPABASE_ANON_KEY` | `api/sitemap.ts`, `scripts/prerender-seo.mjs` | not set (fallback) | dashboard-verify | fallback works | server-only env |
| `SUPABASE_SERVICE_ROLE_KEY` | `api/sitemap.ts` (last-resort), `scripts/prerender-seo.mjs`, `scripts/storage-gc/*` | not set | should NOT exist | dashboard-verify | server-only, never NEXT_PUBLIC_ |
| `STORAGE_GC_SAFETY_DAYS` / `STORAGE_GC_REPORTS_DIR` | storage-gc scripts (operator-run) | optional | n/a | n/a | n/a (ops scripts) |
| `PORT` | `vite.config.ts` dev server | optional (5174 default) | n/a | n/a | n/a |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Supabase Edge Fn `cloudinary-assets` (Deno.env) | Supabase secrets, not repo env | same | same | stays in Supabase Edge Fn secrets |

## ENV-003 — VITE_IMAGE_TRANSFORMATIONS_ENABLED prod value

**Prod value: unset ⇒ `false`.** Evidence: the flag is statically inlined at build time; the deployed bundle `/assets/index-CSQsoKSI.js` contains `Ln="".toLowerCase()==="true"` — i.e. the env var was empty in the production build. Local `.env.local` also leaves it unset ⇒ **local/prod parity, no "works locally" divergence today.**

Effect when false: Supabase-hosted images are served as raw `object/public` URLs (no render-API transforms). Cloudinary images are transformed unconditionally (`c_limit,w_*,f_auto,q_auto` — confirmed at runtime on /gallery). All observed live surfaces already deliver from Cloudinary.

**Next equivalent flag semantics (recorded decision, finalized in FOUND-022):** keep a server-checked `NEXT_PUBLIC_IMAGE_TRANSFORMATIONS_ENABLED` with identical default-false semantics inside the ported loader, so a Supabase-hosted legacy image behaves byte-identically. Do not silently enable.

## ENV-004 — Vercel preview noindex

**BLOCKED: needs a live preview deployment URL (or Vercel dashboard access).** No `*.vercel.app` preview deployment is reachable from this session and guessing subdomains is not evidence. Expectation to verify: Vercel serves `X-Robots-Tag: noindex` on all preview deployments by default. Action for human: provide any current preview URL for both projects (Vite project now, Next project once FOUND-001 exists); the check is one `curl -I`.

## ENV-005 — Regions & latency

| Item | Value | Evidence |
|---|---|---|
| Supabase production project | `dqizzlcsioqykfeldtsj` | index.html preconnect (already public) |
| Supabase DB region | **AWS eu-west-1 (Ireland)** | `db.dqizzlcsioqykfeldtsj.supabase.co` AAAA `2a05:d018:…` ∈ AWS published range `2a05:d018::/35` = eu-west-1 |
| Vercel serverless function region | **iad1 (US East)** | `X-Vercel-Id: fra1::iad1::…` on /sitemap.xml (edge fra1 → function iad1) |
| Vercel edge PoP (observed) | fra1 | same header |
| Function+DB latency proxy | sitemap fn TTFB **0.67–0.86 s** vs static asset **0.21–0.24 s** from the same client | 3 cache-busted /sitemap.xml probes vs /robots.txt |

**Flag raised (pre-P2 cutover gate): Vercel functions run in iad1 while the DB is in eu-west-1 — every SSR request will pay a cross-Atlantic round trip per query.** The Supabase MCP connected to this session has access only to a different org (`eventies-outreach-manager`, ap-northeast-1), so dashboard-side confirmation of the prod project region needs owner access — the DNS evidence above is however unambiguous. Recommendation to log as a decision: set the Next project's function region to `dub1`/`lhr1`/`fra1` (closest to eu-west-1) before any SSR route group cuts over. Supabase auth/dashboard settings capture remains BASE-021.

## Discoveries

- **D-P0-06 (L):** `VITE_GOOGLE_CLIENT_ID` and `VITE_IMAGE_UPLOAD_PROVIDER` exist in `.env.local` but are referenced nowhere in live code — stale keys; exclude from the Next env schema (FOUND-031) and delete from environments during P7 decommission.
- **D-P0-07 (H, P-flag):** Vercel function region (iad1) is cross-region from the Supabase DB (eu-west-1). Today only /api/sitemap pays it; under Next SSR every dynamic render would. Needs an ADR/decision before P2 cutover (ledger: new task or fold into ENV-005 follow-up).
