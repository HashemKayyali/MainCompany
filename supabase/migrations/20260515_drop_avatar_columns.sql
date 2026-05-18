-- ============================================================================
-- Remove the avatar feature from the database
-- ============================================================================
-- The avatar feature (uploaded photos + generated avatars) has been fully
-- removed from the application. Identity chips now render initials only and
-- the app no longer reads or writes any avatar column. These columns are
-- therefore dead data and are dropped here.
--
-- Safe / idempotent: every drop is guarded with IF EXISTS, so re-running
-- this migration (or running it after the columns are already gone) is a
-- no-op. No other table references these columns.
-- ============================================================================

ALTER TABLE public.profiles DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS avatar_style;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS avatar_seed;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS avatar_options;
