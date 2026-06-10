-- ============================================================================
-- Prevent overbooking when approving rental requests (concurrency safety)
-- ============================================================================
-- Root cause: approve_rental_request checks availability via
-- get_rental_availability and then INSERTs into inventory_reservations, but it
-- takes no lock that serialises two concurrent approvals of the SAME product
-- over an overlapping period. Two admins (or two tabs / a double click)
-- approving at the same time can both pass the availability check before
-- either has inserted its reservation, and then both insert — pushing the
-- reserved quantity past stock_active (overbooking).
--
-- Fix: take a transaction-scoped advisory lock keyed on each product id at the
-- top of every loop iteration, BEFORE the availability check and INSERT.
-- Concurrent approvals that touch the same product now serialise on that
-- product's lock, so the second transaction sees the first one's reservation
-- when it runs get_rental_availability. Approvals for different products still
-- run in parallel. pg_advisory_xact_lock auto-releases at COMMIT/ROLLBACK.
--
-- Idempotent: CREATE OR REPLACE FUNCTION. The function body is byte-for-byte
-- identical to the definition in 20260401_rental_commerce.sql except for the
-- single added PERFORM pg_advisory_xact_lock(...) line.
-- ============================================================================

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
    -- Serialise concurrent approvals that touch the same product so the
    -- availability check below cannot race another approval's INSERT.
    PERFORM pg_advisory_xact_lock(hashtext('rental_approval:' || v_item.product_id::text));

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
