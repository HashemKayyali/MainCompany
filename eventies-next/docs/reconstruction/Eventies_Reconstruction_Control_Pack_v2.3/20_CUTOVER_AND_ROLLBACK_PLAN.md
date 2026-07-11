# 20 — CUTOVER & ROLLBACK PLAN

## Mechanism
Two Vercel projects (Next = primary domain target at P7; during P2–P6 the Vite project's `vercel.json` rewrites selected route groups to the Next deployment URL — or domain-level path routing if preferred; decide via spike CUT-001). Rollback for any group = restore the previous rewrite block (kept in git; one-commit revert). Vite stays deployable until FINAL passes.

## Order (dependency-driven)
1. **Group A (P2):** legal + about + customers + custom-builds → then /, /products, /products/*, /categories* /gallery. No auth dependency. Smoke + SEO watch 2 wks.
2. **Group B (P3):** /login /register /reset-password /update-password /auth/callback /contact — atomic with the bridge going live. If P1B Q5 failed: Group B merges with Group C (atomic auth surface).
3. **Group C (P4):** /rental-cart /checkout /purchase-quote /my-requests* /order-summary/* /profile.
4. **Group D (P5):** /notifications + chat widget surface.
5. **Group E (P6):** /admin/**.
6. **P7:** catch-all flips to Next; 301 set live; Vite parked.

## Shared-DB rules (P2–P6 window)
Additive migrations only (new tables/columns/indexes, nullable or defaulted). No renames, drops, type narrowing, or RPC signature changes. New RPC capability = new function or optional param. Migration PRs carry a "frozen-Vite compatibility" checklist. (Repo rule stands: Claude Code writes migration files; humans run them.)

## Per-cutover procedure
Preview validation (full gate set for the group) → rehearsed rollback (once, before first-ever cutover: QG-ROLLBACK) → cutover in low-traffic window → prod smoke (SMOKE set) → monitoring window 72h (Sentry, Vitals, GSC for public groups, auth events for B) → group declared stable → next group may start cutover.

## Rollback specifics
- Any group: restore rewrite commit → redeploy Vite project config (minutes).
- Group B extra: bridge is additive — rollback leaves legacy sessions untouched (P1B Q7 guarantee); no cookie cleanup needed.
- P7 point of no return: only after FINAL gate; before deleting the Vite project, archive the repo state + config as a tagged release.

## Monitoring window alarms (auto-rollback triggers = human decision, alert-driven)
5xx rate >1% on group routes; auth failure spike ×3 baseline (Group B); GSC coverage drop on group URLs; LCP p75 regression >20% vs baseline.
