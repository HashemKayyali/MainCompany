param(
  [string]$CapturePath = (Join-Path $PSScriptRoot '..\.secure-schema-capture\production_schema_raw.sql'),
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\supabase\migrations\20260710000000_canonical_baseline.sql')
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$capture = [System.IO.Path]::GetFullPath($CapturePath)
$output = [System.IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path -LiteralPath $capture -PathType Leaf)) {
  throw "Schema capture not found: $capture"
}

$sql = [System.IO.File]::ReadAllText($capture)

if ($sql -match '(?im)^COPY\s+' -or $sql -match '(?im)^INSERT\s+INTO\s+') {
  throw 'The raw capture contains table-data statements.'
}

if ($sql -match '(?i)PASSWORD\s+''' -or $sql -match '(?i)postgres(?:ql)?://') {
  throw 'The raw capture contains credential material.'
}

$sql = [regex]::Replace($sql, '(?m)^\\(?:un)?restrict\s+.*\r?\n?', '')
$sql = $sql.Replace('CREATE SCHEMA "public";', 'CREATE SCHEMA IF NOT EXISTS "public";')
$sql = [regex]::Replace(
  $sql,
  '(?m)^ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin".*;\r?\n?',
  ''
)

# Production retains the frozen seven-argument admin_update_user signature,
# but its body still referenced avatar columns removed from profiles. Preserve
# the callable signature while limiting the update to authoritative columns.
$adminUpdatePattern = '(?ms)(CREATE FUNCTION "public"\."admin_update_user".*?UPDATE public\.profiles p\s+SET\s+)(?<assignments>.*?)(\s+WHERE p\.id = admin_update_user\.target_id;)'
$adminUpdateMatch = [regex]::Match($sql, $adminUpdatePattern)
if (-not $adminUpdateMatch.Success) {
  throw 'Could not locate the captured admin_update_user assignment block.'
}

$safeAssignments = @'
    name = CASE
      WHEN admin_update_user.new_name IS NULL THEN p.name
      ELSE NULLIF(BTRIM(admin_update_user.new_name), '')
    END,
    phone = CASE
      WHEN admin_update_user.new_phone IS NULL THEN p.phone
      ELSE NULLIF(BTRIM(admin_update_user.new_phone), '')
    END
'@

$sql =
  $sql.Substring(0, $adminUpdateMatch.Groups['assignments'].Index) +
  $safeAssignments.TrimEnd() +
  $sql.Substring(
    $adminUpdateMatch.Groups['assignments'].Index +
      $adminUpdateMatch.Groups['assignments'].Length
  )

$header = @'
-- Eventies canonical pre-Next baseline.
--
-- Source: owner-approved schema-only production catalog capture on 2026-07-13.
-- This migration intentionally contains no application rows, auth users,
-- storage objects, credentials, or historical migration-ledger rows.

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

'@

$managedConfiguration = @'

-- Auth-to-profile synchronization captured from auth.users.
DROP TRIGGER IF EXISTS "on_auth_user_created" ON "auth"."users";
CREATE TRIGGER "on_auth_user_created"
  AFTER INSERT ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."handle_new_user"();

DROP TRIGGER IF EXISTS "on_auth_user_updated_profile_sync" ON "auth"."users";
CREATE TRIGGER "on_auth_user_updated_profile_sync"
  AFTER UPDATE OF "email", "raw_user_meta_data" ON "auth"."users"
  FOR EACH ROW
  EXECUTE FUNCTION "public"."sync_profile_from_auth_user"();

-- Storage bucket configuration metadata. No storage.objects rows are copied.
INSERT INTO "storage"."buckets" (
  "id",
  "name",
  "public",
  "file_size_limit",
  "allowed_mime_types"
)
VALUES
  ('product-images', 'product-images', true, NULL, NULL),
  (
    'product-videos',
    'product-videos',
    true,
    31457280,
    ARRAY['video/mp4', 'video/webm', 'video/quicktime']::text[]
  )
ON CONFLICT ("id") DO UPDATE
SET
  "name" = EXCLUDED."name",
  "public" = EXCLUDED."public",
  "file_size_limit" = EXCLUDED."file_size_limit",
  "allowed_mime_types" = EXCLUDED."allowed_mime_types";

DROP POLICY IF EXISTS "admin write product-images" ON "storage"."objects";
CREATE POLICY "admin write product-images"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR ALL
  TO "authenticated"
  USING (("bucket_id" = 'product-images') AND "public"."is_admin"())
  WITH CHECK (("bucket_id" = 'product-images') AND "public"."is_admin"());

DROP POLICY IF EXISTS "admin write product-videos" ON "storage"."objects";
CREATE POLICY "admin write product-videos"
  ON "storage"."objects"
  AS PERMISSIVE
  FOR ALL
  TO "authenticated"
  USING (("bucket_id" = 'product-videos') AND "public"."is_admin"())
  WITH CHECK (("bucket_id" = 'product-videos') AND "public"."is_admin"());

-- Reproduce the captured Supabase Realtime publication membership.
DO $realtime$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM "pg_catalog"."pg_publication"
    WHERE "pubname" = 'supabase_realtime'
  ) THEN
    EXECUTE 'CREATE PUBLICATION "supabase_realtime"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "pg_catalog"."pg_publication_tables"
    WHERE "pubname" = 'supabase_realtime'
      AND "schemaname" = 'public'
      AND "tablename" = 'profiles'
  ) THEN
    EXECUTE 'ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."profiles"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "pg_catalog"."pg_publication_tables"
    WHERE "pubname" = 'supabase_realtime'
      AND "schemaname" = 'public'
      AND "tablename" = 'chat_conversations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."chat_conversations"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "pg_catalog"."pg_publication_tables"
    WHERE "pubname" = 'supabase_realtime'
      AND "schemaname" = 'public'
      AND "tablename" = 'chat_messages'
  ) THEN
    EXECUTE 'ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."chat_messages"';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "pg_catalog"."pg_publication_tables"
    WHERE "pubname" = 'supabase_realtime'
      AND "schemaname" = 'public'
      AND "tablename" = 'notifications'
  ) THEN
    EXECUTE 'ALTER PUBLICATION "supabase_realtime" ADD TABLE "public"."notifications"';
  END IF;
END
$realtime$;

ALTER TABLE "public"."profiles" REPLICA IDENTITY DEFAULT;
ALTER TABLE "public"."chat_conversations" REPLICA IDENTITY DEFAULT;
ALTER TABLE "public"."chat_messages" REPLICA IDENTITY DEFAULT;
ALTER TABLE "public"."notifications" REPLICA IDENTITY DEFAULT;
'@

$baseline = $header + $sql.TrimEnd() + $managedConfiguration

$outputDirectory = Split-Path -Parent $output
if (-not (Test-Path -LiteralPath $outputDirectory -PathType Container)) {
  throw "Migration directory not found: $outputDirectory"
}

[System.IO.File]::WriteAllText(
  $output,
  ($baseline.TrimEnd() + [Environment]::NewLine),
  [System.Text.UTF8Encoding]::new($false)
)

Write-Output "Canonical baseline written: $output"
