-- ====================================================
-- Bike Land - Rental Commerce + Purchase Quote System
-- Run this after the current runtime schema is in place.
-- Source of truth: current app runtime uses profiles/products/admin_logs.
-- ====================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_request_number(prefix text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  candidate text;
BEGIN
  LOOP
    candidate := upper(prefix) || '-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 8));
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM public.rental_requests WHERE request_number = candidate
      UNION ALL
      SELECT 1 FROM public.purchase_quote_requests WHERE request_number = candidate
    );
  END LOOP;

  RETURN candidate;
END;
$$;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS rental_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS sale_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS stock_total integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_active integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS minimum_rental_days integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS buffer_before_days integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS buffer_after_days integer NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_stock_total_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_total_nonnegative CHECK (stock_total >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_stock_active_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_active_nonnegative CHECK (stock_active >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_stock_active_within_total'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_stock_active_within_total CHECK (stock_active <= stock_total);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_minimum_rental_days_positive'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_minimum_rental_days_positive CHECK (minimum_rental_days >= 1);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_buffer_before_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_buffer_before_nonnegative CHECK (buffer_before_days >= 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'products_buffer_after_nonnegative'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_buffer_after_nonnegative CHECK (buffer_after_days >= 0);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.rental_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL DEFAULT public.generate_request_number('RR'),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company_name text,
  city text NOT NULL,
  address text NOT NULL,
  event_name text,
  notes text,
  admin_internal_notes text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  extra_fees numeric(12,2) NOT NULL DEFAULT 0,
  grand_total numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'confirmed', 'rejected', 'in_preparation', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rental_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_request_id uuid NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_slug text NOT NULL,
  product_title_snapshot text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  rental_start_date date NOT NULL,
  rental_end_date date NOT NULL,
  rental_days integer NOT NULL CHECK (rental_days > 0),
  unit_price numeric(12,2) NOT NULL DEFAULT 0,
  line_total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (rental_end_date >= rental_start_date)
);

CREATE TABLE IF NOT EXISTS public.purchase_quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text UNIQUE NOT NULL DEFAULT public.generate_request_number('PQ'),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company_name text,
  city text NOT NULL,
  address text NOT NULL,
  notes text,
  admin_internal_notes text,
  status text NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'contacted', 'quoted', 'won', 'lost', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.purchase_quote_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_quote_request_id uuid NOT NULL REFERENCES public.purchase_quote_requests(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_slug text NOT NULL,
  product_title_snapshot text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inventory_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  rental_request_id uuid NOT NULL REFERENCES public.rental_requests(id) ON DELETE CASCADE,
  rental_request_item_id uuid NOT NULL REFERENCES public.rental_request_items(id) ON DELETE CASCADE,
  reserved_quantity integer NOT NULL CHECK (reserved_quantity > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'released', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE TABLE IF NOT EXISTS public.request_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL CHECK (request_type IN ('rental', 'purchase_quote')),
  request_id uuid NOT NULL,
  old_status text,
  new_status text NOT NULL,
  note text,
  changed_by_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_rental_requests_profile_id ON public.rental_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_status ON public.rental_requests(status);
CREATE INDEX IF NOT EXISTS idx_rental_request_items_request_id ON public.rental_request_items(rental_request_id);
CREATE INDEX IF NOT EXISTS idx_purchase_quote_requests_profile_id ON public.purchase_quote_requests(profile_id);
CREATE INDEX IF NOT EXISTS idx_purchase_quote_requests_status ON public.purchase_quote_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_quote_items_request_id ON public.purchase_quote_items(purchase_quote_request_id);
CREATE INDEX IF NOT EXISTS idx_inventory_reservations_product_dates ON public.inventory_reservations(product_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_request_status_history_lookup ON public.request_status_history(request_type, request_id, created_at);

DROP TRIGGER IF EXISTS trg_rental_requests_updated ON public.rental_requests;
CREATE TRIGGER trg_rental_requests_updated
BEFORE UPDATE ON public.rental_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trg_purchase_quote_requests_updated ON public.purchase_quote_requests;
CREATE TRIGGER trg_purchase_quote_requests_updated
BEFORE UPDATE ON public.purchase_quote_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

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

CREATE OR REPLACE FUNCTION public.create_rental_request(payload jsonb)
RETURNS TABLE (
  id uuid,
  request_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid := auth.uid();
  v_request_id uuid;
  v_request_number text;
  v_subtotal numeric(12,2) := 0;
  v_extra_fees numeric(12,2) := COALESCE((payload->>'extra_fees')::numeric, 0);
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

CREATE OR REPLACE FUNCTION public.create_purchase_quote_request(payload jsonb)
RETURNS TABLE (
  id uuid,
  request_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_profile_id uuid := auth.uid();
  v_request_id uuid;
  v_request_number text;
  v_item jsonb;
  v_product record;
  v_quantity integer;
BEGIN
  IF v_profile_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(payload->'items') <> 'array' OR jsonb_array_length(payload->'items') = 0 THEN
    RAISE EXCEPTION 'At least one quote item is required';
  END IF;

  INSERT INTO public.purchase_quote_requests (
    profile_id,
    customer_name,
    email,
    phone,
    company_name,
    city,
    address,
    notes
  )
  VALUES (
    v_profile_id,
    NULLIF(payload->>'customer_name', ''),
    NULLIF(payload->>'email', ''),
    NULLIF(payload->>'phone', ''),
    NULLIF(payload->>'company_name', ''),
    NULLIF(payload->>'city', ''),
    NULLIF(payload->>'address', ''),
    NULLIF(payload->>'notes', '')
  )
  RETURNING purchase_quote_requests.id, purchase_quote_requests.request_number
  INTO v_request_id, v_request_number;

  FOR v_item IN SELECT value FROM jsonb_array_elements(payload->'items')
  LOOP
    v_quantity := GREATEST(COALESCE((v_item->>'quantity')::integer, 0), 1);

    SELECT p.id, p.slug, p.title, p.sale_enabled
    INTO v_product
    FROM public.products p
    WHERE p.id = (v_item->>'product_id')::uuid;

    IF v_product.id IS NULL THEN
      RAISE EXCEPTION 'Product not found for purchase quote item';
    END IF;

    IF v_product.sale_enabled IS NOT TRUE THEN
      RAISE EXCEPTION 'Product % is not available for purchase quotes', v_product.slug;
    END IF;

    INSERT INTO public.purchase_quote_items (
      purchase_quote_request_id,
      product_id,
      product_slug,
      product_title_snapshot,
      quantity
    )
    VALUES (
      v_request_id,
      v_product.id,
      v_product.slug,
      v_product.title,
      v_quantity
    );
  END LOOP;

  INSERT INTO public.request_status_history (
    request_type,
    request_id,
    new_status,
    note,
    changed_by_profile_id
  )
  VALUES ('purchase_quote', v_request_id, 'pending_review', 'Request created', v_profile_id);

  RETURN QUERY SELECT v_request_id, v_request_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_request_status(
  request_type text,
  request_id uuid,
  new_status text,
  note text DEFAULT NULL
)
RETURNS TABLE (
  ok boolean,
  result_request_id uuid,
  result_new_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_old_status text;
  v_request_number text;
BEGIN
  IF v_admin_id IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF request_type = 'rental' THEN
    SELECT status, request_number
    INTO v_old_status, v_request_number
    FROM public.rental_requests
    WHERE id = update_request_status.request_id
    FOR UPDATE;

    IF v_old_status IS NULL THEN
      RAISE EXCEPTION 'Rental request not found';
    END IF;

    UPDATE public.rental_requests
    SET status = update_request_status.new_status
    WHERE id = update_request_status.request_id;

    IF update_request_status.new_status IN ('cancelled', 'rejected') THEN
      UPDATE public.inventory_reservations
      SET status = 'cancelled'
      WHERE rental_request_id = update_request_status.request_id
        AND status = 'active';
    ELSIF update_request_status.new_status = 'completed' THEN
      UPDATE public.inventory_reservations
      SET status = 'released'
      WHERE rental_request_id = update_request_status.request_id
        AND status = 'active';
    END IF;
  ELSIF request_type = 'purchase_quote' THEN
    SELECT status, request_number
    INTO v_old_status, v_request_number
    FROM public.purchase_quote_requests
    WHERE id = update_request_status.request_id
    FOR UPDATE;

    IF v_old_status IS NULL THEN
      RAISE EXCEPTION 'Purchase quote request not found';
    END IF;

    UPDATE public.purchase_quote_requests
    SET status = update_request_status.new_status
    WHERE id = update_request_status.request_id;
  ELSE
    RAISE EXCEPTION 'Unsupported request type %', request_type;
  END IF;

  INSERT INTO public.request_status_history (
    request_type,
    request_id,
    old_status,
    new_status,
    note,
    changed_by_profile_id
  )
  VALUES (
    update_request_status.request_type,
    update_request_status.request_id,
    v_old_status,
    update_request_status.new_status,
    NULLIF(update_request_status.note, ''),
    v_admin_id
  );

  INSERT INTO public.admin_logs (
    admin_id,
    admin_name,
    admin_email,
    action,
    entity_type,
    entity_id,
    entity_name,
    details
  )
  SELECT
    p.id,
    COALESCE(p.name, 'Admin'),
    COALESCE(p.email, ''),
    'update',
    CASE WHEN update_request_status.request_type = 'rental' THEN 'rental_request' ELSE 'purchase_quote' END,
    update_request_status.request_id::text,
    COALESCE(v_request_number, update_request_status.request_id::text),
    format(
      'Status changed from %s to %s%s',
      COALESCE(v_old_status, 'unknown'),
      update_request_status.new_status,
      CASE WHEN NULLIF(update_request_status.note, '') IS NULL THEN '' ELSE ' (' || update_request_status.note || ')' END
    )
  FROM public.profiles p
  WHERE p.id = v_admin_id;

  RETURN QUERY SELECT true, update_request_status.request_id, update_request_status.new_status;
END;
$$;

CREATE OR REPLACE FUNCTION public.approve_rental_request(
  request_id uuid,
  admin_note text DEFAULT NULL
)
RETURNS TABLE (
  ok boolean,
  result_request_id uuid,
  result_request_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid := auth.uid();
  v_request record;
  v_item record;
  v_available record;
BEGIN
  IF v_admin_id IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT *
  INTO v_request
  FROM public.rental_requests
  WHERE id = approve_rental_request.request_id
  FOR UPDATE;

  IF v_request.id IS NULL THEN
    RAISE EXCEPTION 'Rental request not found';
  END IF;

  IF v_request.status <> 'pending_review' THEN
    RAISE EXCEPTION 'Only pending_review requests can be approved';
  END IF;

  FOR v_item IN
    SELECT *
    FROM public.rental_request_items
    WHERE rental_request_id = approve_rental_request.request_id
  LOOP
    SELECT *
    INTO v_available
    FROM public.get_rental_availability(v_item.product_id, v_item.rental_start_date, v_item.rental_end_date);

    IF COALESCE(v_available.available_quantity, 0) < v_item.quantity THEN
      RAISE EXCEPTION 'Not enough availability for %', v_item.product_title_snapshot;
    END IF;

    INSERT INTO public.inventory_reservations (
      product_id,
      rental_request_id,
      rental_request_item_id,
      reserved_quantity,
      start_date,
      end_date,
      status
    )
    VALUES (
      v_item.product_id,
      approve_rental_request.request_id,
      v_item.id,
      v_item.quantity,
      v_item.rental_start_date,
      v_item.rental_end_date,
      'active'
    );
  END LOOP;

  PERFORM *
  FROM public.update_request_status('rental', approve_rental_request.request_id, 'confirmed', COALESCE(approve_rental_request.admin_note, 'Approved'));

  RETURN QUERY
  SELECT true, v_request.id, v_request.request_number;
END;
$$;

ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_request_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_quote_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own rental requests" ON public.rental_requests;
CREATE POLICY "Users insert own rental requests"
  ON public.rental_requests FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users read own rental requests" ON public.rental_requests;
CREATE POLICY "Users read own rental requests"
  ON public.rental_requests FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage rental requests" ON public.rental_requests;
CREATE POLICY "Admins manage rental requests"
  ON public.rental_requests FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users read own rental request items" ON public.rental_request_items;
CREATE POLICY "Users read own rental request items"
  ON public.rental_request_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.rental_requests rr
      WHERE rr.id = rental_request_id
        AND rr.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage rental request items" ON public.rental_request_items;
CREATE POLICY "Admins manage rental request items"
  ON public.rental_request_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users insert own purchase quotes" ON public.purchase_quote_requests;
CREATE POLICY "Users insert own purchase quotes"
  ON public.purchase_quote_requests FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

DROP POLICY IF EXISTS "Users read own purchase quotes" ON public.purchase_quote_requests;
CREATE POLICY "Users read own purchase quotes"
  ON public.purchase_quote_requests FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

DROP POLICY IF EXISTS "Admins manage purchase quotes" ON public.purchase_quote_requests;
CREATE POLICY "Admins manage purchase quotes"
  ON public.purchase_quote_requests FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users read own purchase quote items" ON public.purchase_quote_items;
CREATE POLICY "Users read own purchase quote items"
  ON public.purchase_quote_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.purchase_quote_requests pqr
      WHERE pqr.id = purchase_quote_request_id
        AND pqr.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins manage purchase quote items" ON public.purchase_quote_items;
CREATE POLICY "Admins manage purchase quote items"
  ON public.purchase_quote_items FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage inventory reservations" ON public.inventory_reservations;
CREATE POLICY "Admins manage inventory reservations"
  ON public.inventory_reservations FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Users read own request history" ON public.request_status_history;
CREATE POLICY "Users read own request history"
  ON public.request_status_history FOR SELECT
  TO authenticated
  USING (
    (
      request_type = 'rental' AND EXISTS (
        SELECT 1
        FROM public.rental_requests rr
        WHERE rr.id = request_id
          AND rr.profile_id = auth.uid()
      )
    ) OR (
      request_type = 'purchase_quote' AND EXISTS (
        SELECT 1
        FROM public.purchase_quote_requests pqr
        WHERE pqr.id = request_id
          AND pqr.profile_id = auth.uid()
      )
    )
  );

DROP POLICY IF EXISTS "Admins manage request history" ON public.request_status_history;
CREATE POLICY "Admins manage request history"
  ON public.request_status_history FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
