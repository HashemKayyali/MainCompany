# Production schema capture report

Date: 2026-07-13

Branch: `eventies-next-reconstruction`

Verdict: **READY_FOR_STAGING_BOOTSTRAP**

## Access method and read-only controls

The owner-authorized capture used the official Supabase Production Session Pooler endpoint from the ignored temporary credential file. The stored endpoint was confirmed as a Supabase pooler on port 5432 and as belonging to production project `dqizzlcsioqykfeldtsj`. The Supabase CLI remained linked to isolated staging project `ogfgaupebcabuoczoqcy` and was never relinked to production.

The password contained characters that native URI parsing treated as connection syntax. The capture therefore passed the exact stored hostname, port, username/tenant, database, and password through process-only libpq variables. No endpoint or tenant was derived or changed.

Read-only enforcement consisted of:

- Supabase CLI dry-run confirmation of `pg_dump --schema-only --schema=public`;
- PostgreSQL 17.6 native clients;
- `default_transaction_read_only=on` for every production session;
- a 120-second statement timeout;
- `pg_dump --schema-only --schema=public --no-owner`;
- SELECT-only catalog queries for approved configuration metadata.

No production mutation statement was executed. No staging connection was used for capture or validation.

## Captured objects

The public schema capture contained:

- 23 application tables;
- 41 public functions/RPCs;
- 40 explicit indexes, plus constraint-backed indexes;
- primary, unique, foreign-key, and check constraints;
- 17 public-table triggers;
- 59 public RLS policies;
- public grants, revocations, and default privileges;
- RLS enablement and replica-identity state.

The public schema contained no custom enum, domain, view, materialized view, or composite type.

Separately approved metadata captured:

- two user-created triggers on `auth.users` and their public helper definitions;
- two application storage buckets;
- two user-created `storage.objects` policies;
- storage table-grant metadata;
- `supabase_realtime` publication settings and membership;
- installed extension names, schemas, and versions;
- production migration versions for reconciliation only.

Raw output remains only under ignored `eventies-next/.secure-schema-capture/` and is not tracked.

## Explicitly excluded

The capture did not read, export, or copy:

- public application rows;
- customer names, emails, phone numbers, requests, quotes, chats, notifications, or audit rows;
- auth users, identities, sessions, refresh tokens, MFA factors, or challenges;
- `storage.objects` rows, paths, or uploaded files;
- passwords, API keys, JWTs, service-role values, Vault values, or provider secrets;
- migration statements or migration-history rows intended for restoration.

The schema dump contains zero COPY statements, zero table-data INSERT statements, and zero role-password statements.

## Auth configuration

Captured `auth.users` triggers:

1. `on_auth_user_created` calls `public.handle_new_user()` after insert.
2. `on_auth_user_updated_profile_sync` calls `public.sync_profile_from_auth_user()` after updates to `email` or `raw_user_meta_data`.

Both helpers are `SECURITY DEFINER` functions with fixed `search_path = public, auth`. The canonical baseline schema-qualifies the trigger function references.

## Storage configuration

| Bucket | Public | Size limit | Allowed MIME types |
|---|---:|---:|---|
| `product-images` | Yes | Unset | Unrestricted by bucket metadata |
| `product-videos` | Yes | 31,457,280 bytes | `video/mp4`, `video/webm`, `video/quicktime` |

Captured user policies:

- `admin write product-images`: authenticated `ALL`, constrained to the bucket and `public.is_admin()`.
- `admin write product-videos`: authenticated `ALL`, constrained to the bucket and `public.is_admin()`.

The baseline creates bucket configuration idempotently and does not insert any `storage.objects` row. Supabase-managed storage tables and grants are not recreated.

## Realtime configuration

The production publication is `supabase_realtime`, with insert, update, delete, and truncate publication enabled. Captured application members are:

- `public.profiles`;
- `public.chat_conversations`;
- `public.chat_messages`;
- `public.notifications`.

All four use default replica identity. The baseline adds membership only when absent.

## Extensions

Production metadata reported `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault`, and `plpgsql`.

The baseline explicitly requires only application dependencies `pgcrypto` and `uuid-ossp` in the managed `extensions` schema. PostgreSQL/Supabase-managed extensions and extension-owned data are not recreated.

## Migration-history reconciliation

Production reported these ledger versions for analysis:

- `20260505135718`
- `20260702113408`
- `20260702123738`
- `20260702123833`
- `20260702124158`

They were not copied into staging. Historical root migrations retain duplicate and incomplete versions and must not be replayed. The clean staging ledger is one canonical baseline followed by the seven unique Next-era migrations.

## Sanitization and compatibility reconciliation

The canonical baseline is:

`eventies-next/supabase/migrations/20260710000000_canonical_baseline.sql`

Sanitization removed:

- pg_dump `\restrict`/`\unrestrict` tokens;
- unsafe ownership restoration;
- production connection details;
- every data-export and migration-history operation.

The baseline changes `CREATE SCHEMA public` to `CREATE SCHEMA IF NOT EXISTS public` for a managed Supabase project.

Production retained the frozen seven-argument `admin_update_user` RPC but its body referenced removed avatar columns. The baseline preserves that exact callable signature while restricting its body to authoritative `profiles.name` and `profiles.phone` updates. This avoids a missing-column runtime failure without reintroducing removed avatar storage.

All 36 captured `SECURITY DEFINER` functions have fixed search paths.

## Phase 6 migration corrections found by replay

Isolated replay exposed and corrected two committed DBMIG-010 issues:

1. `pg_catalog.extract(...)` was invalid PostgreSQL syntax; it is now `extract(epoch from pg_catalog.statement_timestamp())`.
2. Existing `set_admin_role(uuid,text)` and `remove_admin(uuid)` returned `json`, so PostgreSQL could not replace them with `jsonb` return types. The migration now drops only those exact legacy signatures before recreating them and restores their API grants later in the same migration.

Argument signatures used by frozen Vite remain unchanged. Direct table DELETE privileges remain intentionally unrevised until Group E.

## Local validation

Docker and Podman were unavailable. Validation instead used a new isolated PostgreSQL 17 cluster under the ignored capture directory with minimal local stubs for Supabase-managed roles, `auth.users`, storage tables, and the realtime publication.

The following sequence replayed cleanly from an empty database:

1. `20260710000000_canonical_baseline.sql`
2. `20260711000001_app_events.sql`
3. `20260711000002_arabic_columns.sql`
4. `20260712000001_phase3_security_counters.sql`
5. `20260713000001_phase4_idempotency_and_checks.sql`
6. `20260714000001_phase5_chat_client_message_id.sql`
7. `20260714000002_phase5_chat_message_rate_limit.sql`
8. `20260715000001_phase6_admin_assurance.sql`

Final catalog checks found:

- 30 public tables, all with RLS enabled;
- 58 public functions;
- zero `SECURITY DEFINER` functions missing a fixed search path;
- 59 public policies and two storage policies;
- both storage buckets with captured configuration;
- exactly four captured realtime members;
- `public.assert_admin_assurance` owned by `postgres` in the isolated environment;
- direct DELETE table privileges still present, as required before Group E.

Supabase CLI type generation could not run because it launches `postgres-meta` through Docker or Podman. A direct catalog-to-TypeScript comparison was performed instead.

## Type drift and correction

Before reconciliation, the Next database type file omitted six tables, all Arabic catalog columns, and contained removed `profiles.avatar_url`.

`eventies-next/src/shared/types/database.types.ts` now matches all 30 final public tables and every final column. It includes the missing internal counter/idempotency tables and Phase 6 signing-window relationships. The profile form and validation schema no longer submit nonexistent avatar data.

The frozen Vite type file was not modified. Its documented drift remains:

- missing Next-only Phase 3-6 internal tables;
- missing Arabic columns;
- missing Phase 4 idempotency and Phase 5 chat dedup columns;
- missing structured Phase 6 audit columns and `profiles.is_active`.

## Validation commands and results

- clean `npm ci --no-audit`: passed using npm 10 after terminating stale npm 11 installers that caused Windows `ENOTEMPTY` races;
- format: passed;
- typecheck: passed;
- lint: passed;
- architecture gates: passed;
- i18n coverage: passed;
- circular dependency check: passed;
- focused migration contracts: 25 passed;
- full unit/contract suite: 34 files passed, 212 tests passed, 41 environment-gated tests skipped, 2 todos;
- production build: passed;
- Phase 3-6 EN/AR desktop/mobile Playwright: 63 passed in the parallel run; one ar-mobile timeout passed immediately in isolated rerun, for all 64 applicable cases verified.

CT-RPC and CT-RLS remain environment-gated because no PostgREST service or staging personas were used. They must run after the separately approved staging bootstrap.

## Remaining gates

No baseline-authorship blocker remains. The following require separate owner approval and are not part of this capture task:

- remote staging migration dry-run and application;
- staging type generation through the Supabase API;
- CT-RPC/CT-RLS and Phase 3-6 mutation/live-evidence gates;
- any Edge Function or Vercel deployment.

## Final confirmations

- Production modified: **No**.
- Production rows copied: **No**.
- Auth users copied: **No**.
- Storage objects copied: **No**.
- Production or staging SQL applied: **No**.
- `db push`, `db reset`, and migration repair run: **No**.
- Credential file deleted after capture: **Yes**.
- Raw capture committed: **No**.
- Secret committed: **No**.
- Phase 7 started: **No**.
