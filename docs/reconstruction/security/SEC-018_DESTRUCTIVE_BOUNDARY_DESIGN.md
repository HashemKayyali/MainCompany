# SEC-018 — Destructive-operation trusted-boundary design

Status: **AWAITING_OWNER_SECURITY_APPROVAL**. This specification is code-side complete, but DBMIG-010 and SEC-016 must not be implemented or applied until the owner approves it.

## Shared assurance predicate

All database mechanisms use a private `public.assert_admin_assurance(required_role text default 'admin', max_age_seconds int default 900)` function. It reads `auth.uid()` and `auth.jwt()` at execution time, resolves the authoritative role from `profiles`, requires `aal = 'aal2'`, and requires numeric `auth_time` between `extract(epoch from statement_timestamp()) - max_age_seconds` and the current server time. It returns the actor UUID or raises SQLSTATE `42501`. It is not executable by `anon` or `authenticated` directly.

No client-supplied boolean, role, timestamp, assurance claim, or actor ID is trusted. UI typed confirmation is UX/audit context only.

| BYPASS | Operation | Mechanism | New authoritative boundary | Direct privilege change |
|---|---|---|---|---|
| 01 | Product delete | A | `delete_admin_product(uuid,text)` calls assurance predicate and deletes transactionally | revoke direct DELETE from authenticated |
| 02 | Category delete | A | `delete_admin_category(uuid,text)` | revoke direct DELETE |
| 03 | Gallery album delete | A | `delete_admin_gallery_album(uuid,text)` | revoke direct DELETE |
| 04 | Custom-build delete | A | `delete_admin_custom_build(uuid,text)` | revoke direct DELETE |
| 05 | Cloudinary delete | C | Edge Function freshly verifies JWT user, profile role, AAL2 and auth_time before signing destroy request | no browser secret/delete signature |
| 06 | Role change | A | replace `set_admin_role` body with assurance assertion; superadmin role; same public signature | existing EXECUTE remains authenticated but self-denies |
| 07 | Admin removal | A | replace `remove_admin` body with assurance assertion; superadmin role; same public signature | same |
| 08 | Notification broadcast | A | `send_custom_notification` asserts superadmin assurance before audience expansion | same |
| 09 | Bulk destructive | C+A | JSON-only same-origin Route Handler validates capped schema, then calls assurance-enforcing RPC per entity in one bounded transaction RPC | no direct table DELETE |

Existing RPC signatures used by frozen Vite are preserved where they exist. New delete RPCs are additive. The legacy Vite direct-delete UI continues only until Group E cutover; therefore direct DELETE revocation is staged with the atomic Group E switch, never earlier.

## DBMIG-010 proposed contents

1. Private assurance predicate and tests for missing/malformed/future/expired `auth_time`.
2. Four additive delete RPCs with fixed `search_path`, row ownership, audit insert, and typed result.
3. Assurance additions to role/remove/broadcast RPC bodies without signature changes.
4. Atomic bulk-delete RPC with maximum 25 IDs, duplicate collapse, and all-or-nothing behavior.
5. Grants only to `authenticated`; helper and trigger functions revoked from all API roles.
6. Direct delete privilege revocations scheduled only for the Group E atomic switch.

The rental approval RPC is excluded: its existing authorization and `pg_advisory_xact_lock` path remain unchanged.

## BYPASS personas and assertions

Each row is called directly, without UI, as anonymous/non-admin, AAL1 admin, AAL2 admin with auth older than 15 minutes, and AAL2 admin with recent auth. Superadmin-only rows substitute equivalent superadmin personas. Only the final persona may succeed. Tests also assert no row/event/cache invalidation occurs on denial and repeat after revocation mid-session.

## Approval decision required

Owner/security reviewer must approve: the shared JWT claim predicate, atomic timing of direct privilege revocation with Group E, frozen-Vite compatibility, 15-minute window, bulk cap 25, and the exact role requirements above.

