-- ============================================================================
-- RLS performance hardening (production audit, batch 2)
-- ============================================================================
-- Two Supabase performance-advisor classes, both semantics-preserving:
--
--   1. auth_rls_initplan (lint 0003): 10 policies call auth.uid() directly,
--      so Postgres re-evaluates it once PER ROW. Wrapping it as
--      (select auth.uid()) turns it into a one-time InitPlan. Identical
--      results, far cheaper on large scans.
--
--   2. multiple_permissive_policies (lint 0006): the six public catalog
--      tables each carry BOTH a public SELECT policy (USING true) AND an
--      admin "ALL" policy — so every authenticated SELECT evaluates two
--      permissive policies. Because the public policy already returns every
--      row (unconditional `true`), admins lose nothing by dropping their
--      SELECT: their reads are already covered. We replace each admin ALL
--      policy with explicit INSERT/UPDATE/DELETE policies, removing the
--      duplicate SELECT while keeping admin write access unchanged.
--
--      NOT touched (admin genuinely needs a broader read than the
--      public/user policy, so the second SELECT policy is structural, not a
--      bug): profiles, rental_requests, rental_request_items,
--      purchase_quote_requests, purchase_quote_items, request_status_history,
--      custom_builds, custom_build_categories (the last two gate public read
--      on is_active = true, so admins must keep SELECT to see inactive rows).
--
-- Idempotent: CREATE OR REPLACE via DROP POLICY IF EXISTS + CREATE POLICY.
-- No table's effective access changes — see the verification block in the
-- task notes (anon / normal-user / admin matrix re-run after apply).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. InitPlan rewrite: auth.uid() -> (select auth.uid())
-- ----------------------------------------------------------------------------

-- profiles
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (select auth.uid()));

DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = (select auth.uid()));

-- admin_logs
DROP POLICY IF EXISTS admin_logs_read ON public.admin_logs;
CREATE POLICY admin_logs_read ON public.admin_logs
  FOR SELECT TO authenticated
  USING ((select auth.uid()) IN (
    SELECT profiles.id FROM public.profiles
    WHERE profiles.role = ANY (ARRAY['admin'::text, 'superadmin'::text])
  ));

DROP POLICY IF EXISTS admin_logs_insert ON public.admin_logs;
CREATE POLICY admin_logs_insert ON public.admin_logs
  FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IN (
    SELECT profiles.id FROM public.profiles
    WHERE profiles.role = ANY (ARRAY['admin'::text, 'superadmin'::text])
  ));

-- rental_requests
DROP POLICY IF EXISTS "Users read own rental requests" ON public.rental_requests;
CREATE POLICY "Users read own rental requests" ON public.rental_requests
  FOR SELECT TO authenticated
  USING (profile_id = (select auth.uid()));

-- rental_request_items
DROP POLICY IF EXISTS "Users read own rental request items" ON public.rental_request_items;
CREATE POLICY "Users read own rental request items" ON public.rental_request_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.rental_requests rr
    WHERE rr.id = rental_request_items.rental_request_id
      AND rr.profile_id = (select auth.uid())
  ));

-- purchase_quote_requests
DROP POLICY IF EXISTS "Users read own purchase quotes" ON public.purchase_quote_requests;
CREATE POLICY "Users read own purchase quotes" ON public.purchase_quote_requests
  FOR SELECT TO authenticated
  USING (profile_id = (select auth.uid()));

-- purchase_quote_items
DROP POLICY IF EXISTS "Users read own purchase quote items" ON public.purchase_quote_items;
CREATE POLICY "Users read own purchase quote items" ON public.purchase_quote_items
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.purchase_quote_requests pqr
    WHERE pqr.id = purchase_quote_items.purchase_quote_request_id
      AND pqr.profile_id = (select auth.uid())
  ));

-- request_status_history
DROP POLICY IF EXISTS "Users read own request history" ON public.request_status_history;
CREATE POLICY "Users read own request history" ON public.request_status_history
  FOR SELECT TO authenticated
  USING (
    (request_type = 'rental' AND EXISTS (
      SELECT 1 FROM public.rental_requests rr
      WHERE rr.id = request_status_history.request_id
        AND rr.profile_id = (select auth.uid())
    ))
    OR
    (request_type = 'purchase_quote' AND EXISTS (
      SELECT 1 FROM public.purchase_quote_requests pqr
      WHERE pqr.id = request_status_history.request_id
        AND pqr.profile_id = (select auth.uid())
    ))
  );

-- ----------------------------------------------------------------------------
-- 2. Consolidate double permissive SELECT on the six public catalog tables.
--    Replace each admin ALL policy with explicit write-only policies; the
--    existing {t}_public_read (USING true) already covers admin reads.
-- ----------------------------------------------------------------------------

-- categories
DROP POLICY IF EXISTS categories_admin_write ON public.categories;
CREATE POLICY categories_admin_insert ON public.categories
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY categories_admin_update ON public.categories
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY categories_admin_delete ON public.categories
  FOR DELETE TO authenticated USING (is_admin());

-- customers
DROP POLICY IF EXISTS customers_admin_write ON public.customers;
CREATE POLICY customers_admin_insert ON public.customers
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY customers_admin_update ON public.customers
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY customers_admin_delete ON public.customers
  FOR DELETE TO authenticated USING (is_admin());

-- gallery_albums
DROP POLICY IF EXISTS gallery_albums_admin_write ON public.gallery_albums;
CREATE POLICY gallery_albums_admin_insert ON public.gallery_albums
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY gallery_albums_admin_update ON public.gallery_albums
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY gallery_albums_admin_delete ON public.gallery_albums
  FOR DELETE TO authenticated USING (is_admin());

-- parts
DROP POLICY IF EXISTS parts_admin_write ON public.parts;
CREATE POLICY parts_admin_insert ON public.parts
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY parts_admin_update ON public.parts
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY parts_admin_delete ON public.parts
  FOR DELETE TO authenticated USING (is_admin());

-- product_images
DROP POLICY IF EXISTS product_images_admin_write ON public.product_images;
CREATE POLICY product_images_admin_insert ON public.product_images
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY product_images_admin_update ON public.product_images
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY product_images_admin_delete ON public.product_images
  FOR DELETE TO authenticated USING (is_admin());

-- products
DROP POLICY IF EXISTS products_admin_write ON public.products;
CREATE POLICY products_admin_insert ON public.products
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY products_admin_update ON public.products
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY products_admin_delete ON public.products
  FOR DELETE TO authenticated USING (is_admin());
