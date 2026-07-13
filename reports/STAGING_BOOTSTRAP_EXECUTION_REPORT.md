# Eventies staging bootstrap execution report

**Execution date:** 2026-07-13  
**Authorized target:** Supabase staging `ogfgaupebcabuoczoqcy`  
**Forbidden target:** Supabase production `dqizzlcsioqykfeldtsj`  
**Verdict:** `READY_FOR_STAGING_LIVE_VALIDATION`

## Safety precheck

- Worktree: `C:\Users\PC\Desktop\Eventies-Next-Reconstruction`
- Branch: `eventies-next-reconstruction`
- Initial Git state: clean and synchronized with `origin/eventies-next-reconstruction` (`0` ahead, `0` behind).
- Linked project marker: `eventies-next/supabase/.temp/project-ref` contained exactly `ogfgaupebcabuoczoqcy`.
- The linked marker did not contain the production ref.
- The approved canonical baseline existed at `eventies-next/supabase/migrations/20260710000000_canonical_baseline.sql`.
- `eventies-next/.secure-schema-capture/production-db-url.txt` did not exist.
- Tracked-file scans found no database URLs or credential values. Three secret-name matches were inspected and were safe placeholders or runtime environment lookups.
- Production was not queried, linked, accessed, or modified during this task.

## Approved dry run

The initial remote migration ledger was empty. `npx supabase db push --dry-run` returned exactly the approved eight migrations, in this order:

1. `20260710000000_canonical_baseline.sql`
2. `20260711000001_app_events.sql`
3. `20260711000002_arabic_columns.sql`
4. `20260712000001_phase3_security_counters.sql`
5. `20260713000001_phase4_idempotency_and_checks.sql`
6. `20260714000001_phase5_chat_client_message_id.sql`
7. `20260714000002_phase5_chat_message_rate_limit.sql`
8. `20260715000001_phase6_admin_assurance.sql`

No unexpected or missing migration appeared, and the baseline was first.

## Application history and safe corrections

### Managed default-privilege compatibility correction

The first authorized push stopped within the baseline on an `ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin` statement. The staging migration ledger remained empty and a remote table inspection returned no public application tables, confirming transactional rollback.

The baseline generator was corrected to omit managed-role default-privilege statements that a migration login cannot own. The baseline was regenerated and all eight migrations replayed successfully against a fresh isolated PostgreSQL 17 database before retrying staging. This correction is commit `137b68ad` (`fix(DBMIG-002): omit managed default privileges`). No migration repair or database reset was used.

The repeated staging dry run again returned the exact approved eight-file order. The retry then applied all eight migrations successfully in that order.

### Forward-only Phase 6 lint correction

Post-application database lint found that `public.assert_admin_assurance` schema-qualified SQL's special `COALESCE` syntax as `pg_catalog.coalesce`, which is not a callable catalog function. The original Phase 6 source was corrected for future fresh environments, its contract test now rejects this invalid form, and a forward-only migration was added for the already-bootstrapped staging database:

9. `20260715000002_phase6_admin_assurance_coalesce_fix.sql`

The correction was applied only after a one-file dry run and local PostgreSQL application test. It is commit `4d4db49c` (`fix(DBMIG-010): repair assurance predicate lint`). A forward migration was required because the original Phase 6 migration was already present in the remote ledger; migration history was not rewritten or repaired.

The final local and remote ledgers match for all nine versions.

## Schema verification

Remote catalog checks were executed through the Supabase CLI and Supabase's read-only database-query endpoint. The remote catalog exactly matched the fresh local replay:

| Object class | Remote | Fresh local replay |
| --- | ---: | ---: |
| Public application tables | 30 | 30 |
| Public indexes | 82 | 82 |
| Public constraints | 149 | 149 |
| Public foreign keys | 30 | 30 |
| Public functions | 58 | 58 |
| Public non-internal triggers | 20 | 20 |
| Public RLS-enabled tables | 30 | 30 |
| Public policies | 59 | 59 |
| Storage policies | 2 | 2 |

- No public application table had RLS disabled.
- Linked type generation returned all 30 tracked tables and every tracked table column; no tracked table or column was missing remotely.
- The expected Phase 3 through Phase 6 tables and RPC/function contracts were present.
- `public.assert_admin_assurance` is `SECURITY DEFINER`, is owned by `postgres`, and has zero `EXECUTE` grants to `PUBLIC`, `anon`, or `authenticated`.
- Authenticated direct `DELETE` remains granted on `products`, `categories`, `gallery_albums`, and `custom_builds`. The Group E direct-delete revocation was therefore not performed.

## Auth, Storage, and Realtime verification

- The non-internal `auth.users` trigger invoking `public.handle_new_user()` exists exactly once, preserving Auth-to-profile creation behavior.
- Storage buckets exist for `product-images` and `product-videos`.
- Storage policies exist as `admin write product-images` and `admin write product-videos`.
- The `supabase_realtime` publication contains:
  - `public.chat_conversations`
  - `public.chat_messages`
  - `public.notifications`
  - `public.profiles`
- Staging contained zero Auth users and zero Storage objects after bootstrap.
- All public application tables reported zero live rows. No customer or fixture data was copied or created.

## Phase object verification

- **Phase 3:** `app_rate_limits`, `public_form_dedup`, and `contact_rate_limit` exist with their functions, indexes, RLS, and cleanup/rate-limit contracts.
- **Phase 4:** all four request-creation function versions are present, including current idempotent request and quote contracts.
- **Phase 5:** `chat_messages.client_message_id`, its deduplication contract, `chat_message_rate_counters`, and the message rate-limit trigger/function are present.
- **Phase 6:** assurance, destructive-operation, bulk-operation, role-management, notification, audit, idempotency, media-operation, and upload-quota objects are present. Audit dependencies and private assurance execution grants were verified.

## Validation executed

- `npx supabase migration list` — final local/remote parity for nine migrations.
- `npx supabase db push --dry-run` — exact approved eight-file bootstrap order before initial application; exact one-file forward correction before its application.
- `npx supabase inspect db table-stats --linked --output json` — all 30 public tables present and empty.
- `npx supabase db lint --linked --level warning` — no errors after the forward correction.
- Linked TypeScript type generation — all tracked tables and columns present.
- Read-only remote catalog queries — tables, columns, indexes, constraints, foreign keys, functions, triggers, RLS, policies, grants, Auth trigger, Storage, Realtime, phase objects, and empty-data state.
- Fresh isolated PostgreSQL 17 replay — catalog counts matched remote staging exactly.
- `npm run format` — pass.
- `npm run typecheck` — pass.
- `npm run lint` — pass.
- `npm test` — 34 files passed; 213 tests passed, 41 skipped, 2 todo.
- Targeted canonical-baseline and Phase 6 migration contracts — 21 tests passed.

## Warnings and blockers

- Database lint reports four pre-existing informational warnings for intentionally unused avatar compatibility parameters on `public.admin_update_user`. There are no database-lint errors.
- A linked `pg_dump` verification attempt could not run because Docker Desktop is unavailable. No dump was produced. Equivalent catalog verification was completed using linked type generation and Supabase's official read-only database-query endpoint, and the results matched the fresh local replay.
- No blocker remains for staging live validation. This report does not claim any Phase 3–6 live mutation gate has passed.

## Data, credentials, and environment confirmation

- Production was not accessed or modified.
- No production or customer rows, Auth users, messages, Storage objects, or application data were copied.
- No users or application fixtures were created in staging.
- No secrets were printed, added to a tracked file, or committed.
- No environment-variable change is required for the database bootstrap itself. Application live validation still requires the separately approved staging-only application environment configuration.
- No `db reset`, `migration repair`, Edge Function deployment, Vercel deployment, live Phase 3–6 testing, or Phase 7 work occurred.

## Final Git status

After the correction and report commits were pushed, `eventies-next-reconstruction` was clean and synchronized with `origin/eventies-next-reconstruction`.
