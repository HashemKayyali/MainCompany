-- I18N-009 / DBMIG-004 (Wave B) — additive Arabic (`*_ar`) content columns.
--
-- PIPELINE (DBMIG-001): authored here in P2; applied to branch/staging by CI
-- (DBMIG-002) for the read-path contract tests; PRODUCTION APPLY IS ⛔ HUMAN-
-- GATED (DBMIG-004) and must not be run by Claude Code.
--
-- Additive + frozen-Vite-compatible: every column is NULLABLE with no default,
-- so the running Vite app (which never selects these) is unaffected. The Next
-- DAL reads them with an EN fallback (I18N-010: coalesce(x_ar, x)).
-- Inverse migration: drop each added column.

-- products: name/title + descriptions + short description
alter table public.products
  add column if not exists title_ar text,
  add column if not exists description_ar text,
  add column if not exists short_description_ar text;

-- categories: name + description
alter table public.categories
  add column if not exists name_ar text,
  add column if not exists description_ar text;

-- custom_builds: title + description
alter table public.custom_builds
  add column if not exists title_ar text,
  add column if not exists description_ar text;

-- custom_build_categories: name
alter table public.custom_build_categories
  add column if not exists name_ar text;

-- gallery_albums: title
alter table public.gallery_albums
  add column if not exists title_ar text;

comment on column public.products.title_ar is
  'Arabic product name (nullable; EN fallback via coalesce). Admin-editable in P6 (I18N-020).';
