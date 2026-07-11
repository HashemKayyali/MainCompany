# ROUTE-001..010 — Routing topology decision & proof status

## ROUTE-001 — Decision (recorded; ADR note)

**Chosen topology: Vite-project rewrites → Next deployment** (option A), rejected: apex-domain move / path-prefix domain routing (option B).

- The production domain keeps pointing at the existing Vite Vercel project for the whole strangler period. Per route group, `vercel.json` gains a rewrite `{ "source": "/products/:path*", "destination": "https://<next-deployment>/products/:path*" }` ABOVE the SPA catch-all.
- Why A: per-group cutover with per-group rollback (delete one rewrite = ROLL-01, byte-exact restore artifact already committed in P0: `reports/baseline/rollback/`); zero DNS risk; EN URLs unchanged (ADR-03).
- The Next app deploys as a SECOND Vercel project rooted at `eventies-next/` (Root Directory setting). Function region must be pinned near eu-west-1 per Phase-0 finding D-P0-07.
- Restore artifact: unchanged from BASE-022 (`vercel.json.P0-snapshot.json` + SHA-256).

## Proof dimensions — status

| ID | Dimension | Status | Evidence / plan |
|---|---|---|---|
| ROUTE-002 | public route served through rewrite | **BLOCKED: needs Vercel access** (no CLI/auth in this environment) | RT-TOP spec ready: `e2e/foundation.spec.ts` runs against any URL via `E2E_BASE_URL` |
| ROUTE-003 | `/_next/*` assets through rewrite | **BLOCKED: same** | requires `/_next/:path*` rewrite alongside each group rewrite — encoded in the plan above; asset-200 + immutable-cache assertions drafted |
| ROUTE-004 | RSC nav / hard refresh / streaming | **BLOCKED: same** | locally proven directly (16/16 E2E on `next start`); through-rewrite run pending deployment |
| ROUTE-005 | cookie round-trip | **BLOCKED: same** | PROXY-INT proves proxy-level Set-Cookie/propagation locally; through-topology echo test drafted |
| ROUTE-006 | OAuth-callback-shaped traversal | **BLOCKED: same** | /auth/callback excluded from proxy matcher (tested); query+303 preservation through rewrite pending |
| ROUTE-007 | /ar rewrites + 404 + 301 | partially local-proven (locale ✓ local; 404 = D-P1-01; 301s land P2) | |
| ROUTE-008 | CSP/report headers survive rewrite | **BLOCKED: same** | headers proven emitted locally (E2E) |
| ROUTE-009 | rollback rehearsal | **BLOCKED: same** | procedure written (BASE-022) |
| ROUTE-010 | topology report | **FAIL-SAFE: NOT PASSED — P1B REMAINS BLOCKED** per the gate rule | this file is the report shell; the PASS verdict requires a preview deployment |

**What unblocks this:** Vercel account access (CLI login or a preview deployment of `eventies-next/` + a test rewrite on a preview of the Vite project). Every proof is a scripted curl/Playwright run once URLs exist — estimated one hour of operator+agent time.
