# PHASE 00 REPORT — Baseline & Safety Net

- **Executed:** 2026-07-11, branch `eventies-next-reconstruction` (worktree), starting HEAD `fb0c13da`
- **Scope:** BASE-001…022, ENV-001/003/004/005 per `phase-prompts/PHASE_00_BASELINE_AND_SAFETY_NET.md`
- **Redaction check:** every committed artifact reviewed — no secret values, tokens, or `.env.local` contents appear in any report; env vars referenced by KEY NAME only; the one non-secret flag value (transform flag) proven from the public bundle.

## Task table

| ID | Status | Evidence / artifact |
|---|---|---|
| BASE-001 | DONE | `reports/baseline/BASE-001-health-check.md` — install/typecheck/build green; 20 files / 203 tests pass |
| BASE-002 | DONE | `reports/baseline/route-inventory.json` — 51 routes reconciled exactly vs ledger claim |
| BASE-003 | DONE | `scripts/baseline/seo-baseline.mjs` (self-test) + `reports/baseline/seo-baseline.json` (53 routes, 0 errors) |
| BASE-004 | DONE | `reports/baseline/perf/*.json` (8 trimmed LHRs), `bundle-report.json`, `performance-budgets.draft.json` |
| BASE-005 | DONE | `scripts/baseline/headers-baseline.mjs` + `reports/baseline/security-headers-baseline.json` (24 routes) |
| BASE-006 | DONE | `reports/baseline/environment-inventory.md` (13 keys × environments) |
| BASE-007 | DONE | `reports/baseline/test-inventory.md` — 20 files mapped to 18-matrix |
| BASE-008 | DONE | `playwright.baseline.config.ts` + `e2e/skeleton/` — 16/16 green vs prod Vite build (en/ar × desktop/mobile) |
| BASE-009 | DONE | SAN-01 `src/lib/__tests__/auth-routing.test.ts` — green; 2 gap cases documented (below) |
| BASE-010 | DONE | AU-RS `src/contexts/__tests__/SessionContext.token-refresh-stability.test.tsx` — modal survives TOKEN_REFRESHED |
| BASE-011 | DONE | RD-01 `src/test-utils/stream-reducer-harness.ts` + notification adapter running full contract |
| BASE-012 | DONE | Evidence appended to `09_REALTIME_CONSTITUTION.md` — 4 channel sites + auth listener |
| BASE-013 | DONE | **Answer: chat echo does NOT duplicate today** (id-keyed guards both sides; no optimistic temp id). Residual: timeout-retry re-insert → CHAT-002 urgency = medium, not happy-path-broken |
| BASE-014 | **BLOCKED** | needs operator prod-login session; exact 20-min runbook committed (`BASE-014-015-blocked-capture-runbooks.md`) |
| BASE-015 | **BLOCKED** | needs GSC property access; transcription template committed (same file) |
| BASE-016 | DONE | `reports/baseline/BASE-016-freeze-declaration.md` |
| BASE-017 | DONE | og-default → 72 KB 1200×630 JPEG (+ legacy PNG slimmed 1495→185 KB); own commit `5a1ccf4c`. Manual share test pending deploy |
| BASE-018 | DONE | index.html copy aligned with prerender STATIC_PAGES; own commit `3889b767`; build-verified. Prod BASE-003 re-capture after deploy |
| BASE-019 | DONE | DEL-13 executed with grep + baseline proof (`BASE-019-del13-proof.md`); 1.1 MB deleted |
| BASE-020 | DONE | `reports/baseline/sitemap-verification.json` — well-formed; **44 URLs = DB truth exactly, 0 diff** |
| BASE-021 | **BLOCKED (partial)** | public GoTrue settings captured into 19; rate limits/MFA/region confirmation need owner dashboard |
| BASE-022 | DONE | `reports/baseline/rollback/` — byte-exact vercel.json snapshot + SHA-256 + restore procedure |
| ENV-001 | DONE | inventory + VITE_→NEXT_PUBLIC_ mapping in `environment-inventory.md` / 19-matrix |
| ENV-003 | DONE | transform flag prod value = **unset ⇒ false** (bundle-literal proof); local matches — no mismatch exists |
| ENV-004 | **BLOCKED** | needs any live preview-deployment URL (one `curl -I` when provided) |
| ENV-005 | DONE | Supabase **eu-west-1** vs Vercel fn **iad1** — cross-region confirmed + latency proxy numbers |

## Safety-net status (regression contract for all later phases)

- Unit/contract: **224 tests, 23 files, green** (was 203/20; +21 new safety-net tests). Typecheck clean.
- E2E skeleton: **16/16 green** against `vite preview` prod build; `npm run test:e2e:baseline`.
- All baseline scripts rerunnable and committed under `scripts/baseline/`.

## Discoveries (each actionable item needs a ledger entry — proposed IDs)

| ID | Sev | Finding | Proposed action |
|---|---|---|---|
| D-P0-01 | L | Suite is 20 test files, not 17 (ledger drift) | amend BASE-001/FOUND-006 wording |
| D-P0-02 | M/P | Vite ships 2,847 KB JS; index chunk 634 KB, three.js 735 KB | baseline only; P2 budgets already encode |
| D-P0-03 | L | Prerender emits 45 routes vs 51 router entries (private routes uncovered by design) | no action; recorded |
| D-P0-04 | M/E | **/notifications missing from vercel.json noindex list** (live-confirmed) | add to SEO-010 parity list; optional freeze-exception one-liner — human call |
| D-P0-05 | M/E | Non-prerendered public routes (/categories + 8 legal) serve homepage shell meta with canonical → `/` | SEO-002/004 parity target = intended copy, not shell |
| D-P0-06 | L | Dead env keys `VITE_GOOGLE_CLIENT_ID`, `VITE_IMAGE_UPLOAD_PROVIDER` | exclude from FOUND-031 schema; delete at P7 |
| D-P0-07 | **H/P** | **Vercel functions iad1 ↔ Supabase eu-west-1 cross-region** (fn TTFB ~0.7–0.9 s vs 0.2 s static) | decision/ADR before P2 cutover: pin Next fn region dub1/lhr1/fra1 |
| D-P0-08 | **H/S** | Sanitizer passes `/\evil.com` (browser-normalized open redirect) | harden at AUTH-004; encoded as behavior test today |
| D-P0-09 | M/S | `/login` redirect target not loop-guarded | harden at AUTH-004; encoded as behavior test today |
| D-P0-10 | L | Sitemap categories have no visibility column to filter on — SEO-009's "verify category visibility filter" resolves to *nothing to filter* | close that SEO-009 sub-question |

## BASE-013 chat-dedup answer (required by prompt)

**Echo does not duplicate today.** `sendChatMessage` returns the inserted row; sender-side append and realtime echo both pass an id-existence guard (`ChatWidget.tsx:172`, `AdminChatsPage.tsx:158/222`). The only duplicate path is a timeout-after-success retry (new server id) — precisely the CHAT-002 client-uuid fix; urgency medium.

## Open questions / needs from the owner

1. **BASE-014:** one 20-minute prod auth capture session (runbook ready).
2. **BASE-015:** 15 minutes in Search Console (transcription template ready).
3. **BASE-021 remainder / ENV-005 confirmation:** Supabase dashboard — auth rate limits, MFA availability, region page. The MCP connected here only reaches the `eventies-outreach-manager` org, not the prod project.
4. **ENV-004:** any current `*.vercel.app` preview URL for the Vite project.
5. **D-P0-04 decision:** approve (or defer) the one-line vercel.json noindex addition for `/notifications` as a freeze-exception bugfix.
6. **Deploy timing:** BASE-017/018 are committed on this branch; they reach prod with the next `main` merge/deploy — after which `node scripts/baseline/seo-baseline.mjs` should be rerun to re-capture (BASE-018 acceptance) and a manual social-share test performed (BASE-017 acceptance).
7. **Two chat test accounts** (customer + superadmin) if a runtime two-account echo probe is still wanted beyond the code-level verdict.

## QG-P0 verdict

All BASE/ENV tasks **DONE or BLOCKED-with-reason**; baselines committed; safety-net green (224 unit + 16 E2E); freeze exceptions landed as isolated commits. **Phase 0 exit criteria met.** No Decision Log contradictions encountered. Phase 1 not started, per instruction.
