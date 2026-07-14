# PHASE 06 REPORT — Admin security and revalidation

Date: 2026-07-14 · Branch `eventies-next-reconstruction`

## Verdict

**CODE_SIDE_COMPLETE / LIVE_STAGING_GATES_BLOCKED_BY_OWNER — QG-P6 not passed.**

The owner approved SEC-018 on 2026-07-13 with mandatory conditions. DBMIG-010, SEC-016, BYPASS-01..09 code contracts, rollout-disabled destructive UX, transactional audit, cache integration, and the Cloudinary trusted boundary are implemented. The migration was not applied anywhere; Group E and QG-P6 still require real staging evidence.

## Completed independent code-side work

- Fresh-user server admin gate, authoritative profile-role lookup, staged AAL2 policy, superadmin route policy, and 15-minute recent-auth predicate.
- TOTP enrollment/challenge UI with explicit action, six-digit validation, staged `ADMIN_MFA_ROLLOUT` flag, and committed reset runbook.
- Localized dynamic admin shell and route structure for dashboard, products, categories, parts, requests, quotes, customers, providers, custom builds, gallery, chats, notifications, admins, users, logs, and contact submissions.
- EN/AR/RTL admin domain, loading/empty/error/retry fixture states, accessible tables, and typed destructive-confirm dialog with focus trap/Escape handling.
- Complete catalog mutation→tag inventory and canonical revalidation/retry contract.
- Existing `approve_rental_request` RPC and `pg_advisory_xact_lock` path verified and left untouched.
- Bilingual bounded catalog schemas, destructive-operation schema, upload authorization schema, signed-preset policy, and audit-event catalog with PII scrub tests.
- Cloudinary Edge Function staged flags for fresh AAL2/recent-auth, server-selected signed preset, and durable 30/hour + 300/day quota RPC. Legacy request/response behavior remains default while hardening flags are off.
- SEC-018 row-by-row trusted-boundary design and BYPASS persona plan.
- Deny-by-default admin/superadmin permission matrix shared by server reads and privileged mutation contracts.
- Authorized, no-store server read models for dashboard, catalog, rental requests, purchase quotes, customers, providers, gallery, custom builds, chat inbox, notifications, administrators, users, audit/system events, contact submissions, and support inquiries.
- Search, status, pagination, request/quote detail, loading, error, retry, empty, EN/AR, RTL, and bidi-isolated admin grid states.
- Idempotent request/quote/chat/notification contracts; safe internal notification targets; normalized slugs; strict MIME, file-size, filename, public-ID, and folder validation.
- Complete audit record shape: actor ID/role, operation, target type/ID, result, scrubbed metadata, correlation ID, and timestamp. Cache revalidation now records privileged success/failure audit evidence.
- Upload partial-failure workflow: dedupe before upload, compensating Cloudinary destroy after record failure, and explicit orphan audit state if cleanup also fails.
- MFA enrollment cancellation removes the unverified factor and exposes localized cancel/retry/restart states; the shared privileged assurance contract distinguishes AAL2 from stale authentication.
- Approved DBMIG-010 adds a private SECURITY DEFINER assurance predicate, active-profile enforcement, structured audit fields, four typed delete RPCs, one atomic bulk RPC, last-superadmin locking, hardened role/removal/broadcast RPCs, durable upload quota, and media/broadcast idempotency.
- SEC-016 adds fresh-user/current-role Next boundaries, rollout-disabled destructive UI, post-success-only cache invalidation, and a fresh-JWT Cloudinary delete boundary with bounded folder/public-ID validation and completion audit.
- BYPASS-01..09 code suite covers anonymous/customer/provider/unknown/admin/superadmin/revoked/changed-role/missing-profile personas, AAL1/stale/recent/missing/malformed/future auth states, batch bounds/dedup, audit rollback structure, final-superadmin invariant, cache failure, and media retry/idempotency.

## Mutation → cache-tag coverage

| Mutation family | Tags |
|---|---|
| Product create/update/reorder/delete | product detail old/new slug, products list, home |
| Category create/update/reorder/delete | category detail old/new slug, categories, products, home |
| Part create/update/reorder/delete | parts, affected product detail when known |
| Build/build-category create/update/reorder/delete | builds list, build categories, home |
| Customer create/update/reorder/delete | customers list, home |
| Gallery album/image create/update/reorder/delete | gallery albums, home |

Coverage is 100% for catalog mutation families. Transactional/admin grids are no-store and refresh explicitly rather than receiving public catalog tags.

## MFA rollout state

`ADMIN_MFA_ROLLOUT` supports `off`, `superadmin`, and `all`; invalid/missing values resolve to `off`. It has not been enabled on production or Preview. Live enrollment, challenge, revoked-admin, recovery, and AAL persona evidence require staging. Reset procedure: `docs/reconstruction/runbooks/MFA_ADMIN_RESET.md`.

## SEC-018 approval and DBMIG-010 state

Design: `docs/reconstruction/security/SEC-018_DESTRUCTIVE_BOUNDARY_DESIGN.md`.

Status: `APPROVED_BY_OWNER_SECURITY_DECISION`. The migration is authored at `eventies-next/supabase/migrations/20260715000001_phase6_admin_assurance.sql`. Direct DELETE privileges are intentionally unchanged and remain deferred until the atomic Group E cutover.

## Edge Function diff summary

- Existing endpoint and upload response shape remain compatible; delete adds a mandatory idempotency key only behind the disabled destructive rollout.
- `ADMIN_MFA_ENFORCEMENT=1` adds verified AAL2 and auth age ≤900 seconds.
- `ADMIN_UPLOAD_HARDENING_ENABLED=1` selects the server-owned signed preset and calls durable quota RPC; clients cannot select preset/constraints.
- Quota denial emits an upload event and returns HTTP 429.
- Delete always requires fresh JWT verification, current active profile role, AAL2, auth age ≤900 seconds, at most 25 deduplicated allowed-folder IDs, database idempotency, and completion audit before reporting success.
- Flags remain off until staging has the preset, quota RPC, MFA personas, UPL-NEG, quota, and compatibility evidence.

## Blocked items

- DBMIG-010 staging application and live BYPASS-01..09 persona probes.
- DBMIG-011 production re-probe (production deliberately untouched).
- Live admin/superadmin/AAL1/AAL2/revoked-session tests and TOTP enrollment/recovery.
- Live catalog/request/quote/customer/provider/chat/notification/admin/user/log/contact data and mutations.
- Live audit persistence, cache invalidation after mutations, signed upload preset, quota denial, upload partial-failure/idempotency, and media deletion.
- Full behavior-parity acceptance for individual admin interiors against staging data.

## Final non-production evidence

- Clean `npm ci --no-audit`: PASS — 707 packages; dependency tree valid.
- Format (rerun after correction), strict typecheck, ESLint, architecture/service-role/cache gates: PASS.
- I18N coverage: PASS — 10 EN/AR domains synchronized.
- Circular dependency gate: PASS — 232 files, zero cycles.
- Full unit/static-contract suite: PASS — 33 files; 207 passed, 41 staging-gated skips, 2 pre-existing TODO.
- Focused MFA/authorization/audit/revalidation/upload suite: PASS — 89 tests across 12 files, including direct BYPASS-01..09 persona/auth-time matrices, audit rollback, final-superadmin, cache-failure, quota, ownership, and media retry/idempotency contracts.
- Production build: PASS; admin routes are dynamic and public cache/404 topology remains intact.
- Full local Playwright matrix: initial run 81/84; three transient EN desktop local-server connection/navigation failures. The complete EN desktop project rerun passed 21/21, including all three affected cases; all EN/AR desktop/mobile cases therefore have passing evidence.

## Preview-safe evidence

- CLI identity: `hashemkayyali99-1043`.
- Isolated project: `eventies-next-preview` (`prj_TgwOvGi0IIKhiI9fBIC0keVlKcl0`).
- Latest Preview deployment: `dpl_28g3pW2G73XJ1SSB5U57uwyfe7nB` (`READY`, `target: preview`; no `--prod`).
- URL: `https://eventies-next-preview-mxhld7v5y-hashemkayyalis-projects.vercel.app`.
- Phase 6 Preview Playwright: PASS — 16/16 across EN/AR desktop/mobile.
- Destructive endpoint rollout guard: PASS — a valid-shaped non-authenticated POST returned HTTP 503 with `ROLLOUT_DISABLED` before authentication, RPC, cache invalidation, or any external call.
- Evidence was read-only/non-mutating: signed-out authorization boundaries, localized fixture states, dialog accessibility, MFA surface before enrollment, and rollout-disabled destructive-route rejection.

## Scope guard

DBMIG-010 was authored after explicit approval but was not applied to staging or production. Destructive rollout flags remain off. Production was not mutated. Phase 7 was not started.

## Continuation commit

- `38e48066` — `feat(ADMIN-005 ADMIN-009 ADMIN-010 ADMIN-011 ADMIN-013 ADMIN-017 ADMIN-020 ADMIN-029): complete admin server contracts`
- `2143ad6e` — `feat(DBMIG-010 SEC-016 ADMIN-003 ADMIN-014 ADMIN-015 ADMIN-016): enforce privileged boundaries`
- `20f5ef8a` — `fix(DBMIG-010 SEC-016 BYPASS-01..09): tighten approved boundaries`

## 2026-07-14 Staging isolation attempt

QG-P6 remains **BLOCKED**. The environment guard stopped before admin/MFA personas, privileged RPCs, destructive operations, uploads, Cloudinary calls, audit persistence, rollback, cache invalidation, or last-superadmin live checks. The Staging Custom Access Token hook activation and Edge Function secret state were not inspected after the guard failure, and no Phase 6 mutation was attempted.
