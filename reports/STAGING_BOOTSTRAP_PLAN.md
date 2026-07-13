# Eventies staging bootstrap plan

Date: 2026-07-13

Branch: `eventies-next-reconstruction`

Staging project: `ogfgaupebcabuoczoqcy`

Verdict: **READY_FOR_STAGING_BOOTSTRAP**

This verdict means the schema chain is complete and locally replayable. It does not authorize remote staging application and does not mark Phase 3-6 live gates as passed.

## Migration sufficiency

The active migration directory now contains a complete fresh-project history:

- one sanitized, schema-only canonical baseline representing the captured pre-Next application state;
- seven unique chronological Next-era migrations.

The complete chain initializes an empty Supabase-compatible database without missing relations, columns, functions, duplicate objects, or migration-version collisions.

## Canonical sources

| Source | Role |
|---|---|
| `eventies-next/supabase/migrations/20260710000000_canonical_baseline.sql` | Executable pre-Next schema baseline |
| Seven later files in `eventies-next/supabase/migrations/` | Phase 2-6 chronological deltas |
| `eventies-next/scripts/build-canonical-baseline.ps1` | Reproducible sanitizer for the ignored schema-only capture |
| `reports/PRODUCTION_SCHEMA_CAPTURE_REPORT.md` | Capture, sanitization, compatibility, and validation evidence |
| `eventies-next/src/shared/types/database.types.ts` | Reconciled Next application database types |
| Root `supabase/migrations/` | Historical evidence only; never replay as staging history |

The archived schema, `supabase/rental-commerce.sql`, and manual `supabase/rls-policies.sql` remain noncanonical and must not execute.

## Exact bootstrap order

```text
Supabase-managed roles and schemas (auth, storage, realtime, API roles)
  -> 20260710000000_canonical_baseline.sql
  -> 20260711000001_app_events.sql
  -> 20260711000002_arabic_columns.sql
  -> 20260712000001_phase3_security_counters.sql
  -> 20260713000001_phase4_idempotency_and_checks.sql
  -> 20260714000001_phase5_chat_client_message_id.sql
  -> 20260714000002_phase5_chat_message_rate_limit.sql
  -> 20260715000001_phase6_admin_assurance.sql
```

No historical production migration version is copied into the clean staging ledger.

## Reproduced state

The final chain reproduces:

- 30 public tables;
- columns, defaults, primary keys, foreign keys, unique constraints, and checks;
- explicit and constraint-backed indexes;
- 58 public functions/RPCs and trigger helpers;
- public-table triggers plus two `auth.users` profile-sync triggers;
- grants, revocations, and default privileges;
- RLS enablement on every public table and 59 public policies;
- two application storage buckets and two user-created storage policies;
- four realtime publication members and captured replica identity;
- required `pgcrypto` and `uuid-ossp` extensions;
- Phase 3 durable counters/deduplication;
- Phase 4 transactional idempotency/checks;
- Phase 5 chat deduplication/rate limiting;
- Phase 6 assurance, audit, destructive-operation, media, and upload-quota contracts.

No production data, auth users, storage objects, or migration-history rows are included.

## Managed-schema prerequisites

The baseline assumes a normal fresh Supabase project already provides:

- roles `anon`, `authenticated`, `service_role`, `postgres`, and Supabase internal roles;
- schemas `auth`, `storage`, and `extensions`;
- `auth.users`;
- `storage.buckets` and `storage.objects`;
- the `supabase_realtime` publication.

These prerequisites were represented by minimal stubs during isolated PostgreSQL validation. The baseline does not replace or recreate Supabase-managed auth/storage internals.

## Migration conflicts and duplicate risks

1. Root historical files reuse short versions (`20260401`, `20260515`, `20260610`, `20260628`, `20260702`, and `20260706`) and remain unsuitable for a clean ledger.
2. Root history lacks the original core schema and contains order-dependent replacements.
3. `supabase/rental-commerce.sql` duplicates a dated migration.
4. `supabase/rls-policies.sql` is a manual script that can duplicate permissive policies.
5. Archived SQL uses incompatible ownership/table models.
6. Production migration metadata contains five versions unrelated to the clean canonical sequence; they are reconciliation evidence only.
7. Phase 6 required two replay fixes documented in the capture report; both are now covered by migration contracts.
8. The canonical baseline must appear exactly once and only on an empty staging project.

## Local proof

A brand-new isolated PostgreSQL 17 database applied the baseline and all seven migrations in order with `ON_ERROR_STOP` and one transaction per file. Every migration exited successfully.

Post-replay checks confirmed:

- no missing or duplicate object;
- no public table without RLS;
- no unsafe `SECURITY DEFINER` search path;
- expected RPC signatures and typed results;
- assurance helper ownership and API-role restrictions from DBMIG-010;
- auth triggers, bucket configuration, storage policies, and realtime membership;
- direct DELETE privileges remain deferred until Group E;
- Next database types have zero missing/extra tables or columns.

Docker-backed Supabase type generation was unavailable. Direct catalog comparison is green; generated staging types should be captured immediately after the approved remote bootstrap.

## Exact next commands

These commands are proposed only. None was run during schema capture.

From `C:\Users\PC\Desktop\Eventies-Next-Reconstruction\eventies-next`:

```powershell
# Read-only pre-application review
Get-Content -Raw .\supabase\.temp\project-ref
npx supabase migration list

# Requires a new explicit owner gate even though it is a dry run
npx supabase db push --dry-run
```

Stop and review the exact plan. Only after a separate explicit staging-application approval:

```powershell
npx supabase db push
npx supabase migration list
npx supabase gen types typescript --linked --schema public > .\.secure-schema-capture\staging-generated.types.ts
```

Do not run migration repair. Do not relink to production. Do not use production as a fallback.

After staging application, run CT-RPC, CT-RLS, auth/MFA/BYPASS personas, transactions, realtime, storage, audit, and media-boundary tests with staging-only credentials.

## Staging rollback or recreate strategy

The isolated staging project currently has no applied application migration history or fixture data. If any migration fails after application begins:

1. stop immediately and retain the failed version/log;
2. do not continue, repair, or point Preview at production;
3. obtain owner approval to recreate only the isolated staging project;
4. relink to the replacement staging ref;
5. update Preview-only environment variables;
6. rerun the already-proven chain from an empty project.

Never apply the squashed baseline to a nonempty production database. Future production migration-history reconciliation is a separate cutover decision.

## Required environment changes after bootstrap

Preview/Next values must point only to staging:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `CT_SUPABASE_URL`
- `CT_SUPABASE_ANON_KEY`
- staging-only user/admin persona JWT variables when live contract tests begin

Keep destructive, MFA enforcement, optimistic chat, and media rollout switches disabled until their staging evidence gates pass. Cloudinary and Turnstile values must remain Preview/staging scoped and must never enter Git.

## Current blockers outside bootstrap authorship

The schema itself is ready. These remain intentionally blocked pending owner authorization or staging personas:

- remote staging `db push --dry-run` and application;
- staging-generated type capture;
- CT-RPC and CT-RLS through PostgREST;
- live RLS, RPC, MFA, auth, transaction, realtime, upload, audit, and destructive-operation evidence;
- Edge Function and Vercel deployment;
- all Phase 7 work.

QG-P3, QG-P4, QG-P5, and QG-P6 remain blocked until their separate live evidence requirements are satisfied.

## Safety confirmation

- Production was read through schema/catalog-only operations and was not modified.
- No production row, auth user, message, request, quote, notification, audit row, or storage object was copied.
- No SQL or migration was applied to production or staging.
- No `db push`, linked reset, migration repair, Edge deployment, or Vercel deployment ran.
- The temporary production credential was deleted.
- Raw captures remain ignored and untracked.
- No secret is included in the baseline, reports, or Git diff.
- Phase 7 was not started.
