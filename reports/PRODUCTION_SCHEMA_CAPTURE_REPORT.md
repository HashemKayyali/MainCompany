# Production schema capture report

Date: 2026-07-13

Branch: `eventies-next-reconstruction`

## Verdict

**BLOCKED_WITH_EXACT_REASON**

The approved one-time read-only capture could not establish a production database session. The production direct database hostname publishes an IPv6 address, but this execution host has no usable IPv6 route. A session-pooler hostname derived from the project region was reachable over IPv4 but rejected the production tenant, so it was not treated as authoritative and no further endpoint guessing was attempted.

No schema metadata was captured. The canonical baseline migration was not authored because doing so without the authoritative catalog would require guessing security- and compatibility-critical definitions.

## Safety precheck

- Working directory was `C:\Users\PC\Desktop\Eventies-Next-Reconstruction`.
- Branch was `eventies-next-reconstruction`.
- The working tree was clean and synchronized with `origin/eventies-next-reconstruction`.
- `eventies-next/supabase/.temp/project-ref` contained the isolated staging ref `ogfgaupebcabuoczoqcy`.
- The staging link was never changed to production.
- The temporary credential file existed and the secure capture directory was ignored before the attempt.
- The temporary credential file was deleted after the attempt, as required.

## Read-only access method attempted

1. Supabase CLI 2.109.1 generated a dry-run for `pg_dump --schema-only --schema=public`.
2. The dry-run contained no data-only, INSERT, COPY-data, push, reset, repair, or mutation operation.
3. Native PostgreSQL 17.6 `pg_dump` was selected after the Supabase CLI reported that Docker Desktop was unavailable.
4. The native client was constrained with `default_transaction_read_only=on`, a statement timeout, `--schema-only`, `--schema=public`, and `--no-owner`.
5. The direct endpoint could not be reached over IPv6. The non-authoritative region-derived pooler endpoint rejected the tenant before authentication.

No authenticated production database session was established. No SQL query, catalog query, table read, or mutation ran against production.

## Captured and excluded objects

Captured production objects: **none**.

The following remained explicitly excluded and were not read or copied:

- public application rows;
- auth users, identities, sessions, refresh tokens, MFA factors, and challenges;
- customer details, emails, phone numbers, requests, quotes, chat messages, notifications, and audit rows;
- `storage.objects` rows and uploaded files;
- Vault values, passwords, API keys, tokens, and role secrets;
- migration-history rows intended for restoration.

The zero-length attempted DDL output and local diagnostic files remain only under the ignored `eventies-next/.secure-schema-capture/` directory and are not tracked.

## Sanitization and secret handling

- The credential was used only in process memory and was never added to an environment file or tracked file.
- The temporary credential file was deleted after the capture attempt.
- No raw capture or diagnostic file is eligible for Git staging.
- No connection string, password, token, production row, or raw dump is included in this report.

## Canonical baseline and migration order

The planned baseline path remains:

`eventies-next/supabase/migrations/20260710000000_canonical_baseline.sql`

It was deliberately not created. Once an authoritative schema-only capture succeeds, the required order remains:

1. `20260710000000_canonical_baseline.sql`
2. `20260711000001_app_events.sql`
3. `20260711000002_arabic_columns.sql`
4. `20260712000001_phase3_security_counters.sql`
5. `20260713000001_phase4_idempotency_and_checks.sql`
6. `20260714000001_phase5_chat_client_message_id.sql`
7. `20260714000002_phase5_chat_message_rate_limit.sql`
8. `20260715000001_phase6_admin_assurance.sql`

The historical duplicate migration versions must not be copied into the clean staging ledger.

## Unresolved schema categories and type drift

Because no production catalog was obtained, these required definitions remain unresolved:

- authoritative public table, column, default, constraint, index, sequence, view, function, RPC, trigger, grant, and RLS definitions;
- user-created auth trigger and helper-function configuration;
- storage bucket metadata and user-created storage policies;
- realtime publication membership and replica identity;
- required extension placement and versions;
- migration-history reconciliation metadata;
- profile/avatar nullability and auth-trigger drift;
- generated database type comparison, RPC signature drift, enum drift, and admin-audit drift.

The detailed repository-derived gaps remain documented in `reports/STAGING_BOOTSTRAP_PLAN.md`.

## Validation result

- Schema-only dry-run validation: **passed**.
- Production connection: **blocked before a database session**.
- Production schema capture: **not completed**.
- Canonical baseline static validation: **not applicable; baseline not authored**.
- Local baseline-plus-seven migration replay: **not run**.
- Type generation/comparison: **not run**.
- Remote staging migration application: **not run**.

Docker Desktop is unavailable, but native PostgreSQL 17.6 clients are installed. Native clients are sufficient once an authoritative IPv4-capable connection endpoint is supplied.

## Exact remaining blocker

The owner must provide one of the following through the same ignored temporary credential-file mechanism:

1. the official production **session pooler** database URL copied from the Supabase dashboard, including its exact hostname, port, username, and SSL settings; or
2. a working IPv6 route from this execution host to the direct production database endpoint.

The official session-pooler URL is preferred. It must identify production project `dqizzlcsioqykfeldtsj`; it must not identify staging. A new capture attempt must repeat every precheck and delete the temporary credential afterward.

## Proposed commands after the blocker is resolved

The production URL must continue to be read from the ignored temporary file and retained only in process memory. The reviewed native operation is equivalent to:

```powershell
pg_dump --dbname $productionUrl --schema-only --schema public --no-owner --quote-all-identifiers --file production_schema_raw.sql
```

After capture, sanitization, baseline authorship, and successful local replay, a separately approved staging-only review may use:

```powershell
npx supabase migration list
npx supabase db push --dry-run
```

An actual staging `db push` remains outside this approval and must not run without a separate owner gate.

## Final confirmations

- Production modified: **No**.
- Production rows copied: **No**.
- Production schema objects captured: **No**.
- Staging modified: **No**.
- Migration applied, pushed, reset, or repaired: **No**.
- Edge Function or Vercel deployment performed: **No**.
- Phase 7 started: **No**.
