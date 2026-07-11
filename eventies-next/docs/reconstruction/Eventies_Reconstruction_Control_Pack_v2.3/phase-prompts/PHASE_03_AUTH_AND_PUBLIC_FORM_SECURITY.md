# PHASE 03 — AUTH RECONSTRUCTION + PUBLIC FORM SECURITY (Claude Code execution prompt)

## Read first
`../00_ARCHITECTURE_CONSTITUTION.md` · this prompt · `../07_AUTH_CONSTITUTION.md` · `../05_SECURITY_CONSTITUTION.md` · `../16_TEMPORARY_BRIDGE_LEDGER.md` · P1B report (verdict binds this phase) · ledger AUTH/FORM groups + I18N-006,014 + SEC-005,006 · repo state · `git status`.

## Objective
Rebuild the full auth surface on cookie sessions per the canonical pipeline, ship BRIDGE-01 in production form, and move the three public forms behind Route Handlers with server-verified Turnstile. If P1B ruled atomic auth-surface cutover (Q5 FAIL), this phase's cutover scope merges with Group C — the ruling in the P1B report is binding.

## In-scope task IDs
AUTH-001…020 · FORM-001…010 · I18N-006,014 · SEC-005,006,015 (rate-limit store implementation per CLOSED ADR-18) · A11Y-005,006 · OBS wiring for auth events. AUTH-007 requires ADR-17 CLOSED; AUTH-012/013 require SEC-015.
Out of scope: MFA (P6); checkout/requests (P4); any admin surface.

## Required analysis before editing
Port-map the sanitizer + AUTH_PATHS blocklist + used-code fallback from the Vite sources (Preserve Ledger rows) — these three behaviors must survive byte-faithfully in behavior, not in code style. Read the friendly-error copy in `AuthCallback.tsx` and preserve its UX intent in dictionaries.

## Implementation sequence
AUTH-004 (sanitizer+tests) → AUTH-003/SEC-006 (error map) → AUTH-001 login → AUTH-006 (listener + AU-RS port) → AUTH-005 callback handler → AUTH-007 remember-me → AUTH-002 signup+Turnstile → AUTH-008/009 reset/update → AUTH-010 logout → AUTH-011 bridge → AUTH-012/013 limits+challenge → AUTH-014/I18N-014 locale → AUTH-015 gates → FORM-001..010 → AUTH-016..019 → AUTH-020 readiness.

## Security checks
Enumeration diff-test (AU-EN) is blocking; Turnstile verified server-side only (a client-only check is a stop condition); rate thresholds live in the single config module, marked provisional, backed by the ADR-18 store (never process memory — multi-instance concurrency test required); Origin checks on handlers (SEC-005); zero token logging; bridge never clears legacy keys.

## Tests
Blocking: SAN-01(new repo), AU-EN, AU-FLOWS (assertions per ADR-22 revocation semantics), REVOKE-SEM, AU-BR, FORM-TS, FORM dedup I-test, MUT-SS precursor (session expiry on a form). Telemetry: auth.* and ratelimit.tripped events observed in preview.

## Performance checks
Auth pages JS budget ≤ Vite login page baseline; Turnstile loaded lazily on demand where triggered-only.

## Completion report
`reports/PHASE_03_REPORT.md`: statuses; bridge cohort telemetry (<2% forced re-login gate); enumeration test evidence; threshold config snapshot; Group B cutover-readiness verdict.

## Exit criteria (QG-P3)
All gates green; readiness report approved; cutover itself is CUT-003 per `../20` (atomic with Group C if P1B ruled so).

## Stop conditions
P1B verdict missing or FAIL-unamended; any handler accepting a mutation without Zod+auth per `05`; Turnstile keys unavailable for preview (BLOCKED, list needs).
