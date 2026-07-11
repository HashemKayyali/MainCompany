# DBMIG-001 — Migration execution pipeline (binding)

Every schema change moves through this pipeline. Claude Code may execute steps 1–6 ONLY. ⛔ = human-gated.

```
1. AUTHOR        migration FILE in eventies-next/supabase/migrations/ (additive, frozen-Vite-compatible, inverse documented in header)
2. STATIC REVIEW SQL reviewed against the checklist below (in-PR)
3. COMPAT REVIEW frozen-Vite compatibility argument written in the file header
4. BRANCH APPLY  apply to the branch/staging Supabase project (DBMIG-002) — the ONLY environment Code may apply to
5. VERIFY        schema diff on staging matches intent
6. CONTRACT      CT-RLS + CT-RPC suites green against staging
7. ⛔ APPROVAL   human reviews evidence bundle (file + staging verify + CT output)
8. ⛔ PROD APPLY human (or human-triggered CI) applies to production
9. PROD VERIFY   schema check + smoke; recorded in the wave's ledger row
10. ENABLE       dependent feature flag/code path turns on
```

## Checklist template (copy into each migration PR)

- [ ] Additive only (no drop/rename/type-narrow of anything the frozen Vite app reads)
- [ ] Inverse migration stated in the file header
- [ ] RLS impact stated (new table → RLS enabled + policies enumerated, or "service-role only")
- [ ] Frozen-Vite test: Vite suite green against staging after apply
- [ ] CT-RLS / CT-RPC green against staging
- [ ] No PII-shaped columns without a scrubbing contract

## DBMIG-002 — staging environment status

**BLOCKED: needs owner action.** The Supabase MCP in this environment reaches only the `eventies-outreach-manager` org (ap-northeast-1) — not the production project's org, and branch databases require a paid plan on the prod project. Options for the owner (pick one):
1. Enable Supabase branching on the prod project and grant this environment a branch-scoped token;
2. Create a free staging project in the prod org and share its URL/keys as CI secrets;
3. Local `supabase start` (Docker) in CI — viable but drifts from managed-platform behavior.

Wave A (`20260711000001_app_events.sql`) is authored and review-ready; it stops at step 4 until DBMIG-002 exists.
