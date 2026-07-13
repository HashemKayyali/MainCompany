# PHASE 06 REPORT — Admin security and revalidation

Date: 2026-07-14 · Branch `eventies-next-reconstruction`

## Verdict

**CODE_SIDE_PARTIAL / SECURITY_DESIGN_APPROVAL_AND_LIVE_STAGING_GATES_BLOCKED — QG-P6 not passed.**

Phase 6 cannot honestly be marked code-side complete: the Control Pack mandates the acyclic chain SEC-018 owner approval → DBMIG-010 → SEC-016 → ADMIN-003. The SEC-018 design is authored but not approved, so no enforcement migration or authoritative privileged-operation implementation was created. Group E is not cutover-ready.

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

## SEC-018 approval blocker

Design: `docs/reconstruction/security/SEC-018_DESTRUCTIVE_BOUNDARY_DESIGN.md`.

Required owner/security decisions: approve the shared `auth.jwt()` AAL/auth_time predicate, 15-minute window, atomic Group E direct-DELETE revocation, frozen-Vite compatibility, bulk cap 25, and the matrix role assignments. Until approval, DBMIG-010, SEC-016, BYPASS-01..09, and final destructive UX integration remain blocked.

## Edge Function diff summary

- Existing endpoint, actions, legacy fields, folders, and Cloudinary delete behavior preserved.
- `ADMIN_MFA_ENFORCEMENT=1` adds verified AAL2 and auth age ≤900 seconds.
- `ADMIN_UPLOAD_HARDENING_ENABLED=1` selects the server-owned signed preset and calls durable quota RPC; clients cannot select preset/constraints.
- Quota denial emits an upload event and returns HTTP 429.
- Flags remain off until staging has the preset, quota RPC, MFA personas, UPL-NEG, quota, and compatibility evidence.

## Blocked items

- Owner approval of SEC-018.
- DBMIG-010 implementation/application and all BYPASS-01..09 persona probes.
- DBMIG-011 production re-probe (production deliberately untouched).
- Live admin/superadmin/AAL1/AAL2/revoked-session tests and TOTP enrollment/recovery.
- Live catalog/request/quote/customer/provider/chat/notification/admin/user/log/contact data and mutations.
- Live audit persistence, cache invalidation after mutations, signed upload preset, quota denial, upload partial-failure/idempotency, and media deletion.
- Full behavior-parity acceptance for individual admin interiors against staging data.

## Current non-production evidence

- Focused MFA/authorization/audit/revalidation/upload tests: 19 passed.
- Typecheck, ESLint, architecture/service-role gates: PASS.
- I18N coverage: PASS — 10 EN/AR domains synchronized.
- Circular dependency gate: PASS — 216 files, zero cycles.
- Production build: PASS; admin routes are dynamic and public cache/404 topology remains intact.
- Phase 6 local Playwright: PASS — 16/16 across EN/AR desktop/mobile after one selector-only test correction.

## Scope guard

No database migration was authored from the unapproved design or applied anywhere. Production was not mutated. Phase 7 was not started.
