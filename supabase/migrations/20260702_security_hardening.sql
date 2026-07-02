-- ============================================================================
-- Security hardening (2026-07-02 full-site audit)
-- ============================================================================
-- Fixes the critical/medium backend findings from the audit:
--
--   1. get_all_admins() was SECURITY DEFINER with NO internal permission
--      check and executable by anon via /rest/v1/rpc/get_all_admins — any
--      visitor could enumerate admin ids/emails/names/roles. It now returns
--      rows only when public.is_admin() (same "empty result for non-admins"
--      style as get_all_users), and anon can no longer execute it at all.
--
--   2. The product-videos storage bucket allowed ANY authenticated user to
--      INSERT/UPDATE/DELETE objects. Registration is open, so any account
--      could delete or replace every product video. Writes now require
--      public.is_admin(), matching the product-images bucket. The existing
--      "Public read videos" SELECT policy is left untouched so videos keep
--      rendering for anonymous visitors.
--
--   3. create_rental_request() trusted payload->>'extra_fees'; a negative
--      value lowered grand_total below the computed subtotal. It is now
--      clamped with GREATEST(..., 0). Everything else in the function is
--      byte-for-byte the previous behavior.
--
--   4. SECURITY DEFINER RPCs kept the caller's mutable search_path (advisor
--      lint 0011). They are now pinned via ALTER FUNCTION ... SET search_path,
--      preserving bodies exactly. generate_request_number is pinned to
--      "public, extensions" because it calls gen_random_bytes() from the
--      extensions schema — pinning it to public alone would break it.
--
--   5. RPCs that require an authenticated session anyway (they check
--      auth.uid() / is_admin() / is_superadmin() internally) are no longer
--      executable by anon or PUBLIC; trigger functions are no longer
--      executable over RPC at all (triggers do not re-check EXECUTE of the
--      invoking role at fire time, so this cannot break trigger execution).
--
-- Idempotent: CREATE OR REPLACE + DROP POLICY IF EXISTS + ALTER FUNCTION.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. get_all_admins: admin-gated, pinned search_path
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_all_admins()
RETURNS TABLE(id uuid, email text, name text, role text, created_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email, p.name, p.role, p.created_at
  FROM public.profiles p
  WHERE public.is_admin()          -- non-admins (and anon-shaped sessions) get 0 rows
    AND p.role IN ('admin', 'superadmin')
  ORDER BY
    CASE p.role WHEN 'superadmin' THEN 0 ELSE 1 END,
    p.created_at ASC;
$$;

-- ----------------------------------------------------------------------------
-- 2. product-videos bucket: writes are admin-only (match product-images)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Auth users upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users update videos" ON storage.objects;
DROP POLICY IF EXISTS "Auth users delete videos" ON storage.objects;
DROP POLICY IF EXISTS "admin write product-videos" ON storage.objects;

CREATE POLICY "admin write product-videos"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'product-videos' AND public.is_admin())
WITH CHECK (bucket_id = 'product-videos' AND public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. create_rental_request: clamp client-supplied extra_fees to >= 0
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_rental_request(payload jsonb)
RETURNS TABLE(id uuid, request_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid := auth.uid();
  v_request_id uuid;
  v_request_number text;
  v_subtotal numeric(12,2) := 0;
  -- Clamp: extra_fees comes straight from the client payload; a negative
  -- value must never reduce grand_total below the computed subtotal.
  v_extra_fees numeric(12,2) := GREATEST(COALESCE((payload->>'extra_fees')::numeric, 0), 0);
  v_item jsonb;
  v_product record;
  v_quantity integer;
  v_start_date date;
  v_end_date date;
  v_days integer;
  v_line_total numeric(12,2);
BEGIN
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(payload->'items') <> 'array' OR jsonb_array_length(payload->'items') = 0 THEN
    RAISE EXCEPTION 'At least one rental item is required';
  END IF;

  INSERT INTO public.rental_requests (
    profile_id,
    customer_name,
    email,
    phone,
    company_name,
    city,
    address,
    event_name,
    notes,
    extra_fees
  )
  VALUES (
    v_profile_id,
    NULLIF(payload->>'customer_name', ''),
    NULLIF(payload->>'email', ''),
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'company_name', ''),
    NULLIF(payload->>'city', ''),
    NULLIF(payload->>'address', ''),
    NULLIF(payload->>'event_name', ''),
    NULLIF(payload->>'notes', ''),
    v_extra_fees
  )
  RETURNING rental_requests.id, rental_requests.request_number
  INTO v_request_id, v_request_number;

  FOR v_item IN SELECT value FROM jsonb_array_elements(payload->'items')
  LOOP
    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::integer, 0), 1);
    v_start_date := (v_item->>'rental_start_date')::date;
    v_end_date := (v_item->>'rental_end_date')::date;

    IF v_start_date IS NULL OR v_end_date IS NULL OR v_end_date < v_start_date THEN
      RAISE EXCEPTION 'Rental item dates are invalid';
    END IF;

    v_days := (v_end_date - v_start_date) + 1;

    SELECT
      p.id,
      p.slug,
      p.title,
      p.price,
      p.minimum_rental_days,
      p.rental_enabled
    INTO v_product
    FROM public.products p
    WHERE p.id = (v_item->>'product_id')::uuid;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'Product not found for rental item';
    END IF;

    IF v_product.rental_enabled IS NOT TRUE THEN
      RAISE EXCEPTION 'Product % is not available for rental', v_product.slug;
    END IF;

    IF v_days < COALESCE(v_product.minimum_rental_days, 1) THEN
      RAISE EXCEPTION 'Minimum rental period for % is % day(s)', v_product.slug, v_product.minimum_rental_days;
    END IF;

    v_line_total := COALESCE(v_product.price, 0) * v_quantity * v_days;
    v_subtotal := v_subtotal + v_line_total;

    INSERT INTO public.rental_request_items (
      rental_request_id,
      product_id,
      product_slug,
      product_title_snapshot,
      quantity,
      rental_start_date,
      rental_end_date,
      rental_days,
      unit_price,
      line_total
    )
    VALUES (
      v_request_id,
      v_product.id,
      v_product.slug,
      v_product.title,
      v_quantity,
      v_start_date,
      v_end_date,
      v_days,
      COALESCE(v_product.price, 0),
      v_line_total
    );
  END LOOP;

  UPDATE public.rental_requests
  SET subtotal = v_subtotal, grand_total = v_subtotal + v_extra_fees
  WHERE rental_requests.id = v_request_id;

  INSERT INTO public.request_status_history (
    request_type,
    request_id,
    new_status,
    note,
    changed_by_profile_id
  )
  VALUES ('rental', v_request_id, 'pending_review', 'Request created', v_profile_id);

  RETURN QUERY SELECT v_request_id, v_request_number;
END;
$$;

-- ----------------------------------------------------------------------------
-- 4. Pin search_path on the remaining SECURITY DEFINER functions
--    (ALTER preserves bodies/behavior exactly; advisor lint 0011)
-- ----------------------------------------------------------------------------
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_superadmin() SET search_path = public;
ALTER FUNCTION public.get_all_users() SET search_path = public;
ALTER FUNCTION public.remove_admin(uuid) SET search_path = public;
ALTER FUNCTION public.set_admin_role(uuid, text) SET search_path = public;
ALTER FUNCTION public.update_request_status(text, uuid, text, text) SET search_path = public;
ALTER FUNCTION public.approve_rental_request(uuid, text) SET search_path = public;
ALTER FUNCTION public.create_purchase_quote_request(jsonb) SET search_path = public;
-- Plain (non-definer) helpers flagged by the same lint; harmless to pin.
ALTER FUNCTION public.update_updated_at() SET search_path = public;
ALTER FUNCTION public.auth_avatar_url(jsonb) SET search_path = public;
-- Calls gen_random_bytes() from the extensions schema — must keep it visible.
ALTER FUNCTION public.generate_request_number(text) SET search_path = public, extensions;

-- ----------------------------------------------------------------------------
-- 5. Tighten EXECUTE grants
-- ----------------------------------------------------------------------------
-- NOTE: REVOKE ... FROM anon alone is NOT enough while PUBLIC still holds the
-- default EXECUTE grant (anon inherits it), so PUBLIC is revoked too and
-- authenticated/service_role are granted back explicitly.

-- Admin/user RPCs: authenticated-only (each still enforces its own admin or
-- auth.uid() check internally — this just removes the anonymous surface).
REVOKE EXECUTE ON FUNCTION public.get_all_admins() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_all_users() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text, text, text, jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.set_admin_role(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.remove_admin(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_request_status(text, uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.approve_rental_request(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_rental_request(jsonb) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.create_purchase_quote_request(jsonb) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.get_all_admins() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text, text, text, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_admin_role(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.remove_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.update_request_status(text, uuid, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.approve_rental_request(uuid, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_rental_request(jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_purchase_quote_request(jsonb) TO authenticated, service_role;

-- Trigger functions: never callable over RPC. Postgres only checks EXECUTE on
-- the trigger function when the trigger is CREATED, not when it fires, so
-- revoking here cannot break inserts/updates that fire these triggers.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_profile_from_auth_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.lock_profile_role() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_contact_rate_limit() FROM PUBLIC, anon, authenticated;

-- get_rental_availability stays callable by anon on purpose: product pages
-- show availability to visitors (see api logs). Its search_path is already
-- pinned and it only reads aggregate availability numbers.
