# 13 — RISK REGISTER
Score = Likelihood(1-3) × Impact(1-3). Status: OPEN unless noted.

| ID | Description | L | I | S | Phase | Detection | Prevention | Mitigation | Rollback | Owner |
|---|---|---|---|---|---|---|---|---|---|---|
| R-01 | Dual-tab Vite+Next refresh-token rotation invalidates one side (mass-logout class) | 2 | 3 | 6 | P1B/P3 | P1B Q5 experiment; auth.login spike alert | P1B blocks cutover | fallback: atomic auth-surface cutover (ADR-09 amendment) | restore auth rewrites; bridge fallback | auth |
| R-02 | SEO regression on catalog cutover (meta/canonical drift, ranking loss) | 2 | 3 | 6 | P2/P7 | parity gate; GSC 2-wk watch | byte-diff gate blocks PRs | fix-forward within 48h else rollback group | rewrite restore | seo |
| R-03 | Cache leak: personalized render cached shared | 1 | 3 | 3 | P2–P6 | QG-ARCH-3 + E2E probe (user A/B) | no-store-by-construction rule | purge + hotfix | route no-store override | data |
| R-04 | Stale catalog after admin edit (revalidation miss) | 2 | 2 | 4 | P2/P6 | revalidate.failed events; admin UX warning | integration test per entity | TTL ≤1h self-heal; retry button | — | data |
| R-05 | i18n key coverage gaps → mixed-language pages | 2 | 2 | 4 | P1–P2 | CI key-coverage check | scripted extraction from legacy dict | fallback-to-EN renders (never raw keys) | — | i18n |
| R-06 | `*_ar` content backlog: columns exist, admin never fills them | 3 | 2 | 6 | P2+ | AR-coverage report (count null _ar) | admin AR fields required-on-edit for active items (soft) | EN fallback by design | — | product |
| R-07 | Realtime dedup regression (double messages) during P5 | 2 | 2 | 4 | P5 | reducer tests; chat.send_retry events | message-id unique index | reducer no-op by id | disable optimistic path flag | realtime |
| R-08 | Cloudinary cost abuse via compromised admin token | 1 | 3 | 3 | any | signing-count metric alert | quota + signed constraints (SEC-012/013) | revoke sessions; rotate secret | — | security |
| R-09 | Two apps / one DB: destructive migration breaks frozen Vite | 1 | 3 | 3 | P2–P6 | migration review checklist | no-destructive-migration window rule (20) | restore column via migration | — | db |
| R-10 | MFA rollout locks out an admin | 2 | 2 | 4 | P6 | enrollment telemetry | staged rollout (superadmin first); dashboard recovery runbook | Supabase dashboard MFA reset | delay enforcement flag | auth |
| R-11 | Turnstile false positives block real JO users | 2 | 2 | 4 | P3 | form-abandon + ratelimit.tripped review | challenge only where 05 says; calibration protocol | lower sensitivity env flag | disable per-form flag | security |
| R-12 | Team capacity (2 devs) vs 6–10 wk scope → rushed gates | 2 | 3 | 6 | all | phase velocity vs ledger burn-down | phases independently shippable; freeze protects prod | descope P5/P6 polish, never gates | stay longer on Vite for later groups | pm |
| R-13 | CSP enforce breaks a lazy-loaded origin missed in inventory | 2 | 2 | 4 | P7 | report-only violation stream P1→P7 | 72h zero-violation rule before enforce | revert to report-only | header rollback | security |
| R-14 | bfcache/back-forward restores stale personalized DOM | 1 | 2 | 2 | P4 | E2E bfcache case | pageshow revalidation on personal routes | — | — | web |
| R-15 | Gallery progressive rework regresses perceived perf vs current | 1 | 2 | 2 | P2 | visual/scroll E2E + Vitals | batch tuning; content-visibility | revert batch size | component flag | web |
| R-16 | Master Plan surfaces late with conflicting scope | 2 | 1 | 2 | any | — | ADR-15 ruling | diff → proposed tasks | — | pm |
