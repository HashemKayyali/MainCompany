# ROUTE-010 — Routing Topology Proof Report

Date: 2026-07-11 · **Verdict: PASS** (all dimensions green through the real rewrite topology). **P1B is UNBLOCKED.**

## Topology under test (ROUTE-001 decision, realized)

- **Legacy/front origin** (Vite-project stand-in): `eventies-topology-probe-*.vercel.app` — a static front serving a real supabase-js v2 client with default localStorage persistence, plus the production-shaped rewrite set.
- **Next origin**: `eventies-next-preview-*.vercel.app` (project `eventies-next-preview`).
- **Rewrites** (front `vercel.json`, above an implicit "serve local" default): `/bridge-test`, `/ar`, `/ar/:path*`, `/_next/:path*`, `/api/:path*` → Next origin; `/auth/callback` → Next `/api/probe/callback-shape`.
- This is exactly the per-group rewrite shape a real cutover uses; ROLL-01 restore = delete the rewrites block.

## Per-dimension results

| ID | Dimension | Result | Evidence |
|---|---|---|---|
| ROUTE-002 | public route served by Next through the rewrite | **PASS** | `GET front/bridge-test` → 200, `<title>P1B bridge test</title>`, `<html lang="en" dir="ltr" class="alexandria_…">` — Next-rendered, not the front's static index |
| ROUTE-003 | `/_next/*` static+chunk assets resolve through topology | **PASS** | 3 sampled `/_next/static/*.js\|css` → **200** with `Cache-Control: public,max-age=31536000,immutable` |
| ROUTE-004 | RSC nav + hard refresh + streaming | **PASS** | `GET front/bridge-test` with `RSC: 1` → `content-type: text/x-component`, flight payload begins `0:…`; `/ar` HTML carries PPR postpone markers + `x-nextjs-prerender: 1` |
| ROUTE-005 | cookie round-trip: request cookies forwarded, Set-Cookie unmodified | **PASS** | `cookie-echo` through front echoes `requestCookieNames:["rt-probe-in"]` (forwarded) and returns `Set-Cookie: rt-cookie-probe=…; Path=/; HttpOnly; SameSite=lax` intact |
| ROUTE-006 | OAuth-callback-shaped route: query strings + 303 traverse intact | **PASS** | `front/auth/callback?code=abc123&state=xyz` → **303**, `Location:` carries `code-length=6&state-echo=xyz` — params preserved across the rewrite |
| ROUTE-007 | locale rewrites + 404 + 301/redirect | **PASS** | `/ar` through front → `<html lang="ar" dir="rtl">` + Arabic content; unknown path → 404 (direct Next origin) with noindex meta; `/en` → **307 → /** (as-needed prefix strip, proxy-built Location) |
| ROUTE-008 | CSP/report headers survive the rewrite un-stripped | **PASS** | `front/bridge-test` carries `Content-Security-Policy-Report-Only`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `Permissions-Policy`, `X-Robots-Tag: noindex` — all end-to-end |
| ROUTE-009 | rollback rehearsal (ROLL-01) | **PASS** | redeployed the front with the rewrites block removed → `/` 200 (front's own static), `/bridge-test` **404** (no longer routed to Next); restored the rewrites → `/bridge-test` **200** again |

## Notes carried forward

- **D-P1-01 confirmed live**: the Next origin returns real **404** for unknown paths at `/`, `/ar/*`, `/xx/deep/*` (global-not-found), while `/en` (as-needed duplicate) correctly **307**s to `/`. This is stronger than the P1-local PPR-fallback observation — direct-origin 404s ARE real here; the 200+noindex fallback only appears for paths that partially match a static-generated segment. The P2 SEO-404 ADR still governs the deleted-product case.
- Deployment protection (`ssoProtection`) was disabled on the two PREVIEW projects only (`eventies-next-preview`, `eventies-topology-probe`) via the Vercel API to make the previews publicly reachable for the proof. The production Eventies project was never touched.

## Gate outcome

**QG-ROUTE: PASS.** Every dimension verified through the deployed rewrite layer. Per the 07 §P1B prerequisite, the auth-bridge experiments may now run against this same topology — see `reports/PHASE_01B_REPORT.md`.
