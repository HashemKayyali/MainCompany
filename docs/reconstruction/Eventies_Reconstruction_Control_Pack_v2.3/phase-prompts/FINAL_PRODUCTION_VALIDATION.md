# FINAL — PRODUCTION VALIDATION (Claude Code execution prompt)

## Read first
The ENTIRE control pack, then the new repository, **as an auditor who did not write the code**. Assume previous phases made mistakes. `git status`.

## Objective
Independent final re-audit of the shipped system against every constitution. Output is a findings report, not fixes — each finding becomes a ledger task with severity; Critical/High findings block sign-off (QG-FINAL).

## Re-audit checklist (evidence per item, sampling is not acceptance)
1. **Architecture:** boundary lint + madge + grep gates re-run; folder reality vs `03`; no leftover legacy patterns (grep the Deletion Ledger's banned constructs across the final repo).
2. **Security/authz:** re-run CT-RLS + enumeration diff + ADM-GATE/ADM-RA + **full BYPASS-01..09 suite on production** (direct raw calls ×4 personas) against production build; attempt the §10 gap probes (UI-only paths, middleware-trust, session≠permission cases); headers live-verified (curl) incl. enforced CSP; secrets scan.
3. **Auth:** full AU-FLOWS on production smoke account; bridge fully removed (grep + storage inspection); revoked-role behavior re-verified.
4. **Validation & rate limiting:** attempt malformed payloads on every Route Handler; verify limits trip + log; Turnstile server-verification live probe.
5. **Caching/data leaks:** CACHE-AB probe on production; QG-ARCH-3 re-run; ADR-19 conformance audit (no unstable_cache/route revalidate constants anywhere; cacheLife profiles on every DAL read; CACHE-MODEL suite re-run).
6. **Idempotency:** MUT-DC/TO re-run on production-like preview.
7. **Realtime:** RT suite re-run; channel inventory matches `09` naming; leak test.
8. **Images:** per-surface budget spot-audit (10-table) on live pages; loader bypasses Vercel optimizer (network evidence); GC schedule active.
9. **SEO:** full parity extraction vs P0 baseline final diff; sitemap valid + alternates; 404/301 live checks; GSC coverage stable; Rich Results on 5 products.
10. **A11y/RTL:** axe on top 8 templates; AR snapshots; gesture E2E.
11. **Performance:** lab budgets conformance + bundle report (blocking); Speed Insights p75 vs baselines for routes with sufficient traffic (report, alarm-path if >20% regression — not a retroactive gate).
12. **Environment parity:** `19` matrix final diff; preview noindex verified.
13. **Dead/legacy code:** knip/ts-prune report clean; Deletion Ledger verifications re-executed; zero bridges in `16` marked active.
14. **Observability:** each of the 6 alerts fired by synthetic fault within the last cycle; PII redaction re-tested.

## Completion report
`reports/FINAL_VALIDATION_REPORT.md`: findings table (ID, severity, evidence, proposed task), gate-by-gate verdict, explicit GO/NO-GO. NO-GO loops back to targeted remediation tasks; GO closes the project with the archive references.

## Stop conditions
Any Critical finding → NO-GO immediately with evidence; any gate not re-runnable (report the tooling gap as High).
