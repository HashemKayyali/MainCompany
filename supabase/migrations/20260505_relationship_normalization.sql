-- ====================================================
-- Eventies / Bike Land — Relationship Normalization
-- ----------------------------------------------------
-- Goal: tighten weak relationships in the public schema:
--   1. parts.product_slug (text)            → adds parts.product_id        FK products(id)
--   2. contact_submissions.product_slug     → adds contact_submissions.product_id FK products(id)
--   3. admin_logs.admin_id                  → real FK to profiles(id)
--   4. Better lookup indexes                (FK + status + created_at coverage)
--
-- Already-correct relationships (verified live):
--   * profiles.id  → auth.users.id            (existing FK)
--   * products.category_id → categories.id    (existing FK)
--   * rental_request_items.product_id, purchase_quote_items.product_id,
--     inventory_reservations.product_id, product_images.product_id  (existing FKs)
--   * rental_requests / purchase_quote_requests.profile_id → profiles.id
--   * inventory_reservations / rental_request_items / purchase_quote_items
--     have proper FK chain
--
-- Polymorphic table (intentionally NOT FK-bound):
--   * request_status_history(request_type, request_id) — see Section D.
--
-- Safety:
--   * Idempotent (IF NOT EXISTS / DO blocks).
--   * Never modifies auth schema beyond the existing profiles FK.
--   * No destructive changes to data.
--   * product_slug columns are kept on parts/contact_submissions for
--     backward compatibility; the application code can migrate to
--     product_id incrementally.
--
-- Run order: after every prior migration in supabase/migrations/.
-- ====================================================

-- ────────────────────────────────────────────────────
-- Section 0: Preflight — log any data that would block FKs
-- ────────────────────────────────────────────────────
DO $$
DECLARE
  v_profiles_orphans     integer;
  v_parts_orphans        integer;
  v_parts_empty_slug     integer;
  v_contacts_orphans     integer;
  v_contacts_empty_slug  integer;
  v_history_rental_orphans         integer;
  v_history_quote_orphans          integer;
  v_admin_logs_orphans   integer;
BEGIN
  SELECT COUNT(*) INTO v_profiles_orphans
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE u.id IS NULL;

  SELECT COUNT(*) INTO v_parts_orphans
  FROM public.parts p
  LEFT JOIN public.products pr ON pr.slug = p.product_slug
  WHERE COALESCE(p.product_slug,'') <> '' AND pr.id IS NULL;

  SELECT COUNT(*) INTO v_parts_empty_slug
  FROM public.parts WHERE COALESCE(product_slug,'') = '';

  SELECT COUNT(*) INTO v_contacts_orphans
  FROM public.contact_submissions cs
  LEFT JOIN public.products pr ON pr.slug = cs.product_slug
  WHERE COALESCE(cs.product_slug,'') <> '' AND pr.id IS NULL;

  SELECT COUNT(*) INTO v_contacts_empty_slug
  FROM public.contact_submissions WHERE COALESCE(product_slug,'') = '';

  SELECT COUNT(*) INTO v_history_rental_orphans
  FROM public.request_status_history h
  LEFT JOIN public.rental_requests rr ON rr.id = h.request_id
  WHERE h.request_type = 'rental' AND rr.id IS NULL;

  SELECT COUNT(*) INTO v_history_quote_orphans
  FROM public.request_status_history h
  LEFT JOIN public.purchase_quote_requests pqr ON pqr.id = h.request_id
  WHERE h.request_type = 'purchase_quote' AND pqr.id IS NULL;

  SELECT COUNT(*) INTO v_admin_logs_orphans
  FROM public.admin_logs al
  LEFT JOIN public.profiles p ON p.id = al.admin_id
  WHERE p.id IS NULL;

  RAISE NOTICE 'Preflight ─ profiles_without_auth_users         : %', v_profiles_orphans;
  RAISE NOTICE 'Preflight ─ parts_orphan_product_slug           : %', v_parts_orphans;
  RAISE NOTICE 'Preflight ─ parts_with_empty_product_slug       : %', v_parts_empty_slug;
  RAISE NOTICE 'Preflight ─ contact_submissions_orphan_slug     : %', v_contacts_orphans;
  RAISE NOTICE 'Preflight ─ contact_submissions_empty_slug      : %', v_contacts_empty_slug;
  RAISE NOTICE 'Preflight ─ request_status_history rental orph  : %', v_history_rental_orphans;
  RAISE NOTICE 'Preflight ─ request_status_history quote  orph  : %', v_history_quote_orphans;
  RAISE NOTICE 'Preflight ─ admin_logs_orphan_admin_id          : %', v_admin_logs_orphans;

  -- Hard stops only for cases that would BREAK an FK we are about to add.
  -- Both backfill columns are nullable, so orphan slugs are tolerated
  -- (they end up with product_id = NULL).
  IF v_admin_logs_orphans > 0 THEN
    RAISE EXCEPTION 'admin_logs has % rows with admin_id not in profiles. '
      'Either delete those rows or set admin_id to a valid profile before re-running.',
      v_admin_logs_orphans;
  END IF;
END $$;


-- ────────────────────────────────────────────────────
-- Section A: profiles.id → auth.users.id
-- Already enforced by FK profiles_id_fkey (live verified).
-- No-op here. Documented for reference / ERD consumers.
-- ────────────────────────────────────────────────────


-- ────────────────────────────────────────────────────
-- Section B: parts.product_id → products.id
-- ────────────────────────────────────────────────────
ALTER TABLE public.parts
  ADD COLUMN IF NOT EXISTS product_id uuid;

-- Backfill via product_slug. Empty/NULL slugs leave product_id NULL.
UPDATE public.parts p
SET    product_id = pr.id
FROM   public.products pr
WHERE  pr.slug = p.product_slug
  AND  p.product_id IS NULL
  AND  COALESCE(p.product_slug,'') <> '';

-- Add FK only if not already present.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'parts_product_id_fkey'
  ) THEN
    ALTER TABLE public.parts
      ADD CONSTRAINT parts_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_parts_product_id ON public.parts(product_id);
-- Keep idx on product_slug for backward-compat queries.
CREATE INDEX IF NOT EXISTS idx_parts_product_slug ON public.parts(product_slug);


-- ────────────────────────────────────────────────────
-- Section C: contact_submissions.product_id → products.id
-- Nullable; ON DELETE SET NULL so historical inquiries survive
-- a deleted product.
-- ────────────────────────────────────────────────────
ALTER TABLE public.contact_submissions
  ADD COLUMN IF NOT EXISTS product_id uuid;

UPDATE public.contact_submissions cs
SET    product_id = pr.id
FROM   public.products pr
WHERE  pr.slug = cs.product_slug
  AND  cs.product_id IS NULL
  AND  COALESCE(cs.product_slug,'') <> '';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contact_submissions_product_id_fkey'
  ) THEN
    ALTER TABLE public.contact_submissions
      ADD CONSTRAINT contact_submissions_product_id_fkey
      FOREIGN KEY (product_id) REFERENCES public.products(id)
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_product_id ON public.contact_submissions(product_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status     ON public.contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created    ON public.contact_submissions(created_at DESC);


-- ────────────────────────────────────────────────────
-- Section D: request_status_history (polymorphic)
-- ----------------------------------------------------
-- Decision: keep polymorphic shape. Reasons:
--  * Real RLS policy depends on (request_type, request_id) lookup.
--  * RPC update_request_status() / create_*() write history with
--    a single function for both request types.
--  * Live data has 3 historical orphan rows (request_type/request_id
--    pointing at deleted requests). Splitting into two tables would
--    require either deleting those rows (audit-loss) or migrating
--    them to nullable columns. The polymorphic shape preserves them.
--
-- We harden it instead with extra indexes.
-- ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_request_status_history_changed_by
  ON public.request_status_history(changed_by_profile_id);

-- (idx_request_status_history_lookup already covers
--  (request_type, request_id, created_at).)


-- ────────────────────────────────────────────────────
-- Section E: admin_logs.admin_id → profiles.id
-- Make nullable and use ON DELETE SET NULL so deleting a
-- profile does NOT block deletion (audit row keeps its
-- snapshot of admin_name / admin_email).
-- ────────────────────────────────────────────────────
ALTER TABLE public.admin_logs
  ALTER COLUMN admin_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'admin_logs_admin_id_fkey'
  ) THEN
    ALTER TABLE public.admin_logs
      ADD CONSTRAINT admin_logs_admin_id_fkey
      FOREIGN KEY (admin_id) REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- idx_admin_logs_admin already exists on admin_id.


-- ────────────────────────────────────────────────────
-- Section F: Other small index gaps observed live
-- ────────────────────────────────────────────────────

-- product_images has FK on product_id but no index → seq scans on
-- "all images for a product" lookups.
CREATE INDEX IF NOT EXISTS idx_product_images_product_id
  ON public.product_images(product_id);

-- gallery_albums.sort_order is the primary ORDER BY in services/gallery.service.ts
CREATE INDEX IF NOT EXISTS idx_gallery_albums_sort_order
  ON public.gallery_albums(sort_order);


-- ────────────────────────────────────────────────────
-- Section G: customers / gallery_albums
-- These remain standalone tables. They are display content
-- that does not currently belong to any user, product, or
-- category. customers.category and gallery_albums.category
-- are free-form labels used for visual filtering only —
-- introducing FKs would make admin editing harder without a
-- real benefit. Documented intent only.
-- ────────────────────────────────────────────────────


-- ────────────────────────────────────────────────────
-- Section H (OPTIONAL — manual cleanup for orphan history)
-- ----------------------------------------------------
-- Live preflight reported:
--   request_status_history rental orphans : 1
--   request_status_history quote  orphans : 2
-- These reference rental_requests / purchase_quote_requests that
-- have since been deleted. They do not block any FK above (we kept
-- the polymorphic shape). If you want to remove them, uncomment:
--
-- DELETE FROM public.request_status_history h
-- WHERE (h.request_type = 'rental'
--        AND NOT EXISTS (SELECT 1 FROM public.rental_requests rr WHERE rr.id = h.request_id))
--    OR (h.request_type = 'purchase_quote'
--        AND NOT EXISTS (SELECT 1 FROM public.purchase_quote_requests pqr WHERE pqr.id = h.request_id));
-- ────────────────────────────────────────────────────


-- ────────────────────────────────────────────────────
-- Section I: Verification — emit final summary
-- ────────────────────────────────────────────────────
DO $$
DECLARE
  v_parts_with_fk     integer;
  v_contacts_with_fk  integer;
  v_admin_log_fk      integer;
BEGIN
  SELECT COUNT(*) INTO v_parts_with_fk
  FROM public.parts WHERE product_id IS NOT NULL;

  SELECT COUNT(*) INTO v_contacts_with_fk
  FROM public.contact_submissions WHERE product_id IS NOT NULL;

  SELECT COUNT(*) INTO v_admin_log_fk
  FROM pg_constraint WHERE conname = 'admin_logs_admin_id_fkey';

  RAISE NOTICE 'Post-migration ─ parts.product_id populated rows : %', v_parts_with_fk;
  RAISE NOTICE 'Post-migration ─ contact_submissions.product_id  : %', v_contacts_with_fk;
  RAISE NOTICE 'Post-migration ─ admin_logs FK present (1 = yes) : %', v_admin_log_fk;
END $$;
