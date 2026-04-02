-- Fix request approval SQL ambiguity and expand admin user editing with avatar support.

CREATE OR REPLACE FUNCTION public.get_rental_availability(
  product_id uuid,
  start_date date,
  end_date date
)
RETURNS TABLE (
  result_product_id uuid,
  result_start_date date,
  result_end_date date,
  stock_active integer,
  reserved_quantity integer,
  available_quantity integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stock_active integer;
  v_reserved integer;
BEGIN
  SELECT
    p.stock_active,
    COALESCE(SUM(ir.reserved_quantity), 0)
  INTO v_stock_active, v_reserved
  FROM public.products p
  LEFT JOIN public.inventory_reservations ir
    ON ir.product_id = p.id
   AND ir.status = 'active'
   AND (ir.start_date - COALESCE(p.buffer_before_days, 0)) <= get_rental_availability.end_date
   AND (ir.end_date + COALESCE(p.buffer_after_days, 0)) >= get_rental_availability.start_date
  WHERE p.id = get_rental_availability.product_id
  GROUP BY p.id, p.stock_active;

  IF v_stock_active IS NULL THEN
    RAISE EXCEPTION 'Product % was not found', product_id;
  END IF;

  RETURN QUERY
  SELECT
    get_rental_availability.product_id,
    get_rental_availability.start_date,
    get_rental_availability.end_date,
    v_stock_active,
    v_reserved,
    GREATEST(v_stock_active - v_reserved, 0);
END;
$$;

DROP FUNCTION IF EXISTS public.admin_update_user(uuid, text, text);
DROP FUNCTION IF EXISTS public.admin_update_user(uuid, text, text, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.admin_update_user(
  target_id uuid,
  new_name text DEFAULT NULL,
  new_phone text DEFAULT NULL,
  new_avatar_url text DEFAULT NULL,
  new_avatar_style text DEFAULT NULL,
  new_avatar_seed text DEFAULT NULL,
  new_avatar_options jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_exists boolean;
BEGIN
  IF v_actor_id IS NULL OR NOT public.is_admin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Only admins can update users.');
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM public.profiles p
    WHERE p.id = admin_update_user.target_id
  )
  INTO v_exists;

  IF NOT v_exists THEN
    RETURN jsonb_build_object('ok', false, 'error', 'User not found.');
  END IF;

  UPDATE public.profiles p
  SET
    name = CASE
      WHEN admin_update_user.new_name IS NULL THEN p.name
      ELSE NULLIF(BTRIM(admin_update_user.new_name), '')
    END,
    phone = CASE
      WHEN admin_update_user.new_phone IS NULL THEN p.phone
      ELSE NULLIF(BTRIM(admin_update_user.new_phone), '')
    END,
    avatar_url = CASE
      WHEN admin_update_user.new_avatar_url IS NULL THEN p.avatar_url
      ELSE NULLIF(BTRIM(admin_update_user.new_avatar_url), '')
    END,
    avatar_style = CASE
      WHEN admin_update_user.new_avatar_style IS NULL THEN p.avatar_style
      ELSE NULLIF(BTRIM(admin_update_user.new_avatar_style), '')
    END,
    avatar_seed = CASE
      WHEN admin_update_user.new_avatar_seed IS NULL THEN p.avatar_seed
      ELSE NULLIF(BTRIM(admin_update_user.new_avatar_seed), '')
    END,
    avatar_options = CASE
      WHEN admin_update_user.new_avatar_options IS NULL THEN p.avatar_options
      ELSE admin_update_user.new_avatar_options
    END
  WHERE p.id = admin_update_user.target_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text, text, text, text, jsonb) TO authenticated;
