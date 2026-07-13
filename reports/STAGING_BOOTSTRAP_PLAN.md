# Eventies staging bootstrap plan

Date: 2026-07-13

Branch: `eventies-next-reconstruction`

Staging project ref: `ogfgaupebcabuoczoqcy`

Production project ref (prohibited in this task): `dqizzlcsioqykfeldtsj`

## Verdict

**CURRENT MIGRATIONS ARE NOT SUFFICIENT TO INITIALIZE A FRESH SUPABASE PROJECT.**

The seven files in `eventies-next/supabase/migrations/` are valid chronological deltas, not a baseline. They immediately alter or reference application objects that an empty Supabase project does not contain. The older files in root `supabase/migrations/` also assume a still-earlier runtime schema, use duplicate 8-digit migration versions, and contain replay conflicts. The archived SQL is explicitly incompatible with the current application model and must not be used.

The safe path is a new, schema-only, squashed canonical baseline representing the final pre-Next database state (through the 2026-07-06 root changes), followed by the seven existing Next-era migrations in their current order. Exact baseline authorship requires a separately approved, read-only production schema/catalog export. No production connection or export was made in this task.

Current code-side conclusion:

- Repository fresh-bootstrap readiness: **BLOCKED — baseline absent**.
- Staging migration ledger: **empty**; read-only `supabase migration list` showed seven local versions and no remote versions.
- Database application: **not started**.
- Phase 7: **not started**.

## Safety evidence

- Working directory: `C:\Users\PC\Desktop\Eventies-Next-Reconstruction`.
- Branch: `eventies-next-reconstruction`.
- Git was clean and synchronized before inspection.
- The CLI initially had no link marker. It was locally linked to the exact staging ref and rechecked:
  - local marker: `ogfgaupebcabuoczoqcy`;
  - CLI listing: staging `linked: true`;
  - production `linked: false`.
- The production database was not connected to, queried, dumped, or modified. The CLI management listing exposed project metadata only.
- No password, key, token, JWT, connection string, or service-role credential was printed or written.
- No SQL mutation or migration was executed/applied. The only remote database operation was the CLI's read-only staging migration-ledger query. No user, fixture, bucket, object, or Edge Function was created.
- Prohibited commands (`db push`, `db reset`, `migration repair`) were not run.

## Canonical-source assessment

| Source | Assessment | Bootstrap role |
|---|---|---|
| `eventies-next/supabase/migrations/*.sql` | Seven unique 14-digit Next-era deltas. This is the directory used by the staging-linked CLI. | Keep unchanged after adding a new earlier baseline. |
| `supabase/migrations/*.sql` | Historical root delta chain. Its README calls it authoritative, but it does not create the original core schema and cannot replay as-is. | Evidence for baseline reconstruction only; do not copy into the active CLI directory. |
| `supabase/rental-commerce.sql` | Byte-for-byte duplicate of `supabase/migrations/20260401_rental_commerce.sql`. | Exclude. |
| `supabase/rls-policies.sql` | Manually runnable policy script outside migration history; assumes core tables and older policy names. | Evidence only; applying it with later migrations risks duplicate permissive policies. |
| `_archive/legacy-sql/schema.sql` and `migration.sql` | Explicitly archived and incompatible (`admin_users`/`app_users`, `products.name`, older contact policy). | Never execute. |
| `src/shared/types/database.types.ts` | Hand-maintained advisory model with partial Phase 6 additions. It is not generated and is internally stale. | Validation aid only, never baseline authority. |
| `src/lib/database.types.ts` | Legacy Vite type model, reconciled only through 2026-07-06. | Compatibility reference only. |
| `src/shared/contracts/rpc.ts` | Current public application RPC-name contract. | Must match regenerated staging types and catalog after bootstrap. |
| `supabase/functions/cloudinary-assets/` | Only Edge Function source. It is outside the staging-linked `eventies-next/supabase/` project tree. | Must be canonicalized into the active Supabase tree before a later staging deployment. |
| `eventies-next/supabase/config.toml` | Missing. | Must be created in the baseline-authoring task before local fresh-project validation. |

## Exact missing baseline

The repository lacks the complete schema state that must exist immediately before `20260711000001_app_events.sql`.

### Missing baseline tables and columns

The pre-Next baseline must contain these root-era application tables at their final 2026-07-06 shape. Columns below are the union required by active SQL and application type/contracts; production catalog evidence is required to settle defaults, nullability, data types, checks, keys, and the noted drift.

- `profiles`: `id`, `name`, `email`, `phone`, `role`, `created_at`; FK to `auth.users(id)`. `avatar_url` is unresolved: both type files expose it, while `20260515_drop_avatar_columns.sql` drops it. Phase 6 later adds `is_active`.
- `products`: `id`, `title`, `slug`, `description`, `price`, `category_id`, `is_active`, `created_at`, `show_price`, `badge`, `badge_color`, `category_tags`, `short_description`, `featured`, `hero_image`, `gallery`, `quick_options`, `notes`, `features_left`, `features_right`, `currency`, `video_url`, `rental_enabled`, `sale_enabled`, `stock_total`, `stock_active`, `minimum_rental_days`, `buffer_before_days`, `buffer_after_days`.
- `categories`: `id`, `name`, `slug`, `created_at`, `icon`, `description`, `image`.
- `customers`: `id`, `name`, `logo_url`, `created_at`, `slug`, `category`.
- `parts`: `id`, `title`, `slug`, `description`, `price`, `is_active`, `created_at`, `product_id`, `product_slug`, `currency`, `image`, `in_stock`.
- `product_images`: `id`, `product_id`, `url`, `is_cover`, `sort_order`, `created_at`.
- `gallery_albums`: `id`, `slug`, `title`, `cover`, `images`, `category`, `sort_order`, `created_at`, `updated_at`.
- `contact_submissions`: `id`, `name`, `email`, `phone`, `product_id`, `product_slug`, `city`, `address`, `message`, `status`, `created_at`, `submitter_profile_id`.
- `admin_logs`: `id`, `admin_id`, `admin_name`, `admin_email`, `action`, `entity_type`, `entity_id`, `entity_name`, `details`, `created_at`. Phase 6 later adds `actor_role`, `result`, `correlation_id`, `metadata`.
- `contact_rate_limit`: `ip`, `count`, `window_start`.
- `rental_requests`: `id`, `request_number`, `profile_id`, `customer_name`, `email`, `phone`, `company_name`, `city`, `address`, `event_name`, `notes`, `admin_internal_notes`, `subtotal`, `extra_fees`, `grand_total`, `status`, `created_at`, `updated_at`. Phase 4 later adds `idempotency_key`.
- `rental_request_items`: `id`, `rental_request_id`, `product_id`, `product_slug`, `product_title_snapshot`, `quantity`, `rental_start_date`, `rental_end_date`, `rental_days`, `unit_price`, `line_total`, `created_at`.
- `purchase_quote_requests`: `id`, `request_number`, `profile_id`, `customer_name`, `email`, `phone`, `company_name`, `city`, `address`, `notes`, `admin_internal_notes`, `status`, `created_at`, `updated_at`. Phase 4 later adds `idempotency_key`.
- `purchase_quote_items`: `id`, `purchase_quote_request_id`, `product_id`, `product_slug`, `product_title_snapshot`, `quantity`, `created_at`.
- `inventory_reservations`: `id`, `product_id`, `rental_request_id`, `rental_request_item_id`, `reserved_quantity`, `start_date`, `end_date`, `status`, `created_at`.
- `request_status_history`: `id`, `request_type`, `request_id`, `old_status`, `new_status`, `note`, `changed_by_profile_id`, `created_at`. The polymorphic `request_id` intentionally has no FK.
- `custom_builds`: `id`, `title`, `description`, `image_url`, `images`, `category`, `sort_order`, `is_featured`, `is_active`, `created_at`, `updated_at`.
- `custom_build_categories`: `id`, `name`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- `chat_conversations`: `id`, `customer_id`, `status`, `context_type`, `context_ref`, `context_label`, `context_url`, `last_message_at`, `created_at`, `updated_at`, `resolved_at`, `resolved_by`.
- `chat_quick_questions`: `id`, `text_en`, `text_ar`, `sort_order`, `is_active`, `created_at`, `updated_at`.
- `chat_messages`: `id`, `conversation_id`, `sender_id`, `sender_type`, `kind`, `quick_question_id`, `body`, `created_at`. Phase 5 later adds `client_message_id`.
- `chat_read_states`: `conversation_id`, `user_id`, `last_read_at`, `updated_at`.
- `notifications`: `id`, `recipient_user_id`, `type`, `priority`, `title`, `title_ar`, `message`, `message_ar`, `entity_type`, `entity_id`, `target_url`, `metadata`, `read_at`, `created_at`, `created_by`, `dedupe_key`.

The seven Next migrations then create or add:

- `app_events(id,event,payload,actor_hash,created_at)`.
- Arabic columns: `products.title_ar/description_ar/short_description_ar`, `categories.name_ar/description_ar`, `custom_builds.title_ar/description_ar`, `custom_build_categories.name_ar`, `gallery_albums.title_ar`.
- `app_rate_limits(bucket_key,event_count,window_expires_at,updated_at)`.
- `public_form_dedup(dedup_key,expires_at,created_at)`.
- Phase 4 idempotency columns, unique indexes, and bounded request/item checks.
- `chat_messages.client_message_id` and its sender-scoped unique index.
- `chat_message_rate_counters(sender_id,window_started_at,message_count)`.
- `profiles.is_active` and structured `admin_logs` audit columns.
- `admin_media_operations`, `admin_rpc_idempotency`, and `admin_upload_signing_windows`.

### Missing non-table baseline objects

- Core primary/unique/foreign keys, defaults, checks, and sequences for all baseline tables.
- Core public-read and admin-write RLS policies for `products`, `categories`, `customers`, `parts`, `product_images`, and `gallery_albums`.
- Full contact policies (public insert plus admin read/update/delete); the active root migration only definitively recreates admin update.
- RLS enablement and ACLs for `profiles`, `admin_logs`, core catalog tables, and storage objects.
- `product-images` and `product-videos` bucket metadata, including public/private flag, size limit, and MIME allowlist.
- Public-read and trusted-write storage policies for both buckets. Active migrations only replace the `product-videos` admin-write policy and assume the bucket/public-read policy already exists.
- Exact `supabase_realtime` publication membership and any replica-identity settings.
- Auth-trigger state on `auth.users`, including the intended final bodies for profile creation/update after avatar-column removal.
- Extension placement/search path (`pgcrypto` is required; archived `uuid-ossp` is not authoritative).
- Complete grants/default privileges for `anon`, `authenticated`, `service_role`, and internal owners.
- The canonical migration-ledger relationship between the historical root state and a new squashed baseline.

No active SQL creates a custom enum, domain, view, materialized view, or composite type. Status/audience values are text plus checks. This absence must be confirmed against the authoritative schema export.

## Object inventory from active migration SQL

### Functions and RPCs

Public/application RPCs that must exist after bootstrap:

- Identity/admin: `is_admin`, `is_superadmin`, `get_all_admins`, `get_all_users`, `admin_update_user`, `set_admin_role`, `remove_admin`.
- Transactions: `get_rental_availability`, `create_rental_request`, `create_purchase_quote_request`, private legacy bodies `create_rental_request_v1` and `create_purchase_quote_request_v1`, `approve_rental_request`, `update_request_status`.
- Chat: `get_or_create_chat_conversation`, `mark_chat_conversation_read`, `get_chat_unread_count`, `get_superadmin_chat_inbox`, `set_chat_conversation_status`.
- Notifications: `get_notification_unread_count`, `mark_notification_read`, `mark_all_notifications_read`, `preview_notification_audience`, `send_custom_notification`, `send_custom_notification_idempotent`.
- Phase 3: `consume_app_rate_limit`, `claim_public_form_dedup`, private `cleanup_phase3_security_state`.
- Phase 6: private `assert_admin_assurance` and `write_admin_audit`; `delete_admin_product`, `delete_admin_category`, `delete_admin_gallery_album`, `delete_admin_custom_build`, `bulk_delete_admin_entities`, `begin_admin_media_delete`, `complete_admin_media_delete`, `consume_admin_upload_quota`.

Trigger/support functions that must exist with non-API grants where appropriate:

- `update_updated_at`, `generate_request_number`, `auth_avatar_url`, `handle_new_user`, `sync_profile_from_auth_user`, `lock_profile_role`, `check_contact_rate_limit`.
- `chat_set_message_identity`, `chat_touch_conversation`, `chat_touch_updated_at`, `chat_enforce_message_rate`.
- `notification_capture_contact_submitter`, `notification_target_is_safe`, `enqueue_notification`, `notification_rental_created`, `notification_rental_status_changed`, `notification_purchase_quote_created`, `notification_purchase_quote_status_changed`, `notification_contact_submitted`, `notification_chat_message_created`.

### Indexes created by the delta history

The active SQL explicitly creates:

- Transactional: `idx_inventory_reservations_product_dates`, `idx_purchase_quote_items_request_id`, `idx_purchase_quote_requests_profile_id`, `idx_purchase_quote_requests_status`, `idx_rental_request_items_request_id`, `idx_rental_requests_profile_id`, `idx_rental_requests_status`, `idx_request_status_history_lookup`.
- Relationship/performance: `idx_contact_submissions_created`, `idx_contact_submissions_product_id`, `idx_contact_submissions_status`, `idx_gallery_albums_sort_order`, `idx_parts_product_id`, `idx_parts_product_slug`, `idx_product_images_product_id`, `idx_request_status_history_changed_by`, `idx_inventory_reservations_rental_request_id`, `idx_inventory_reservations_rental_request_item_id`, `idx_products_category_id`, `idx_purchase_quote_items_product_id`, `idx_rental_request_items_product_id`.
- Custom builds: `idx_custom_builds_featured`, `idx_custom_builds_public_order`, `idx_custom_build_categories_name_unique`, `idx_custom_build_categories_public_order`.
- Chat: `chat_conversations_one_open_per_customer_idx`, `chat_conversations_last_message_idx`, `chat_conversations_status_last_message_idx`, `chat_messages_conversation_created_idx`, `chat_messages_sender_created_idx`, `chat_read_states_user_idx`, `chat_messages_sender_client_message_id_uidx`.
- Notifications: `notifications_recipient_created_idx`, `notifications_recipient_unread_idx`, `notifications_recipient_dedupe_idx`, `contact_submissions_submitter_profile_idx`.
- Next: `app_events_event_created_idx`, `rental_requests_profile_idempotency_uidx`, `purchase_quotes_profile_idempotency_uidx`.

Unknown original core indexes and constraint-generated indexes are part of the missing baseline and cannot be reconstructed safely from TypeScript.

### Triggers

The history creates or replaces:

- Auth: `on_auth_user_created`, `on_auth_user_updated_profile_sync` on `auth.users`.
- Profile/contact: `lock_profile_role`, `check_contact_rate_limit`.
- Transaction timestamps: `trg_rental_requests_updated`, `trg_purchase_quote_requests_updated`.
- Custom builds: `trg_custom_builds_updated`, `trg_custom_build_categories_updated`.
- Chat: `chat_conversations_updated_at`, `chat_quick_questions_updated_at`, `chat_read_states_updated_at`, `chat_message_identity_before_insert`, `chat_touch_conversation_after_message`, `chat_message_rate_before_insert`.
- Notifications: `notification_capture_contact_submitter_before_insert`, `notification_rental_created_deferred`, `notification_rental_status_changed_after_update`, `notification_purchase_quote_created_deferred`, `notification_purchase_quote_status_changed_after_update`, `notification_contact_submitted_after_insert`, `notification_chat_message_created_after_insert`.

### RLS, grants, storage, and realtime

- Profiles: own read/update/insert and admin read.
- Admin logs: authenticated admin read/insert.
- Rental/quote/history: own-user reads/inserts plus admin management; direct insert policies are later removed in favor of RPCs.
- Catalog/core: public read is assumed; later files replace admin `ALL` policies with explicit insert/update/delete policies.
- Custom builds/categories: public active-row read plus admin management.
- Chat: customer/admin conversation reads, sender-authorized inserts, quick-question reads, and own/admin read-state access.
- Notifications: authenticated recipient-only select; writes occur through trusted functions/triggers.
- Internal counter/audit tables: RLS enabled with no browser policies and/or explicit table revokes.
- Function grants are narrowed across the chain; private trigger/assurance/audit functions are revoked from API roles.
- Storage: only `admin write product-videos` is present in active migrations; bucket creation, public read, and `product-images` policies are missing.
- Realtime: root migrations conditionally add `chat_conversations`, `chat_messages`, and `notifications` to `supabase_realtime`.

## Migration dependency graph

The older root files are shown in filename order only. Because versions repeat, this is not a valid Supabase ledger order and must not be executed as a chain.

| Migration | Creates/changes | Hard prerequisites |
|---|---|---|
| `20260401_contact_submissions_general_inquiry` | Makes `product_slug` nullable if table exists | Missing baseline `contact_submissions`; silently does nothing without it |
| `20260401_profiles_avatar_auth_fix` | Profile columns, `is_admin`, new-user trigger, profile policies | `profiles`, `auth.users`, managed auth roles |
| `20260401_profiles_avatar_url_support` | Avatar URL helper, profile sync function/update trigger | Prior profile columns, `profiles`, `auth.users` |
| `20260401_rental_commerce` | Six transaction tables, RPCs, triggers, indexes, RLS | `products`, `profiles`, `admin_logs`, `is_admin`, `pgcrypto` |
| `20260401_request_approval_and_admin_avatar_fix` | Availability/admin-update replacements | Transaction tables, products, profiles, admin helper |
| `20260402_auth_admin_rpc_and_contact_rls` | Superadmin/admin/user RPCs and contact/profile policies | `profiles`, `contact_submissions`, `is_admin`, auth roles |
| `20260505_relationship_normalization` | Preflight, FKs, relationship indexes | All core/transaction tables plus schema-only/no-orphan precondition |
| `20260515_contact_submissions_hardening` | Contact checks, `contact_rate_limit`, trigger | `contact_submissions` |
| `20260515_drop_avatar_columns` | Drops all avatar columns | `profiles`; conflicts with still-installed auth trigger bodies/types |
| `20260515_force_request_rpcs` | Removes direct request insert path | Transaction tables/RPCs/policies |
| `20260515_lock_profile_role` | Role-protection trigger | `profiles` |
| `20260610_admin_update_user_drop_avatar` | Drops old 7-argument RPC and creates 3-argument RPC | `profiles`, `is_admin` |
| `20260610_approve_rental_lock` | Advisory-lock approval body | Rental tables, availability and status RPCs |
| `20260610_contact_rate_limit_hardening` | Replaces contact limit trigger/function | `contact_rate_limit`, `contact_submissions` |
| `20260628_custom_builds` | Custom-build table, policies, trigger | `is_admin`, `update_updated_at`, `pgcrypto` |
| `20260628_custom_builds_gallery` | Image-array constraints/backfill | `custom_builds` |
| `20260629_custom_build_categories` | Category table, backfill, policies, trigger | `custom_builds`, `is_admin`, timestamp helper |
| `20260702_contact_limits_and_fk_indexes` | Additional checks/FKs/indexes | Core contact/product and transaction tables |
| `20260702_rls_performance` | Rewrites profile/admin/transaction/catalog policies | All core tables and their earlier policy families |
| `20260702_security_hardening` | RPC/search-path/grant hardening and storage policy | Earlier RPCs/helpers, `storage.objects`, existing buckets/policies |
| `20260706_live_support_chat` | Four chat tables, RPCs, triggers, policies, realtime | `profiles`, `is_admin`, managed realtime publication |
| `20260706_notification_system` | Notifications, RPCs/triggers/policies/realtime | Profiles, contacts, transactions, chat, products, admin logs |
| `20260711000001_app_events` | Scrubbed event table/index/RLS | UUID generator/extension; otherwise independent |
| `20260711000002_arabic_columns` | Nullable Arabic content columns | Products, categories, custom builds/categories, gallery albums |
| `20260712000001_phase3_security_counters` | Durable rate/dedup tables and RPCs | Managed API roles |
| `20260713000001_phase4_idempotency_and_checks` | Request keys/checks, v1-body rename, wrappers | Transaction tables and existing create-request RPC signatures |
| `20260714000001_phase5_chat_client_message_id` | Chat dedup column/index | `chat_messages` |
| `20260714000002_phase5_chat_message_rate_limit` | Counter table and insert trigger | `chat_messages`, `profiles`, auth identity |
| `20260715000001_phase6_admin_assurance` | Assurance/audit/destructive/media/quota contracts | Profiles, auth users, products, categories, gallery, custom builds, notifications, admin logs |

Proposed executable DAG:

```text
Supabase managed schemas/roles (auth, storage, realtime, anon/authenticated/service_role)
  -> 20260710000000_canonical_pre_next_baseline.sql (new; schema only)
  -> 20260711000001_app_events.sql
  -> 20260711000002_arabic_columns.sql
  -> 20260712000001_phase3_security_counters.sql
  -> 20260713000001_phase4_idempotency_and_checks.sql
  -> 20260714000001_phase5_chat_client_message_id.sql
  -> 20260714000002_phase5_chat_message_rate_limit.sql
  -> 20260715000001_phase6_admin_assurance.sql
```

## Conflicts and duplicate risks

1. **Duplicate migration versions:** root files reuse versions `20260401` (5 files), `20260515` (4), `20260610` (3), `20260628` (2), `20260702` (3), and `20260706` (2). Supabase migration history requires an unambiguous version; renaming alone would not fix semantic conflicts.
2. **No initial core schema:** the earliest root files immediately alter `profiles`, `products`, and `contact_submissions`; none creates the full core runtime schema.
3. **Concrete missing-function replay failure:** `20260610_admin_update_user_drop_avatar.sql` drops `admin_update_user(uuid,text,text,text,text,text,jsonb)`, but `20260702_security_hardening.sql` later unconditionally alters/revokes/grants that removed signature. A clean replay stops there.
4. **Auth-trigger/avatar conflict:** May 2026 drops `avatar_url`, `avatar_style`, `avatar_seed`, and `avatar_options`, while `handle_new_user` and `sync_profile_from_auth_user` still reference those columns. Both auth triggers remain installed. Type files also still expose `avatar_url`.
5. **Manual RLS drift:** `supabase/rls-policies.sql` is outside migration history and uses policy names that later files do not consistently drop, creating duplicate permissive-policy risk if replayed.
6. **Duplicate commerce script:** `supabase/rental-commerce.sql` is byte-identical to the dated migration and must never be run in addition to it.
7. **Archived schema conflict:** archived SQL creates obsolete `admin_users`/`app_users` ownership models and an older contact policy.
8. **Storage gap:** no active migration creates either required storage bucket or the complete policy set.
9. **Function overwrite/order sensitivity:** `update_updated_at`, request RPCs, contact-rate function, admin RPCs, and notification/admin functions are replaced multiple times; a squashed final definition is safer than renumbering the historical files.
10. **One-shot Phase 4 DDL:** multiple checks are added without `IF NOT EXISTS`, and public request functions are renamed to `_v1`; the migration must appear exactly once in a clean ledger.
11. **Split function tree:** the only Edge Function is outside the linked project directory, so a deploy from `eventies-next` would not contain it.
12. **Type drift:** both type files claim a 2026-07-06 reconciliation, but the Next type file omits whole tables (`app_events`, `app_rate_limits`, `chat_message_rate_counters`, `admin_upload_signing_windows`), omits Arabic catalog columns, and contains the unresolved avatar field. Types cannot substitute for catalog DDL.

## Schema-only baseline strategy

1. Obtain a separately approved, read-only production schema/catalog capture using a dedicated read-only database credential in an isolated scratch directory. Do not relink this staging worktree to production.
2. Capture DDL only for `public`, including extensions used by public objects, tables, keys, checks, indexes, functions, triggers, policies, ACLs, comments, and sequences. Capture no public table rows.
3. Capture catalog metadata only for:
   - `auth.users` trigger definitions that call public profile functions;
   - `storage.buckets` fields `id`, `name`, `public`, `file_size_limit`, `allowed_mime_types`;
   - storage RLS policy definitions, not `storage.objects` rows;
   - `supabase_realtime` publication membership and replica identity;
   - migration ledger versions;
   - installed extensions and object ownership.
4. Explicitly exclude `auth.users` rows, identities/sessions, all customer/request/message/contact/audit rows, `storage.objects`, object contents, and every secret.
5. Normalize the capture into one reviewed migration: `eventies-next/supabase/migrations/20260710000000_canonical_pre_next_baseline.sql`.
6. The baseline must contain the final root-era definitions, not the replay of root history. It must not contain the seven later deltas.
7. Add idempotent bucket metadata and storage policies only; never create or replace Supabase-managed `auth`, `storage`, or realtime schemas.
8. Resolve the avatar/auth-trigger contradiction explicitly against the captured schema before committing the baseline.
9. Move/copy the reviewed Edge Function into `eventies-next/supabase/functions/cloudinary-assets/` and add a canonical `eventies-next/supabase/config.toml` in the same future change.
10. Validate the complete chain against a brand-new local Supabase database before any remote staging application.

## Owner approval required before the next task

The repository cannot determine the exact production-compatible baseline from local files. The next task requires this explicit approval:

> Authorize one one-time, schema-only, read-only connection to production project `dqizzlcsioqykfeldtsj`, using a dedicated read-only database credential and an isolated scratch directory, solely to export public DDL and catalog metadata for extensions, constraints, indexes, functions, triggers, grants, RLS, auth.users trigger definitions, storage bucket configuration/policies, realtime publication membership, and migration versions. Explicitly prohibit export of public data rows, auth users/identities/sessions, messages, contacts, requests, audit rows, storage object rows/files, or secrets. No production mutation, link change in the staging worktree, repair, or migration application is authorized.

Without that approval and capture, authoring the baseline would require guessing at security- and compatibility-critical schema details.

## Exact proposed commands for the approved next step

These commands are documentation only and were **not run**. Values must be injected securely and never echoed.

### A. Read-only production capture in a disposable directory

```powershell
$env:EVENTIES_PROD_READONLY_DB_URL = '<securely injected dedicated read-only URL>'
$capture = Join-Path $env:TEMP 'eventies-schema-capture'
New-Item -ItemType Directory -Force -Path $capture | Out-Null

npx supabase db dump `
  --db-url $env:EVENTIES_PROD_READONLY_DB_URL `
  --schema public `
  --file (Join-Path $capture 'public-schema.sql')

psql $env:EVENTIES_PROD_READONLY_DB_URL -X -v ON_ERROR_STOP=1 `
  -c "\copy (select id,name,public,file_size_limit,allowed_mime_types from storage.buckets order by id) to '$capture/storage-buckets.csv' csv header"

psql $env:EVENTIES_PROD_READONLY_DB_URL -X -v ON_ERROR_STOP=1 `
  -c "\copy (select schemaname,tablename,policyname,permissive,roles,cmd,qual,with_check from pg_policies where schemaname in ('public','storage') order by 1,2,3) to '$capture/policies.csv' csv header"

psql $env:EVENTIES_PROD_READONLY_DB_URL -X -v ON_ERROR_STOP=1 `
  -c "\copy (select schemaname,tablename from pg_publication_tables where pubname='supabase_realtime' order by 1,2) to '$capture/realtime-publication.csv' csv header"

psql $env:EVENTIES_PROD_READONLY_DB_URL -X -v ON_ERROR_STOP=1 `
  -c "\copy (select tgname,pg_get_triggerdef(oid) from pg_trigger where tgrelid='auth.users'::regclass and not tgisinternal order by tgname) to '$capture/auth-user-triggers.csv' csv header"

psql $env:EVENTIES_PROD_READONLY_DB_URL -X -v ON_ERROR_STOP=1 `
  -c "\copy (select version from supabase_migrations.schema_migrations order by version) to '$capture/migration-versions.csv' csv header"
```

The capture must be reviewed/redacted before any derived migration is committed. The raw capture remains private and outside Git.

### B. Author and validate the canonical chain locally

```powershell
Set-Location 'C:\Users\PC\Desktop\Eventies-Next-Reconstruction\eventies-next'
npx supabase init
# Author 20260710000000_canonical_pre_next_baseline.sql after review.
# Canonicalize supabase/functions/cloudinary-assets and config.toml.
npx supabase start
npx supabase db reset --local
npx supabase migration list --local
npm run typecheck
npm run lint
npm run gate:arch
npm run gate:i18n
npm run gate:cycles
npm test
npm run build
npx supabase stop
```

`db reset --local` is proposed only for the later local validation task; it was prohibited and not run during this precheck.

### C. Staging dry run and application after a second explicit owner gate

```powershell
Set-Location 'C:\Users\PC\Desktop\Eventies-Next-Reconstruction\eventies-next'
npx supabase link --project-ref ogfgaupebcabuoczoqcy
npx supabase migration list
npx supabase db push --dry-run
# Stop for human review of the exact plan.
# Only after explicit approval:
npx supabase db push
npx supabase migration list
```

The real `db push` is not authorized by this report. `migration repair` is not part of staging bootstrap.

### D. Post-bootstrap schema verification

After the database migration succeeds, regenerate types from staging and diff them against both hand-maintained files before replacement. Then run CT-RPC, CT-RLS, MFA/BYPASS, realtime, storage, and transaction tests with staging-only personas and credentials.

The eventual Edge deployment is a separate operation after DBMIG-010, function canonicalization, secrets, and rollout flags are reviewed:

```powershell
npx supabase functions deploy cloudinary-assets --project-ref ogfgaupebcabuoczoqcy
```

No function deployment is authorized by this report.

## Required environment changes

Preview/Next staging values must point only to staging:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never browser-exposed)
- Contract-test variables: `CT_SUPABASE_URL`, `CT_SUPABASE_ANON_KEY`, and later staging-only persona JWTs.
- Existing Turnstile Preview values remain staging/Preview scoped.
- Keep `ADMIN_DESTRUCTIVE_ENABLED`, `NEXT_PUBLIC_ADMIN_DESTRUCTIVE_ENABLED`, and MFA/destructive rollout switches off until live gates pass.
- Keep `NEXT_PUBLIC_CHAT_OPTIMISTIC_ENABLED` off until realtime/dedup evidence passes.

The Cloudinary Edge Function later requires staging-scoped secret configuration:

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `CLOUDINARY_ADMIN_UPLOAD_PRESET`
- `ADMIN_MFA_ENFORCEMENT`, `ADMIN_UPLOAD_HARDENING_ENABLED`, `ADMIN_DESTRUCTIVE_ENABLED`

No secret value belongs in Git or command output.

## Staging rollback/recreate strategy

- Before application, the staging project has no local migration versions applied and no fixture users/data. The safest failure recovery is recreation of the isolated staging project, not repair of a partially applied history.
- If any baseline/delta fails after earlier migrations commit, stop immediately. Do not continue, repair, or point the application at production.
- Preserve CLI logs and the failed version, delete/recreate only the isolated staging project through an owner-approved operation, relink to the new staging ref, update Preview environment variables, and rerun the locally proven chain from zero.
- Never use production as a fallback or source of rows/objects.
- The future production compatibility path is separate: prove schema equivalence, then obtain a human cutover decision for how the squashed baseline version is represented in production migration history. Do not apply the baseline to a nonempty production database. Any future `migration repair` would require its own explicit production approval and is outside this plan.

## Final confirmation

- Current migrations sufficient: **No**.
- Complete canonical baseline present: **No**.
- Exact blocker: missing final pre-Next schema plus contradictory/non-replayable historical deltas.
- Production database accessed: **No**.
- Production modified: **No**.
- Staging SQL applied: **No**.
- Users or fixtures created: **No**.
- Migration application begun: **No**.
- Phase 7 begun: **No**.
