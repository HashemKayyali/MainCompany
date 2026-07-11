# BASE-001 — Repo Health Check

- **Date:** 2026-07-11
- **Branch:** `eventies-next-reconstruction` (worktree of the production Vite repo)
- **HEAD at check:** `f1d441a44c2d28f1a2a456d974d33d0a1d24bd5e`
- **Toolchain:** node v22.19.0 · npm 11.15.0

## Results

| Step | Command | Result |
|---|---|---|
| Install | `npm install` | ✅ clean (npm audit reports pre-existing advisories; not addressed per freeze rule) |
| Typecheck | `npm run typecheck` (`tsc --noEmit`) | ✅ exit 0, zero errors |
| Unit/contract tests | `npm test` (`vitest run`) | ✅ 20 files, 203 tests, all passed (35s) |
| Build | `npm run build` (`vite build` + `scripts/prerender-seo.mjs`) | ✅ built in 25.8s; prerender generated SEO HTML for **45 routes** (7 static, 8 category, 30 product) |

## Environment note

The worktree initially had no `.env.local` (untracked files do not carry across git worktrees); 5 test files failed at import with `supabaseUrl is required`. Resolved by copying `.env.local` from the production checkout. **No secret values are recorded here.** This is a worktree-setup artifact, not a repo defect.

## Discoveries (for ledger reconciliation)

1. **D-P0-01 — Test-file count drift:** ledger says "existing 17 test files"; the suite actually contains **20 test files / 203 tests**. Baseline uses the real count.
2. **D-P0-02 — Bundle-size warnings:** `index-*.js` 634 kB and `vendor-three-*.js` 735 kB exceed Vite's 500 kB chunk warning. Recorded only (Phase 0 records, never fixes); feeds BASE-004 budgets.
3. **D-P0-03 — Prerender route count:** prerender emits 45 SEO routes vs the 51-route router inventory claim — reconciled in BASE-002 (private/auth routes are deliberately not prerendered).

## Verdict

Repo is healthy: install/typecheck/tests/build all green. Safe to proceed with baseline capture.
