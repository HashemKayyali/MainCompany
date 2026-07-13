-- Eventies canonical pre-Next baseline.
--
-- Source: owner-approved schema-only production catalog capture on 2026-07-13.
-- This migration intentionally contains no application rows, auth users,
-- storage objects, credentials, or historical migration-ledger rows.

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS "public";


--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: admin_update_user("uuid", "text", "text", "text", "text", "text", "jsonb"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."admin_update_user"("target_id" "uuid", "new_name" "text" DEFAULT NULL::"text", "new_phone" "text" DEFAULT NULL::"text", "new_avatar_url" "text" DEFAULT NULL::"text", "new_avatar_style" "text" DEFAULT NULL::"text", "new_avatar_seed" "text" DEFAULT NULL::"text", "new_avatar_options" "jsonb" DEFAULT NULL::"jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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
    END
  WHERE p.id = admin_update_user.target_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;


--
-- Name: approve_rental_request("uuid", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."approve_rental_request"("request_id" "uuid", "admin_note" "text" DEFAULT NULL::"text") RETURNS TABLE("ok" boolean, "result_request_id" "uuid", "result_request_number" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


--
-- Name: auth_avatar_url("jsonb"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."auth_avatar_url"("metadata" "jsonb") RETURNS "text"
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT COALESCE(
    NULLIF(metadata->>'avatarUrl', ''),
    NULLIF(metadata->>'avatar_url', ''),
    NULLIF(metadata->>'picture', '')
  );
$$;


--
-- Name: chat_set_message_identity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."chat_set_message_identity"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_customer_id uuid;
  v_status text;
  v_recent_count bigint;
  v_daily_count bigint;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  SELECT customer_id, status
  INTO v_customer_id, v_status
  FROM public.chat_conversations
  WHERE id = NEW.conversation_id;

  IF v_customer_id IS NULL THEN
    RAISE EXCEPTION 'Conversation not found';
  END IF;

  IF v_status <> 'open' THEN
    RAISE EXCEPTION 'Conversation is resolved';
  END IF;

  NEW.sender_id := v_uid;
  NEW.body := btrim(NEW.body);

  IF NEW.body = '' OR char_length(NEW.body) > 4000 THEN
    RAISE EXCEPTION 'Message must contain between 1 and 4000 characters';
  END IF;

  IF v_customer_id = v_uid AND NOT public.is_admin() THEN
    NEW.sender_type := 'customer';
    IF NEW.kind = 'system' THEN NEW.kind := 'text'; END IF;

    SELECT count(*) INTO v_recent_count
    FROM public.chat_messages m
    WHERE m.sender_id = v_uid
      AND m.created_at > now() - interval '1 minute';

    IF v_recent_count >= 20 THEN
      RAISE EXCEPTION 'Too many chat messages. Please wait a moment before sending more.'
        USING ERRCODE = 'P0001';
    END IF;

    SELECT count(*) INTO v_daily_count
    FROM public.chat_messages m
    WHERE m.sender_id = v_uid
      AND m.created_at > now() - interval '24 hours';

    IF v_daily_count >= 500 THEN
      RAISE EXCEPTION 'Daily chat message limit reached. Please try again later.'
        USING ERRCODE = 'P0001';
    END IF;
  ELSIF public.is_superadmin() THEN
    NEW.sender_type := 'superadmin';
    IF NEW.kind = 'quick_question' THEN NEW.kind := 'text'; END IF;
    NEW.quick_question_id := NULL;
  ELSE
    RAISE EXCEPTION 'You do not have access to this conversation' USING ERRCODE = '42501';
  END IF;

  NEW.created_at := now();
  RETURN NEW;
END;
$$;


--
-- Name: chat_touch_conversation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."chat_touch_conversation"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE public.chat_conversations
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;


--
-- Name: chat_touch_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."chat_touch_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;


--
-- Name: check_contact_rate_limit(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."check_contact_rate_limit"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  -- Guard against the setting being unset OR an empty string (''::jsonb errors).
  v_headers jsonb := NULLIF(current_setting('request.headers', true), '')::jsonb;
  v_ip text := COALESCE(
    -- x-forwarded-for may be "client, proxy1, proxy2" — keep the first hop.
    NULLIF(BTRIM(split_part(v_headers->>'cf-connecting-ip', ',', 1)), ''),
    NULLIF(BTRIM(split_part(v_headers->>'x-forwarded-for', ',', 1)), ''),
    'unknown'
  );
  -- Unidentifiable callers all share the single 'unknown' bucket, so cap it
  -- hard. Identified IPs keep the original 5/hour allowance.
  v_limit integer := CASE WHEN v_ip = 'unknown' THEN 2 ELSE 5 END;
  v_count integer;
BEGIN
  -- Opportunistic cleanup so the bucket table never grows unbounded.
  DELETE FROM public.contact_rate_limit
  WHERE window_start < now() - interval '1 hour';

  INSERT INTO public.contact_rate_limit (ip)
  VALUES (v_ip)
  ON CONFLICT (ip) DO UPDATE
    SET
      count = CASE
        WHEN public.contact_rate_limit.window_start < now() - interval '1 hour'
        THEN 1
        ELSE public.contact_rate_limit.count + 1
      END,
      window_start = CASE
        WHEN public.contact_rate_limit.window_start < now() - interval '1 hour'
        THEN now()
        ELSE public.contact_rate_limit.window_start
      END
  RETURNING count INTO v_count;

  IF v_ip = 'unknown' THEN
    RAISE WARNING 'contact_submissions insert with unidentifiable client IP (bucket count=% / limit=%)', v_count, v_limit;
  END IF;

  IF v_count > v_limit THEN
    RAISE EXCEPTION 'Rate limit exceeded. Try again later.';
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: create_purchase_quote_request("jsonb"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_purchase_quote_request"("payload" "jsonb") RETURNS TABLE("id" "uuid", "request_number" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


--
-- Name: create_rental_request("jsonb"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."create_rental_request"("payload" "jsonb") RETURNS TABLE("id" "uuid", "request_number" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


--
-- Name: enqueue_notification("uuid", "text", "text", "text", "text", "text", "text", "text", "text", "text", "jsonb", "uuid", "text", boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enqueue_notification"("p_recipient_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_title_ar" "text" DEFAULT NULL::"text", "p_message_ar" "text" DEFAULT NULL::"text", "p_priority" "text" DEFAULT 'normal'::"text", "p_entity_type" "text" DEFAULT NULL::"text", "p_entity_id" "text" DEFAULT NULL::"text", "p_target_url" "text" DEFAULT NULL::"text", "p_metadata" "jsonb" DEFAULT '{}'::"jsonb", "p_created_by" "uuid" DEFAULT NULL::"uuid", "p_dedupe_key" "text" DEFAULT NULL::"text", "p_refresh_existing" boolean DEFAULT false) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_id uuid;
BEGIN
  IF p_recipient_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = p_recipient_user_id) THEN
    RETURN NULL;
  END IF;

  IF NOT public.notification_target_is_safe(p_target_url) THEN
    RAISE EXCEPTION 'Unsafe notification target URL' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.notifications (
    recipient_user_id,
    type,
    priority,
    title,
    title_ar,
    message,
    message_ar,
    entity_type,
    entity_id,
    target_url,
    metadata,
    created_by,
    dedupe_key
  )
  VALUES (
    p_recipient_user_id,
    left(btrim(p_type), 80),
    CASE WHEN p_priority = 'high' THEN 'high' ELSE 'normal' END,
    left(btrim(p_title), 180),
    NULLIF(left(btrim(p_title_ar), 180), ''),
    left(btrim(p_message), 1000),
    NULLIF(left(btrim(p_message_ar), 1000), ''),
    NULLIF(left(btrim(p_entity_type), 80), ''),
    NULLIF(left(btrim(p_entity_id), 200), ''),
    p_target_url,
    COALESCE(p_metadata, '{}'::jsonb),
    p_created_by,
    NULLIF(left(btrim(p_dedupe_key), 300), '')
  )
  ON CONFLICT (recipient_user_id, dedupe_key)
    WHERE dedupe_key IS NOT NULL
  DO UPDATE SET
    type = CASE WHEN p_refresh_existing THEN EXCLUDED.type ELSE notifications.type END,
    priority = CASE WHEN p_refresh_existing THEN EXCLUDED.priority ELSE notifications.priority END,
    title = CASE WHEN p_refresh_existing THEN EXCLUDED.title ELSE notifications.title END,
    title_ar = CASE WHEN p_refresh_existing THEN EXCLUDED.title_ar ELSE notifications.title_ar END,
    message = CASE WHEN p_refresh_existing THEN EXCLUDED.message ELSE notifications.message END,
    message_ar = CASE WHEN p_refresh_existing THEN EXCLUDED.message_ar ELSE notifications.message_ar END,
    entity_type = CASE WHEN p_refresh_existing THEN EXCLUDED.entity_type ELSE notifications.entity_type END,
    entity_id = CASE WHEN p_refresh_existing THEN EXCLUDED.entity_id ELSE notifications.entity_id END,
    target_url = CASE WHEN p_refresh_existing THEN EXCLUDED.target_url ELSE notifications.target_url END,
    metadata = CASE WHEN p_refresh_existing THEN EXCLUDED.metadata ELSE notifications.metadata END,
    read_at = CASE WHEN p_refresh_existing THEN NULL ELSE notifications.read_at END,
    created_at = CASE WHEN p_refresh_existing THEN now() ELSE notifications.created_at END
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;


--
-- Name: generate_request_number("text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."generate_request_number"("prefix" "text") RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'extensions'
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


--
-- Name: get_all_admins(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_all_admins"() RETURNS TABLE("id" "uuid", "email" "text", "name" "text", "role" "text", "created_at" timestamp with time zone)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT p.id, p.email, p.name, p.role, p.created_at
  FROM public.profiles p
  WHERE public.is_admin()          -- non-admins (and anon-shaped sessions) get 0 rows
    AND p.role IN ('admin', 'superadmin')
  ORDER BY
    CASE p.role WHEN 'superadmin' THEN 0 ELSE 1 END,
    p.created_at ASC;
$$;


--
-- Name: get_all_users(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_all_users"() RETURNS TABLE("id" "uuid", "email" "text", "name" "text", "phone" "text", "role" "text", "created_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Only admins can call this
  IF NOT public.is_admin() THEN
    RETURN;
  END IF;

  RETURN QUERY
    SELECT p.id, p.email, p.name, p.phone, p.role, p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;


--
-- Name: get_chat_unread_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_chat_unread_count"() RETURNS bigint
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_is_super boolean;
  v_count bigint;
BEGIN
  IF v_uid IS NULL THEN RETURN 0; END IF;
  v_is_super := public.is_superadmin();

  IF v_is_super THEN
    SELECT count(*) INTO v_count
    FROM public.chat_messages m
    JOIN public.chat_conversations c ON c.id = m.conversation_id
    LEFT JOIN public.chat_read_states rs
      ON rs.conversation_id = c.id AND rs.user_id = v_uid
    WHERE m.sender_type = 'customer'
      AND m.created_at > COALESCE(rs.last_read_at, '-infinity'::timestamptz);
    RETURN COALESCE(v_count, 0);
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = v_uid AND p.role = 'admin') THEN
    RETURN 0;
  END IF;

  SELECT count(*) INTO v_count
  FROM public.chat_messages m
  JOIN public.chat_conversations c ON c.id = m.conversation_id
  LEFT JOIN public.chat_read_states rs
    ON rs.conversation_id = c.id AND rs.user_id = v_uid
  WHERE c.customer_id = v_uid
    AND m.sender_type = 'superadmin'
    AND m.created_at > COALESCE(rs.last_read_at, '-infinity'::timestamptz);

  RETURN COALESCE(v_count, 0);
END;
$$;


--
-- Name: get_notification_unread_count(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_notification_unread_count"() RETURNS bigint
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN 0::bigint
    ELSE (
      SELECT count(*)::bigint
      FROM public.notifications n
      WHERE n.recipient_user_id = auth.uid()
        AND n.read_at IS NULL
    )
  END;
$$;


--
-- Name: get_or_create_chat_conversation("text", "text", "text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_or_create_chat_conversation"("p_context_type" "text" DEFAULT NULL::"text", "p_context_ref" "text" DEFAULT NULL::"text", "p_context_label" "text" DEFAULT NULL::"text", "p_context_url" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;

  IF public.is_admin() THEN
    RAISE EXCEPTION 'Staff accounts cannot start customer chats' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_id
  FROM public.chat_conversations
  WHERE customer_id = v_uid AND status = 'open'
  ORDER BY last_message_at DESC
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  BEGIN
    INSERT INTO public.chat_conversations (
      customer_id, context_type, context_ref, context_label, context_url
    ) VALUES (
      v_uid,
      NULLIF(left(btrim(p_context_type), 50), ''),
      NULLIF(left(btrim(p_context_ref), 200), ''),
      NULLIF(left(btrim(p_context_label), 300), ''),
      NULLIF(left(btrim(p_context_url), 500), '')
    ) RETURNING id INTO v_id;
  EXCEPTION WHEN unique_violation THEN
    SELECT id INTO v_id
    FROM public.chat_conversations
    WHERE customer_id = v_uid AND status = 'open'
    ORDER BY last_message_at DESC
    LIMIT 1;
  END;

  RETURN v_id;
END;
$$;


--
-- Name: get_rental_availability("uuid", "date", "date"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_rental_availability"("product_id" "uuid", "start_date" "date", "end_date" "date") RETURNS TABLE("result_product_id" "uuid", "result_start_date" "date", "result_end_date" "date", "stock_active" integer, "reserved_quantity" integer, "available_quantity" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


--
-- Name: get_superadmin_chat_inbox("text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."get_superadmin_chat_inbox"("p_status" "text" DEFAULT 'all'::"text", "p_search" "text" DEFAULT ''::"text") RETURNS TABLE("id" "uuid", "customer_id" "uuid", "customer_name" "text", "customer_email" "text", "status" "text", "context_type" "text", "context_ref" "text", "context_label" "text", "context_url" "text", "last_message_at" timestamp with time zone, "created_at" timestamp with time zone, "resolved_at" timestamp with time zone, "last_message_body" "text", "last_message_sender_type" "text", "unread_count" bigint)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT
    c.id,
    c.customer_id,
    COALESCE(p.name, ''),
    COALESCE(p.email, ''),
    c.status,
    c.context_type,
    c.context_ref,
    c.context_label,
    c.context_url,
    c.last_message_at,
    c.created_at,
    c.resolved_at,
    COALESCE(last_msg.body, ''),
    COALESCE(last_msg.sender_type, ''),
    COALESCE(unread.cnt, 0)
  FROM public.chat_conversations c
  JOIN public.profiles p ON p.id = c.customer_id
  LEFT JOIN LATERAL (
    SELECT m.body, m.sender_type
    FROM public.chat_messages m
    WHERE m.conversation_id = c.id
    ORDER BY m.created_at DESC
    LIMIT 1
  ) last_msg ON true
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS cnt
    FROM public.chat_messages m
    LEFT JOIN public.chat_read_states rs
      ON rs.conversation_id = c.id AND rs.user_id = auth.uid()
    WHERE m.conversation_id = c.id
      AND m.sender_type = 'customer'
      AND m.created_at > COALESCE(rs.last_read_at, '-infinity'::timestamptz)
  ) unread ON true
  WHERE public.is_superadmin()
    AND (COALESCE(NULLIF(p_status, ''), 'all') = 'all' OR c.status = p_status)
    AND (
      COALESCE(NULLIF(btrim(p_search), ''), '') = ''
      OR lower(COALESCE(p.name, '')) LIKE '%' || lower(btrim(p_search)) || '%'
      OR lower(COALESCE(p.email, '')) LIKE '%' || lower(btrim(p_search)) || '%'
      OR lower(COALESCE(last_msg.body, '')) LIKE '%' || lower(btrim(p_search)) || '%'
    )
  ORDER BY (COALESCE(unread.cnt, 0) > 0) DESC, c.last_message_at DESC;
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
begin
  insert into public.profiles (
    id,
    name,
    email,
    phone,
    role
  )
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'name', ''), split_part(coalesce(new.email, ''), '@', 1), 'User'),
    coalesce(new.email, ''),
    coalesce(nullif(new.raw_user_meta_data->>'phone', ''), ''),
    'user'
  )
  on conflict (id) do update set
    name = coalesce(nullif(excluded.name, ''), public.profiles.name),
    email = coalesce(nullif(excluded.email, ''), public.profiles.email),
    phone = coalesce(nullif(excluded.phone, ''), public.profiles.phone),
    role = coalesce(nullif(excluded.role, ''), public.profiles.role);

  return new;
end;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$$;


--
-- Name: is_superadmin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."is_superadmin"() RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$;


--
-- Name: lock_profile_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."lock_profile_role"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF NOT public.is_superadmin() THEN
      RAISE EXCEPTION 'Only superadmins can change roles';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: mark_all_notifications_read(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."mark_all_notifications_read"() RETURNS bigint
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_count bigint;
BEGIN
  IF auth.uid() IS NULL THEN RETURN 0; END IF;

  WITH changed AS (
    UPDATE public.notifications
    SET read_at = now()
    WHERE recipient_user_id = auth.uid()
      AND read_at IS NULL
    RETURNING 1
  )
  SELECT count(*) INTO v_count FROM changed;

  RETURN COALESCE(v_count, 0);
END;
$$;


--
-- Name: mark_chat_conversation_read("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."mark_chat_conversation_read"("p_conversation_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_customer_id uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN false; END IF;

  SELECT customer_id INTO v_customer_id
  FROM public.chat_conversations
  WHERE id = p_conversation_id;

  IF v_customer_id IS NULL THEN RETURN false; END IF;
  IF public.is_superadmin() THEN
    NULL;
  ELSIF v_customer_id = v_uid AND NOT public.is_admin() THEN
    NULL;
  ELSE
    RETURN false;
  END IF;

  INSERT INTO public.chat_read_states (conversation_id, user_id, last_read_at)
  VALUES (p_conversation_id, v_uid, now())
  ON CONFLICT (conversation_id, user_id)
  DO UPDATE SET last_read_at = EXCLUDED.last_read_at, updated_at = now();

  RETURN true;
END;
$$;


--
-- Name: mark_notification_read("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;

  UPDATE public.notifications
  SET read_at = COALESCE(read_at, now())
  WHERE id = p_notification_id
    AND recipient_user_id = auth.uid();

  RETURN FOUND;
END;
$$;


--
-- Name: notification_capture_contact_submitter(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."notification_capture_contact_submitter"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Never trust a client-supplied owner identity.
  NEW.submitter_profile_id := auth.uid();
  RETURN NEW;
END;
$$;


--
-- Name: notification_chat_message_created(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."notification_chat_message_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_conversation public.chat_conversations%ROWTYPE;
  v_sender_name text;
  v_recipient record;
BEGIN
  SELECT * INTO v_conversation
  FROM public.chat_conversations c
  WHERE c.id = NEW.conversation_id;

  IF v_conversation.id IS NULL THEN RETURN NEW; END IF;

  IF NEW.sender_type = 'customer' THEN
    SELECT COALESCE(NULLIF(p.name, ''), NULLIF(p.email, ''), 'A customer')
    INTO v_sender_name
    FROM public.profiles p
    WHERE p.id = v_conversation.customer_id;

    FOR v_recipient IN
      SELECT p.id
      FROM public.profiles p
      WHERE p.role = 'superadmin'
    LOOP
      PERFORM public.enqueue_notification(
        v_recipient.id,
        'chat_customer_message',
        'New customer message',
        format('%s sent a new chat message.', COALESCE(v_sender_name, 'A customer')),
        'رسالة جديدة من عميل',
        format('أرسل %s رسالة جديدة في المحادثة.', COALESCE(v_sender_name, 'عميل')),
        'high',
        'chat_conversation',
        NEW.conversation_id::text,
        '/admin/chats?conversation=' || NEW.conversation_id::text,
        jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id),
        NEW.sender_id,
        'chat:' || NEW.conversation_id::text || ':customer-to-super',
        true
      );
    END LOOP;
  ELSIF NEW.sender_type = 'superadmin' THEN
    PERFORM public.enqueue_notification(
      v_conversation.customer_id,
      'chat_superadmin_reply',
      'New message from Eventies',
      'You have a new reply from the Eventies team.',
      'رسالة جديدة من Eventies',
      'لديك رد جديد من فريق Eventies.',
      'normal',
      'chat_conversation',
      NEW.conversation_id::text,
      '/?supportChat=' || NEW.conversation_id::text,
      jsonb_build_object('conversation_id', NEW.conversation_id, 'message_id', NEW.id),
      NEW.sender_id,
      'chat:' || NEW.conversation_id::text || ':super-to-customer',
      true
    );
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: notification_contact_submitted(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."notification_contact_submitted"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_subject text;
  v_recipient record;
  v_submitter_role text;
BEGIN
  SELECT p.title INTO v_subject
  FROM public.products p
  WHERE p.id = NEW.product_id;

  v_subject := COALESCE(NULLIF(v_subject, ''), NULLIF(NEW.product_slug, ''), 'General inquiry');

  FOR v_recipient IN
    SELECT p.id
    FROM public.profiles p
    WHERE p.role IN ('admin', 'superadmin')
  LOOP
    PERFORM public.enqueue_notification(
      v_recipient.id,
      'new_contact_inquiry',
      'New contact inquiry',
      format('%s submitted a new contact inquiry about %s.', NEW.name, v_subject),
      'استفسار تواصل جديد',
      format('أرسل %s استفسار تواصل جديد حول %s.', NEW.name, v_subject),
      'high',
      'contact_submission',
      NEW.id::text,
      '/admin/contacts?submission=' || NEW.id::text,
      jsonb_build_object('contact_name', NEW.name, 'subject', v_subject),
      NULL,
      'contact:' || NEW.id::text || ':created:admin',
      false
    );
  END LOOP;

  IF NEW.submitter_profile_id IS NOT NULL THEN
    SELECT p.role INTO v_submitter_role
    FROM public.profiles p
    WHERE p.id = NEW.submitter_profile_id;

    IF COALESCE(v_submitter_role, 'user') NOT IN ('admin', 'superadmin') THEN
      PERFORM public.enqueue_notification(
        NEW.submitter_profile_id,
        'contact_submitted',
        'Inquiry received',
        'Your contact inquiry has been submitted successfully.',
        'تم استلام استفسارك',
        'تم إرسال استفسار التواصل الخاص بك بنجاح.',
        'normal',
        'contact_submission',
        NEW.id::text,
        '/contact',
        jsonb_build_object('subject', v_subject),
        NULL,
        'contact:' || NEW.id::text || ':created:client',
        false
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: notification_purchase_quote_created(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."notification_purchase_quote_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_item_count bigint;
  v_recipient record;
BEGIN
  SELECT count(*)::bigint
  INTO v_item_count
  FROM public.purchase_quote_items i
  WHERE i.purchase_quote_request_id = NEW.id;

  PERFORM public.enqueue_notification(
    NEW.profile_id,
    'quote_submitted',
    'Quote request received',
    format('Your quote request %s has been submitted successfully.', NEW.request_number),
    'تم استلام طلب عرض السعر',
    format('تم إرسال طلب عرض السعر %s بنجاح.', NEW.request_number),
    'normal',
    'purchase_quote',
    NEW.id::text,
    '/my-requests/' || NEW.request_number,
    jsonb_build_object('request_number', NEW.request_number, 'item_count', v_item_count),
    NULL,
    'quote:' || NEW.id::text || ':submitted:client',
    false
  );

  FOR v_recipient IN
    SELECT p.id
    FROM public.profiles p
    WHERE p.role IN ('admin', 'superadmin')
  LOOP
    PERFORM public.enqueue_notification(
      v_recipient.id,
      'new_purchase_quote_request',
      'New purchase quote request',
      format('A customer requested a quote for %s product%s.',
        v_item_count,
        CASE WHEN v_item_count = 1 THEN '' ELSE 's' END),
      'طلب عرض سعر جديد',
      format('طلب عميل عرض سعر لـ %s منتج.', v_item_count),
      'high',
      'purchase_quote',
      NEW.id::text,
      '/admin/requests/purchase_quote/' || NEW.id::text,
      jsonb_build_object('request_number', NEW.request_number, 'item_count', v_item_count),
      NULL,
      'quote:' || NEW.id::text || ':submitted:admin',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$;


--
-- Name: notification_purchase_quote_status_changed(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."notification_purchase_quote_status_changed"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_title text;
  v_title_ar text;
  v_message text;
  v_message_ar text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;

  CASE NEW.status
    WHEN 'contacted' THEN
      v_title := 'Your request is being reviewed';
      v_title_ar := 'طلبك قيد المراجعة';
      v_message := format('The Eventies team has started reviewing and following up on your request %s.', NEW.request_number);
      v_message_ar := format('بدأ فريق Eventies بمراجعة ومتابعة طلبك %s.', NEW.request_number);
    WHEN 'quoted' THEN
      v_title := 'Your quote is ready';
      v_title_ar := 'عرض السعر الخاص بك جاهز';
      v_message := 'Your request has been quoted. Our team will contact you.';
      v_message_ar := 'تم تجهيز عرض السعر لطلبك. سيتواصل معك فريقنا.';
    WHEN 'won' THEN
      v_title := 'Your request has been confirmed';
      v_title_ar := 'تم تأكيد طلبك';
      v_message := format('Your quote request %s has been confirmed and is moving forward.', NEW.request_number);
      v_message_ar := format('تم تأكيد طلب عرض السعر %s وسيتم استكمال الإجراءات.', NEW.request_number);
    WHEN 'lost' THEN
      v_title := 'Request closed';
      v_title_ar := 'تم إغلاق الطلب';
      v_message := format('Your quote request %s has been closed.', NEW.request_number);
      v_message_ar := format('تم إغلاق طلب عرض السعر %s.', NEW.request_number);
    WHEN 'rejected' THEN
      v_title := 'Quote request not approved';
      v_title_ar := 'لم تتم الموافقة على طلب عرض السعر';
      v_message := format('Your quote request %s could not be approved.', NEW.request_number);
      v_message_ar := format('تعذر قبول طلب عرض السعر %s.', NEW.request_number);
    ELSE
      RETURN NEW;
  END CASE;

  PERFORM public.enqueue_notification(
    NEW.profile_id,
    'quote_status_' || NEW.status,
    v_title,
    v_message,
    v_title_ar,
    v_message_ar,
    'normal',
    'purchase_quote',
    NEW.id::text,
    '/my-requests/' || NEW.request_number,
    jsonb_build_object('request_number', NEW.request_number, 'status', NEW.status),
    NULL,
    'quote:' || NEW.id::text || ':status:' || NEW.status,
    false
  );

  RETURN NEW;
END;
$$;


--
-- Name: notification_rental_created(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."notification_rental_created"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_item_count bigint;
  v_recipient record;
BEGIN
  SELECT count(*)::bigint
  INTO v_item_count
  FROM public.rental_request_items i
  WHERE i.rental_request_id = NEW.id;

  PERFORM public.enqueue_notification(
    NEW.profile_id,
    'rental_submitted',
    'Request received',
    format('Your rental request %s has been submitted successfully.', NEW.request_number),
    'تم استلام الطلب',
    format('تم إرسال طلب التأجير %s بنجاح.', NEW.request_number),
    'normal',
    'rental_request',
    NEW.id::text,
    '/my-requests/' || NEW.request_number,
    jsonb_build_object('request_number', NEW.request_number, 'item_count', v_item_count),
    NULL,
    'rental:' || NEW.id::text || ':submitted:client',
    false
  );

  FOR v_recipient IN
    SELECT p.id
    FROM public.profiles p
    WHERE p.role IN ('admin', 'superadmin')
  LOOP
    PERFORM public.enqueue_notification(
      v_recipient.id,
      'new_rental_request',
      'New rental request',
      format('A customer submitted rental request %s with %s item%s.',
        NEW.request_number,
        v_item_count,
        CASE WHEN v_item_count = 1 THEN '' ELSE 's' END),
      'طلب تأجير جديد',
      format('تم إرسال طلب التأجير %s ويحتوي على %s عنصر.', NEW.request_number, v_item_count),
      'high',
      'rental_request',
      NEW.id::text,
      '/admin/requests/rental/' || NEW.id::text,
      jsonb_build_object('request_number', NEW.request_number, 'item_count', v_item_count),
      NULL,
      'rental:' || NEW.id::text || ':submitted:admin',
      false
    );
  END LOOP;

  RETURN NEW;
END;
$$;


--
-- Name: notification_rental_status_changed(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."notification_rental_status_changed"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_title text;
  v_title_ar text;
  v_message text;
  v_message_ar text;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN RETURN NEW; END IF;

  CASE NEW.status
    WHEN 'confirmed' THEN
      v_title := 'Rental request confirmed';
      v_title_ar := 'تم تأكيد طلب التأجير';
      v_message := format('Your rental request %s has been confirmed.', NEW.request_number);
      v_message_ar := format('تم تأكيد طلب التأجير %s.', NEW.request_number);
    WHEN 'rejected' THEN
      v_title := 'Rental request not approved';
      v_title_ar := 'لم تتم الموافقة على طلب التأجير';
      v_message := format('Your rental request %s was not approved.', NEW.request_number);
      v_message_ar := format('لم تتم الموافقة على طلب التأجير %s.', NEW.request_number);
    WHEN 'in_preparation' THEN
      v_title := 'Your request is being prepared';
      v_title_ar := 'طلبك قيد التجهيز';
      v_message := format('We started preparing your rental request %s.', NEW.request_number);
      v_message_ar := format('بدأنا بتجهيز طلب التأجير %s.', NEW.request_number);
    WHEN 'completed' THEN
      v_title := 'Request completed';
      v_title_ar := 'اكتمل الطلب';
      v_message := format('Your rental request %s has been completed.', NEW.request_number);
      v_message_ar := format('تم إكمال طلب التأجير %s.', NEW.request_number);
    WHEN 'cancelled' THEN
      v_title := 'Request cancelled';
      v_title_ar := 'تم إلغاء الطلب';
      v_message := format('Your rental request %s was cancelled.', NEW.request_number);
      v_message_ar := format('تم إلغاء طلب التأجير %s.', NEW.request_number);
    ELSE
      RETURN NEW;
  END CASE;

  PERFORM public.enqueue_notification(
    NEW.profile_id,
    'rental_status_' || NEW.status,
    v_title,
    v_message,
    v_title_ar,
    v_message_ar,
    'normal',
    'rental_request',
    NEW.id::text,
    '/my-requests/' || NEW.request_number,
    jsonb_build_object('request_number', NEW.request_number, 'status', NEW.status),
    NULL,
    'rental:' || NEW.id::text || ':status:' || NEW.status,
    false
  );

  RETURN NEW;
END;
$$;


--
-- Name: notification_target_is_safe("text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."notification_target_is_safe"("p_target_url" "text") RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    SET "search_path" TO 'public'
    AS $$
  SELECT
    p_target_url IS NULL
    OR (
      char_length(p_target_url) BETWEEN 1 AND 500
      AND left(p_target_url, 1) = '/'
      AND left(p_target_url, 2) <> '//'
      AND position(chr(10) in p_target_url) = 0
      AND position(chr(13) in p_target_url) = 0
      AND position(chr(9) in p_target_url) = 0
    );
$$;


--
-- Name: preview_notification_audience(boolean, boolean, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."preview_notification_audience"("p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean) RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_clients bigint;
  v_admins bigint;
  v_superadmins bigint;
  v_total bigint;
BEGIN
  IF NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Super Admin access required' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) FILTER (WHERE COALESCE(p.role, 'user') NOT IN ('admin', 'superadmin')),
         count(*) FILTER (WHERE p.role = 'admin'),
         count(*) FILTER (WHERE p.role = 'superadmin')
  INTO v_clients, v_admins, v_superadmins
  FROM public.profiles p;

  SELECT count(*) INTO v_total
  FROM public.profiles p
  WHERE (p_clients AND COALESCE(p.role, 'user') NOT IN ('admin', 'superadmin'))
     OR (p_admins AND p.role = 'admin')
     OR (p_superadmins AND p.role = 'superadmin');

  RETURN jsonb_build_object(
    'clients', CASE WHEN p_clients THEN v_clients ELSE 0 END,
    'admins', CASE WHEN p_admins THEN v_admins ELSE 0 END,
    'superadmins', CASE WHEN p_superadmins THEN v_superadmins ELSE 0 END,
    'total', v_total
  );
END;
$$;


--
-- Name: remove_admin("uuid"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."remove_admin"("target_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  caller_role text;
  target_role text;
BEGIN
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

  IF caller_role != 'superadmin' THEN
    RETURN json_build_object('ok', false, 'error', 'Only superadmins can remove admins');
  END IF;

  IF target_id = auth.uid() THEN
    RETURN json_build_object('ok', false, 'error', 'Cannot remove yourself');
  END IF;

  SELECT role INTO target_role FROM public.profiles WHERE id = target_id;

  IF target_role IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'User not found');
  END IF;

  -- ⛔ PROTECT superadmins
  IF target_role = 'superadmin' THEN
    RETURN json_build_object('ok', false, 'error', 'Cannot remove a superadmin. Change from Supabase dashboard only.');
  END IF;

  UPDATE public.profiles SET role = 'user' WHERE id = target_id;
  RETURN json_build_object('ok', true);
END;
$$;


--
-- Name: send_custom_notification("text", "text", boolean, boolean, boolean, "text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."send_custom_notification"("p_title" "text", "p_message" "text", "p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean, "p_target_url" "text" DEFAULT NULL::"text", "p_type" "text" DEFAULT 'custom'::"text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_actor_name text;
  v_actor_email text;
  v_broadcast_id uuid := gen_random_uuid();
  v_count bigint;
BEGIN
  IF v_actor_id IS NULL OR NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'Super Admin access required' USING ERRCODE = '42501';
  END IF;

  IF btrim(COALESCE(p_title, '')) = '' OR char_length(btrim(p_title)) > 180 THEN
    RAISE EXCEPTION 'Title is required and must be 180 characters or fewer' USING ERRCODE = '22023';
  END IF;

  IF btrim(COALESCE(p_message, '')) = '' OR char_length(btrim(p_message)) > 1000 THEN
    RAISE EXCEPTION 'Message is required and must be 1000 characters or fewer' USING ERRCODE = '22023';
  END IF;

  IF NOT COALESCE(p_clients, false)
     AND NOT COALESCE(p_admins, false)
     AND NOT COALESCE(p_superadmins, false) THEN
    RAISE EXCEPTION 'Select at least one audience' USING ERRCODE = '22023';
  END IF;

  IF NOT public.notification_target_is_safe(NULLIF(btrim(p_target_url), '')) THEN
    RAISE EXCEPTION 'Target URL must be a safe internal path' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.notifications (
    recipient_user_id,
    type,
    title,
    message,
    target_url,
    metadata,
    created_by,
    dedupe_key
  )
  SELECT
    p.id,
    left(COALESCE(NULLIF(btrim(p_type), ''), 'custom'), 80),
    left(btrim(p_title), 180),
    left(btrim(p_message), 1000),
    NULLIF(btrim(p_target_url), ''),
    jsonb_build_object(
      'broadcast_id', v_broadcast_id,
      'audience', jsonb_build_object(
        'clients', p_clients,
        'admins', p_admins,
        'superadmins', p_superadmins
      )
    ),
    v_actor_id,
    'broadcast:' || v_broadcast_id::text
  FROM public.profiles p
  WHERE (p_clients AND COALESCE(p.role, 'user') NOT IN ('admin', 'superadmin'))
     OR (p_admins AND p.role = 'admin')
     OR (p_superadmins AND p.role = 'superadmin');

  GET DIAGNOSTICS v_count = ROW_COUNT;

  SELECT COALESCE(p.name, 'Super Admin'), COALESCE(p.email, '')
  INTO v_actor_name, v_actor_email
  FROM public.profiles p
  WHERE p.id = v_actor_id;

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
  VALUES (
    v_actor_id,
    COALESCE(v_actor_name, 'Super Admin'),
    COALESCE(v_actor_email, ''),
    'create',
    'notification_broadcast',
    v_broadcast_id::text,
    left(btrim(p_title), 180),
    format('Custom notification broadcast sent to %s recipient(s).', v_count)
  );

  RETURN jsonb_build_object(
    'ok', true,
    'broadcast_id', v_broadcast_id,
    'recipient_count', v_count
  );
END;
$$;


--
-- Name: set_admin_role("uuid", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."set_admin_role"("target_id" "uuid", "new_role" "text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  caller_role text;
  target_role text;
BEGIN
  IF new_role NOT IN ('admin', 'superadmin') THEN
    RETURN json_build_object('ok', false, 'error', 'Invalid role');
  END IF;

  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();

  IF caller_role != 'superadmin' THEN
    RETURN json_build_object('ok', false, 'error', 'Only superadmins can manage roles');
  END IF;

  SELECT role INTO target_role FROM public.profiles WHERE id = target_id;

  IF target_role IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'User not found');
  END IF;

  -- ⛔ PROTECT superadmins
  IF target_role = 'superadmin' THEN
    RETURN json_build_object('ok', false, 'error', 'Cannot change a superadmin role. Change from Supabase dashboard only.');
  END IF;

  UPDATE public.profiles SET role = new_role WHERE id = target_id;
  RETURN json_build_object('ok', true);
END;
$$;


--
-- Name: set_chat_conversation_status("uuid", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."set_chat_conversation_status"("p_conversation_id" "uuid", "p_status" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NOT public.is_superadmin() THEN
    RETURN false;
  END IF;
  IF p_status NOT IN ('open', 'resolved') THEN
    RETURN false;
  END IF;

  UPDATE public.chat_conversations
  SET status = p_status,
      resolved_at = CASE WHEN p_status = 'resolved' THEN now() ELSE NULL END,
      resolved_by = CASE WHEN p_status = 'resolved' THEN auth.uid() ELSE NULL END,
      updated_at = now()
  WHERE id = p_conversation_id;

  RETURN FOUND;
END;
$$;


--
-- Name: sync_profile_from_auth_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."sync_profile_from_auth_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'auth'
    AS $$
begin
  update public.profiles
  set
    name = coalesce(nullif(new.raw_user_meta_data->>'name', ''), public.profiles.name),
    email = coalesce(nullif(new.email, ''), public.profiles.email),
    phone = coalesce(nullif(new.raw_user_meta_data->>'phone', ''), public.profiles.phone)
  where public.profiles.id = new.id;

  return new;
end;
$$;


--
-- Name: update_request_status("text", "uuid", "text", "text"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."update_request_status"("request_type" "text", "request_id" "uuid", "new_status" "text", "note" "text" DEFAULT NULL::"text") RETURNS TABLE("ok" boolean, "result_request_id" "uuid", "result_new_status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
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


--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."admin_logs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "admin_id" "uuid",
    "admin_name" "text" DEFAULT ''::"text" NOT NULL,
    "admin_email" "text" DEFAULT ''::"text" NOT NULL,
    "action" "text" NOT NULL,
    "entity_type" "text" DEFAULT ''::"text" NOT NULL,
    "entity_id" "text" DEFAULT ''::"text" NOT NULL,
    "entity_name" "text" DEFAULT ''::"text" NOT NULL,
    "details" "text" DEFAULT ''::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_logs_action_check" CHECK (("action" = ANY (ARRAY['create'::"text", 'update'::"text", 'delete'::"text"])))
);


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "icon" "text" DEFAULT ''::"text",
    "description" "text" DEFAULT ''::"text",
    "image" "text" DEFAULT ''::"text"
);


--
-- Name: chat_conversations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_conversations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'open'::"text" NOT NULL,
    "context_type" "text",
    "context_ref" "text",
    "context_label" "text",
    "context_url" "text",
    "last_message_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resolved_at" timestamp with time zone,
    "resolved_by" "uuid",
    CONSTRAINT "chat_conversations_context_label_check" CHECK ((("context_label" IS NULL) OR ("char_length"("context_label") <= 300))),
    CONSTRAINT "chat_conversations_context_ref_check" CHECK ((("context_ref" IS NULL) OR ("char_length"("context_ref") <= 200))),
    CONSTRAINT "chat_conversations_context_type_check" CHECK ((("context_type" IS NULL) OR ("char_length"("context_type") <= 50))),
    CONSTRAINT "chat_conversations_context_url_check" CHECK ((("context_url" IS NULL) OR ("char_length"("context_url") <= 500))),
    CONSTRAINT "chat_conversations_status_check" CHECK (("status" = ANY (ARRAY['open'::"text", 'resolved'::"text"])))
);


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "conversation_id" "uuid" NOT NULL,
    "sender_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "sender_type" "text" NOT NULL,
    "kind" "text" DEFAULT 'text'::"text" NOT NULL,
    "quick_question_id" "text",
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chat_messages_body_check" CHECK ((("char_length"("body") >= 1) AND ("char_length"("body") <= 4000))),
    CONSTRAINT "chat_messages_kind_check" CHECK (("kind" = ANY (ARRAY['text'::"text", 'quick_question'::"text", 'system'::"text"]))),
    CONSTRAINT "chat_messages_sender_type_check" CHECK (("sender_type" = ANY (ARRAY['customer'::"text", 'superadmin'::"text"])))
);


--
-- Name: chat_quick_questions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_quick_questions" (
    "id" "text" NOT NULL,
    "text_en" "text" NOT NULL,
    "text_ar" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: chat_read_states; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."chat_read_states" (
    "conversation_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "last_read_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: contact_rate_limit; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."contact_rate_limit" (
    "ip" "text" NOT NULL,
    "count" integer DEFAULT 1 NOT NULL,
    "window_start" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."contact_submissions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" DEFAULT ''::"text",
    "product_slug" "text" DEFAULT ''::"text",
    "city" "text" DEFAULT ''::"text",
    "address" "text" DEFAULT ''::"text",
    "message" "text" DEFAULT ''::"text",
    "status" "text" DEFAULT 'new'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "product_id" "uuid",
    "submitter_profile_id" "uuid",
    CONSTRAINT "contact_email_format" CHECK (("email" ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'::"text")),
    CONSTRAINT "contact_email_length" CHECK ((("char_length"("email") >= 3) AND ("char_length"("email") <= 254))),
    CONSTRAINT "contact_message_length" CHECK ((("message" IS NULL) OR ("char_length"("message") <= 2000))),
    CONSTRAINT "contact_name_length" CHECK ((("char_length"("name") >= 1) AND ("char_length"("name") <= 100))),
    CONSTRAINT "contact_phone_length" CHECK ((("phone" IS NULL) OR ("char_length"("phone") <= 20))),
    CONSTRAINT "contact_submissions_address_len" CHECK ((("address" IS NULL) OR ("length"("address") <= 400))),
    CONSTRAINT "contact_submissions_city_len" CHECK ((("city" IS NULL) OR ("length"("city") <= 120))),
    CONSTRAINT "contact_submissions_product_slug_len" CHECK ((("product_slug" IS NULL) OR ("length"("product_slug") <= 200))),
    CONSTRAINT "contact_submissions_status_check" CHECK (("status" = ANY (ARRAY['new'::"text", 'contacted'::"text", 'booked'::"text", 'archived'::"text"])))
);


--
-- Name: custom_build_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."custom_build_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "custom_build_categories_name_length" CHECK ((("char_length"("btrim"("name")) >= 1) AND ("char_length"("btrim"("name")) <= 80)))
);


--
-- Name: custom_builds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."custom_builds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL,
    "image_url" "text" DEFAULT ''::"text" NOT NULL,
    "category" "text" DEFAULT ''::"text" NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "images" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    CONSTRAINT "custom_builds_category_length" CHECK (("char_length"("category") <= 80)),
    CONSTRAINT "custom_builds_description_length" CHECK (("char_length"("description") <= 800)),
    CONSTRAINT "custom_builds_image_url_length" CHECK (("char_length"("image_url") <= 2000)),
    CONSTRAINT "custom_builds_images_limit" CHECK ((("array_length"("images", 1) IS NULL) OR ("array_length"("images", 1) <= 24))),
    CONSTRAINT "custom_builds_images_total_length" CHECK (("char_length"("array_to_string"("images", ''::"text")) <= 48000)),
    CONSTRAINT "custom_builds_title_length" CHECK ((("char_length"("btrim"("title")) >= 1) AND ("char_length"("btrim"("title")) <= 140)))
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."customers" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "slug" "text",
    "category" "text" DEFAULT ''::"text"
);


--
-- Name: gallery_albums; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."gallery_albums" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "slug" "text" NOT NULL,
    "title" "text" NOT NULL,
    "cover" "text" DEFAULT ''::"text",
    "images" "text"[] DEFAULT '{}'::"text"[],
    "category" "text" DEFAULT ''::"text",
    "sort_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


--
-- Name: inventory_reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."inventory_reservations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "rental_request_id" "uuid" NOT NULL,
    "rental_request_item_id" "uuid" NOT NULL,
    "reserved_quantity" integer NOT NULL,
    "start_date" "date" NOT NULL,
    "end_date" "date" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "inventory_reservations_check" CHECK (("end_date" >= "start_date")),
    CONSTRAINT "inventory_reservations_reserved_quantity_check" CHECK (("reserved_quantity" > 0)),
    CONSTRAINT "inventory_reservations_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'released'::"text", 'cancelled'::"text"])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "recipient_user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "priority" "text" DEFAULT 'normal'::"text" NOT NULL,
    "title" "text" NOT NULL,
    "title_ar" "text",
    "message" "text" NOT NULL,
    "message_ar" "text",
    "entity_type" "text",
    "entity_id" "text",
    "target_url" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid",
    "dedupe_key" "text",
    CONSTRAINT "notifications_dedupe_key_check" CHECK ((("dedupe_key" IS NULL) OR ("char_length"("dedupe_key") <= 300))),
    CONSTRAINT "notifications_entity_id_check" CHECK ((("entity_id" IS NULL) OR ("char_length"("entity_id") <= 200))),
    CONSTRAINT "notifications_entity_type_check" CHECK ((("entity_type" IS NULL) OR ("char_length"("entity_type") <= 80))),
    CONSTRAINT "notifications_message_ar_check" CHECK ((("message_ar" IS NULL) OR (("char_length"("message_ar") >= 1) AND ("char_length"("message_ar") <= 1000)))),
    CONSTRAINT "notifications_message_check" CHECK ((("char_length"("message") >= 1) AND ("char_length"("message") <= 1000))),
    CONSTRAINT "notifications_priority_check" CHECK (("priority" = ANY (ARRAY['normal'::"text", 'high'::"text"]))),
    CONSTRAINT "notifications_target_url_check" CHECK ((("target_url" IS NULL) OR ("char_length"("target_url") <= 500))),
    CONSTRAINT "notifications_title_ar_check" CHECK ((("title_ar" IS NULL) OR (("char_length"("title_ar") >= 1) AND ("char_length"("title_ar") <= 180)))),
    CONSTRAINT "notifications_title_check" CHECK ((("char_length"("title") >= 1) AND ("char_length"("title") <= 180))),
    CONSTRAINT "notifications_type_check" CHECK ((("char_length"("type") >= 1) AND ("char_length"("type") <= 80)))
);


--
-- Name: parts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."parts" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "price" numeric,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "product_slug" "text" DEFAULT ''::"text",
    "currency" "text" DEFAULT 'JOD'::"text",
    "image" "text" DEFAULT ''::"text",
    "in_stock" boolean DEFAULT true,
    "product_id" "uuid"
);


--
-- Name: product_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."product_images" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "url" "text" NOT NULL,
    "is_cover" boolean DEFAULT false NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."products" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "price" numeric,
    "category_id" "uuid",
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "badge" "text" DEFAULT ''::"text",
    "badge_color" "text" DEFAULT 'from-violet-500 to-pink-500'::"text",
    "category_tags" "text"[] DEFAULT '{}'::"text"[],
    "short_description" "text" DEFAULT ''::"text",
    "featured" boolean DEFAULT false,
    "hero_image" "text" DEFAULT ''::"text",
    "gallery" "text"[] DEFAULT '{}'::"text"[],
    "quick_options" "jsonb" DEFAULT '[]'::"jsonb",
    "notes" "text"[] DEFAULT '{}'::"text"[],
    "features_left" "text"[] DEFAULT '{}'::"text"[],
    "features_right" "text"[] DEFAULT '{}'::"text"[],
    "currency" "text" DEFAULT 'JOD'::"text",
    "show_price" boolean DEFAULT true NOT NULL,
    "video_url" "text",
    "rental_enabled" boolean DEFAULT true NOT NULL,
    "sale_enabled" boolean DEFAULT true NOT NULL,
    "stock_total" integer DEFAULT 0 NOT NULL,
    "stock_active" integer DEFAULT 0 NOT NULL,
    "minimum_rental_days" integer DEFAULT 1 NOT NULL,
    "buffer_before_days" integer DEFAULT 0 NOT NULL,
    "buffer_after_days" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "products_buffer_after_nonnegative" CHECK (("buffer_after_days" >= 0)),
    CONSTRAINT "products_buffer_before_nonnegative" CHECK (("buffer_before_days" >= 0)),
    CONSTRAINT "products_minimum_rental_days_positive" CHECK (("minimum_rental_days" >= 1)),
    CONSTRAINT "products_stock_active_nonnegative" CHECK (("stock_active" >= 0)),
    CONSTRAINT "products_stock_active_within_total" CHECK (("stock_active" <= "stock_total")),
    CONSTRAINT "products_stock_total_nonnegative" CHECK (("stock_total" >= 0))
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."profiles" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" DEFAULT ''::"text",
    "phone" "text" DEFAULT ''::"text",
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text", 'superadmin'::"text"])))
);


--
-- Name: purchase_quote_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."purchase_quote_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "purchase_quote_request_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_slug" "text" NOT NULL,
    "product_title_snapshot" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "purchase_quote_items_quantity_check" CHECK (("quantity" > 0))
);


--
-- Name: purchase_quote_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."purchase_quote_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_number" "text" DEFAULT "public"."generate_request_number"('PQ'::"text") NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "customer_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "company_name" "text",
    "city" "text" NOT NULL,
    "address" "text" NOT NULL,
    "notes" "text",
    "admin_internal_notes" "text",
    "status" "text" DEFAULT 'pending_review'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "purchase_quote_requests_status_check" CHECK (("status" = ANY (ARRAY['pending_review'::"text", 'contacted'::"text", 'quoted'::"text", 'won'::"text", 'lost'::"text", 'rejected'::"text"])))
);


--
-- Name: rental_request_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."rental_request_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rental_request_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_slug" "text" NOT NULL,
    "product_title_snapshot" "text" NOT NULL,
    "quantity" integer NOT NULL,
    "rental_start_date" "date" NOT NULL,
    "rental_end_date" "date" NOT NULL,
    "rental_days" integer NOT NULL,
    "unit_price" numeric(12,2) DEFAULT 0 NOT NULL,
    "line_total" numeric(12,2) DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "rental_request_items_check" CHECK (("rental_end_date" >= "rental_start_date")),
    CONSTRAINT "rental_request_items_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "rental_request_items_rental_days_check" CHECK (("rental_days" > 0))
);


--
-- Name: rental_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."rental_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_number" "text" DEFAULT "public"."generate_request_number"('RR'::"text") NOT NULL,
    "profile_id" "uuid" NOT NULL,
    "customer_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "company_name" "text",
    "city" "text" NOT NULL,
    "address" "text" NOT NULL,
    "event_name" "text",
    "notes" "text",
    "admin_internal_notes" "text",
    "subtotal" numeric(12,2) DEFAULT 0 NOT NULL,
    "extra_fees" numeric(12,2) DEFAULT 0 NOT NULL,
    "grand_total" numeric(12,2) DEFAULT 0 NOT NULL,
    "status" "text" DEFAULT 'pending_review'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "rental_requests_status_check" CHECK (("status" = ANY (ARRAY['pending_review'::"text", 'confirmed'::"text", 'rejected'::"text", 'in_preparation'::"text", 'completed'::"text", 'cancelled'::"text"])))
);


--
-- Name: request_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."request_status_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "request_type" "text" NOT NULL,
    "request_id" "uuid" NOT NULL,
    "old_status" "text",
    "new_status" "text" NOT NULL,
    "note" "text",
    "changed_by_profile_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "request_status_history_request_type_check" CHECK (("request_type" = ANY (ARRAY['rental'::"text", 'purchase_quote'::"text"])))
);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."admin_logs"
    ADD CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id");


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");


--
-- Name: chat_conversations chat_conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_conversations"
    ADD CONSTRAINT "chat_conversations_pkey" PRIMARY KEY ("id");


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");


--
-- Name: chat_quick_questions chat_quick_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_quick_questions"
    ADD CONSTRAINT "chat_quick_questions_pkey" PRIMARY KEY ("id");


--
-- Name: chat_read_states chat_read_states_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_read_states"
    ADD CONSTRAINT "chat_read_states_pkey" PRIMARY KEY ("conversation_id", "user_id");


--
-- Name: contact_rate_limit contact_rate_limit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."contact_rate_limit"
    ADD CONSTRAINT "contact_rate_limit_pkey" PRIMARY KEY ("ip");


--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."contact_submissions"
    ADD CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id");


--
-- Name: custom_build_categories custom_build_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."custom_build_categories"
    ADD CONSTRAINT "custom_build_categories_pkey" PRIMARY KEY ("id");


--
-- Name: custom_builds custom_builds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."custom_builds"
    ADD CONSTRAINT "custom_builds_pkey" PRIMARY KEY ("id");


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_pkey" PRIMARY KEY ("id");


--
-- Name: customers customers_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."customers"
    ADD CONSTRAINT "customers_slug_key" UNIQUE ("slug");


--
-- Name: gallery_albums gallery_albums_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."gallery_albums"
    ADD CONSTRAINT "gallery_albums_pkey" PRIMARY KEY ("id");


--
-- Name: gallery_albums gallery_albums_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."gallery_albums"
    ADD CONSTRAINT "gallery_albums_slug_key" UNIQUE ("slug");


--
-- Name: inventory_reservations inventory_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."inventory_reservations"
    ADD CONSTRAINT "inventory_reservations_pkey" PRIMARY KEY ("id");


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");


--
-- Name: parts parts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_pkey" PRIMARY KEY ("id");


--
-- Name: parts parts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_slug_key" UNIQUE ("slug");


--
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_pkey" PRIMARY KEY ("id");


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");


--
-- Name: products products_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_slug_key" UNIQUE ("slug");


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");


--
-- Name: purchase_quote_items purchase_quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."purchase_quote_items"
    ADD CONSTRAINT "purchase_quote_items_pkey" PRIMARY KEY ("id");


--
-- Name: purchase_quote_requests purchase_quote_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."purchase_quote_requests"
    ADD CONSTRAINT "purchase_quote_requests_pkey" PRIMARY KEY ("id");


--
-- Name: purchase_quote_requests purchase_quote_requests_request_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."purchase_quote_requests"
    ADD CONSTRAINT "purchase_quote_requests_request_number_key" UNIQUE ("request_number");


--
-- Name: rental_request_items rental_request_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."rental_request_items"
    ADD CONSTRAINT "rental_request_items_pkey" PRIMARY KEY ("id");


--
-- Name: rental_requests rental_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."rental_requests"
    ADD CONSTRAINT "rental_requests_pkey" PRIMARY KEY ("id");


--
-- Name: rental_requests rental_requests_request_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."rental_requests"
    ADD CONSTRAINT "rental_requests_request_number_key" UNIQUE ("request_number");


--
-- Name: request_status_history request_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."request_status_history"
    ADD CONSTRAINT "request_status_history_pkey" PRIMARY KEY ("id");


--
-- Name: chat_conversations_last_message_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_conversations_last_message_idx" ON "public"."chat_conversations" USING "btree" ("last_message_at" DESC);


--
-- Name: chat_conversations_one_open_per_customer_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "chat_conversations_one_open_per_customer_idx" ON "public"."chat_conversations" USING "btree" ("customer_id") WHERE ("status" = 'open'::"text");


--
-- Name: chat_conversations_status_last_message_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_conversations_status_last_message_idx" ON "public"."chat_conversations" USING "btree" ("status", "last_message_at" DESC);


--
-- Name: chat_messages_conversation_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_conversation_created_idx" ON "public"."chat_messages" USING "btree" ("conversation_id", "created_at" DESC);


--
-- Name: chat_messages_sender_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_messages_sender_created_idx" ON "public"."chat_messages" USING "btree" ("sender_id", "created_at" DESC);


--
-- Name: chat_read_states_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "chat_read_states_user_idx" ON "public"."chat_read_states" USING "btree" ("user_id", "last_read_at" DESC);


--
-- Name: contact_submissions_submitter_profile_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "contact_submissions_submitter_profile_idx" ON "public"."contact_submissions" USING "btree" ("submitter_profile_id") WHERE ("submitter_profile_id" IS NOT NULL);


--
-- Name: idx_admin_logs_admin; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_admin_logs_admin" ON "public"."admin_logs" USING "btree" ("admin_id");


--
-- Name: idx_admin_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_admin_logs_created" ON "public"."admin_logs" USING "btree" ("created_at" DESC);


--
-- Name: idx_admin_logs_entity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_admin_logs_entity" ON "public"."admin_logs" USING "btree" ("entity_type");


--
-- Name: idx_contact_submissions_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_contact_submissions_created" ON "public"."contact_submissions" USING "btree" ("created_at" DESC);


--
-- Name: idx_contact_submissions_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_contact_submissions_product_id" ON "public"."contact_submissions" USING "btree" ("product_id");


--
-- Name: idx_contact_submissions_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_contact_submissions_status" ON "public"."contact_submissions" USING "btree" ("status");


--
-- Name: idx_custom_build_categories_name_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "idx_custom_build_categories_name_unique" ON "public"."custom_build_categories" USING "btree" ("lower"("btrim"("name")));


--
-- Name: idx_custom_build_categories_public_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_custom_build_categories_public_order" ON "public"."custom_build_categories" USING "btree" ("is_active", "sort_order", "name");


--
-- Name: idx_custom_builds_featured; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_custom_builds_featured" ON "public"."custom_builds" USING "btree" ("is_featured") WHERE ("is_active" = true);


--
-- Name: idx_custom_builds_public_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_custom_builds_public_order" ON "public"."custom_builds" USING "btree" ("is_active", "sort_order", "created_at" DESC);


--
-- Name: idx_gallery_albums_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_gallery_albums_category" ON "public"."gallery_albums" USING "btree" ("category");


--
-- Name: idx_gallery_albums_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_gallery_albums_slug" ON "public"."gallery_albums" USING "btree" ("slug");


--
-- Name: idx_gallery_albums_sort_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_gallery_albums_sort_order" ON "public"."gallery_albums" USING "btree" ("sort_order");


--
-- Name: idx_inventory_reservations_product_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_inventory_reservations_product_dates" ON "public"."inventory_reservations" USING "btree" ("product_id", "start_date", "end_date");


--
-- Name: idx_inventory_reservations_rental_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_inventory_reservations_rental_request_id" ON "public"."inventory_reservations" USING "btree" ("rental_request_id");


--
-- Name: idx_inventory_reservations_rental_request_item_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_inventory_reservations_rental_request_item_id" ON "public"."inventory_reservations" USING "btree" ("rental_request_item_id");


--
-- Name: idx_parts_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_parts_product_id" ON "public"."parts" USING "btree" ("product_id");


--
-- Name: idx_parts_product_slug; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_parts_product_slug" ON "public"."parts" USING "btree" ("product_slug");


--
-- Name: idx_product_images_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_product_images_product_id" ON "public"."product_images" USING "btree" ("product_id");


--
-- Name: idx_products_category_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_products_category_id" ON "public"."products" USING "btree" ("category_id");


--
-- Name: idx_purchase_quote_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_purchase_quote_items_product_id" ON "public"."purchase_quote_items" USING "btree" ("product_id");


--
-- Name: idx_purchase_quote_items_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_purchase_quote_items_request_id" ON "public"."purchase_quote_items" USING "btree" ("purchase_quote_request_id");


--
-- Name: idx_purchase_quote_requests_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_purchase_quote_requests_profile_id" ON "public"."purchase_quote_requests" USING "btree" ("profile_id");


--
-- Name: idx_purchase_quote_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_purchase_quote_requests_status" ON "public"."purchase_quote_requests" USING "btree" ("status");


--
-- Name: idx_rental_request_items_product_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_rental_request_items_product_id" ON "public"."rental_request_items" USING "btree" ("product_id");


--
-- Name: idx_rental_request_items_request_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_rental_request_items_request_id" ON "public"."rental_request_items" USING "btree" ("rental_request_id");


--
-- Name: idx_rental_requests_profile_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_rental_requests_profile_id" ON "public"."rental_requests" USING "btree" ("profile_id");


--
-- Name: idx_rental_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_rental_requests_status" ON "public"."rental_requests" USING "btree" ("status");


--
-- Name: idx_request_status_history_changed_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_request_status_history_changed_by" ON "public"."request_status_history" USING "btree" ("changed_by_profile_id");


--
-- Name: idx_request_status_history_lookup; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx_request_status_history_lookup" ON "public"."request_status_history" USING "btree" ("request_type", "request_id", "created_at");


--
-- Name: notifications_recipient_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_recipient_created_idx" ON "public"."notifications" USING "btree" ("recipient_user_id", "created_at" DESC);


--
-- Name: notifications_recipient_dedupe_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "notifications_recipient_dedupe_idx" ON "public"."notifications" USING "btree" ("recipient_user_id", "dedupe_key") WHERE ("dedupe_key" IS NOT NULL);


--
-- Name: notifications_recipient_unread_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "notifications_recipient_unread_idx" ON "public"."notifications" USING "btree" ("recipient_user_id", "created_at" DESC) WHERE ("read_at" IS NULL);


--
-- Name: chat_conversations chat_conversations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "chat_conversations_updated_at" BEFORE UPDATE ON "public"."chat_conversations" FOR EACH ROW EXECUTE FUNCTION "public"."chat_touch_updated_at"();


--
-- Name: chat_messages chat_message_identity_before_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "chat_message_identity_before_insert" BEFORE INSERT ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."chat_set_message_identity"();


--
-- Name: chat_quick_questions chat_quick_questions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "chat_quick_questions_updated_at" BEFORE UPDATE ON "public"."chat_quick_questions" FOR EACH ROW EXECUTE FUNCTION "public"."chat_touch_updated_at"();


--
-- Name: chat_read_states chat_read_states_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "chat_read_states_updated_at" BEFORE UPDATE ON "public"."chat_read_states" FOR EACH ROW EXECUTE FUNCTION "public"."chat_touch_updated_at"();


--
-- Name: chat_messages chat_touch_conversation_after_message; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "chat_touch_conversation_after_message" AFTER INSERT ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."chat_touch_conversation"();


--
-- Name: contact_submissions check_contact_rate_limit; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "check_contact_rate_limit" BEFORE INSERT ON "public"."contact_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."check_contact_rate_limit"();


--
-- Name: profiles lock_profile_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "lock_profile_role" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."lock_profile_role"();


--
-- Name: contact_submissions notification_capture_contact_submitter_before_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "notification_capture_contact_submitter_before_insert" BEFORE INSERT ON "public"."contact_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."notification_capture_contact_submitter"();


--
-- Name: chat_messages notification_chat_message_created_after_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "notification_chat_message_created_after_insert" AFTER INSERT ON "public"."chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."notification_chat_message_created"();


--
-- Name: contact_submissions notification_contact_submitted_after_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "notification_contact_submitted_after_insert" AFTER INSERT ON "public"."contact_submissions" FOR EACH ROW EXECUTE FUNCTION "public"."notification_contact_submitted"();


--
-- Name: purchase_quote_requests notification_purchase_quote_created_deferred; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER "notification_purchase_quote_created_deferred" AFTER INSERT ON "public"."purchase_quote_requests" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION "public"."notification_purchase_quote_created"();


--
-- Name: purchase_quote_requests notification_purchase_quote_status_changed_after_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "notification_purchase_quote_status_changed_after_update" AFTER UPDATE OF "status" ON "public"."purchase_quote_requests" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."notification_purchase_quote_status_changed"();


--
-- Name: rental_requests notification_rental_created_deferred; Type: TRIGGER; Schema: public; Owner: -
--

CREATE CONSTRAINT TRIGGER "notification_rental_created_deferred" AFTER INSERT ON "public"."rental_requests" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION "public"."notification_rental_created"();


--
-- Name: rental_requests notification_rental_status_changed_after_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "notification_rental_status_changed_after_update" AFTER UPDATE OF "status" ON "public"."rental_requests" FOR EACH ROW WHEN (("old"."status" IS DISTINCT FROM "new"."status")) EXECUTE FUNCTION "public"."notification_rental_status_changed"();


--
-- Name: custom_build_categories trg_custom_build_categories_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "trg_custom_build_categories_updated" BEFORE UPDATE ON "public"."custom_build_categories" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: custom_builds trg_custom_builds_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "trg_custom_builds_updated" BEFORE UPDATE ON "public"."custom_builds" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: gallery_albums trg_gallery_albums_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "trg_gallery_albums_updated" BEFORE UPDATE ON "public"."gallery_albums" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: purchase_quote_requests trg_purchase_quote_requests_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "trg_purchase_quote_requests_updated" BEFORE UPDATE ON "public"."purchase_quote_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: rental_requests trg_rental_requests_updated; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "trg_rental_requests_updated" BEFORE UPDATE ON "public"."rental_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."admin_logs"
    ADD CONSTRAINT "admin_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;


--
-- Name: chat_conversations chat_conversations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_conversations"
    ADD CONSTRAINT "chat_conversations_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: chat_conversations chat_conversations_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_conversations"
    ADD CONSTRAINT "chat_conversations_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE CASCADE;


--
-- Name: chat_messages chat_messages_quick_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_quick_question_id_fkey" FOREIGN KEY ("quick_question_id") REFERENCES "public"."chat_quick_questions"("id") ON DELETE SET NULL;


--
-- Name: chat_messages chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE RESTRICT;


--
-- Name: chat_read_states chat_read_states_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_read_states"
    ADD CONSTRAINT "chat_read_states_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE CASCADE;


--
-- Name: chat_read_states chat_read_states_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."chat_read_states"
    ADD CONSTRAINT "chat_read_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: contact_submissions contact_submissions_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."contact_submissions"
    ADD CONSTRAINT "contact_submissions_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE SET NULL;


--
-- Name: contact_submissions contact_submissions_submitter_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."contact_submissions"
    ADD CONSTRAINT "contact_submissions_submitter_profile_id_fkey" FOREIGN KEY ("submitter_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;


--
-- Name: inventory_reservations inventory_reservations_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."inventory_reservations"
    ADD CONSTRAINT "inventory_reservations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;


--
-- Name: inventory_reservations inventory_reservations_rental_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."inventory_reservations"
    ADD CONSTRAINT "inventory_reservations_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "public"."rental_requests"("id") ON DELETE CASCADE;


--
-- Name: inventory_reservations inventory_reservations_rental_request_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."inventory_reservations"
    ADD CONSTRAINT "inventory_reservations_rental_request_item_id_fkey" FOREIGN KEY ("rental_request_item_id") REFERENCES "public"."rental_request_items"("id") ON DELETE CASCADE;


--
-- Name: notifications notifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;


--
-- Name: notifications notifications_recipient_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: parts parts_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."parts"
    ADD CONSTRAINT "parts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;


--
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."product_images"
    ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;


--
-- Name: profiles profiles_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: purchase_quote_items purchase_quote_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."purchase_quote_items"
    ADD CONSTRAINT "purchase_quote_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;


--
-- Name: purchase_quote_items purchase_quote_items_purchase_quote_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."purchase_quote_items"
    ADD CONSTRAINT "purchase_quote_items_purchase_quote_request_id_fkey" FOREIGN KEY ("purchase_quote_request_id") REFERENCES "public"."purchase_quote_requests"("id") ON DELETE CASCADE;


--
-- Name: purchase_quote_requests purchase_quote_requests_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."purchase_quote_requests"
    ADD CONSTRAINT "purchase_quote_requests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: rental_request_items rental_request_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."rental_request_items"
    ADD CONSTRAINT "rental_request_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;


--
-- Name: rental_request_items rental_request_items_rental_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."rental_request_items"
    ADD CONSTRAINT "rental_request_items_rental_request_id_fkey" FOREIGN KEY ("rental_request_id") REFERENCES "public"."rental_requests"("id") ON DELETE CASCADE;


--
-- Name: rental_requests rental_requests_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."rental_requests"
    ADD CONSTRAINT "rental_requests_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;


--
-- Name: request_status_history request_status_history_changed_by_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."request_status_history"
    ADD CONSTRAINT "request_status_history_changed_by_profile_id_fkey" FOREIGN KEY ("changed_by_profile_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;


--
-- Name: profiles Admins can read all profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can read all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."is_admin"());


--
-- Name: custom_build_categories Admins manage custom build categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage custom build categories" ON "public"."custom_build_categories" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: custom_builds Admins manage custom builds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage custom builds" ON "public"."custom_builds" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: inventory_reservations Admins manage inventory reservations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage inventory reservations" ON "public"."inventory_reservations" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: purchase_quote_items Admins manage purchase quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage purchase quote items" ON "public"."purchase_quote_items" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: purchase_quote_requests Admins manage purchase quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage purchase quotes" ON "public"."purchase_quote_requests" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: rental_request_items Admins manage rental request items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage rental request items" ON "public"."rental_request_items" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: rental_requests Admins manage rental requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage rental requests" ON "public"."rental_requests" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: request_status_history Admins manage request history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins manage request history" ON "public"."request_status_history" TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: custom_build_categories Anyone can read active custom build categories; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read active custom build categories" ON "public"."custom_build_categories" FOR SELECT USING (("is_active" = true));


--
-- Name: custom_builds Anyone can read active custom builds; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can read active custom builds" ON "public"."custom_builds" FOR SELECT USING (("is_active" = true));


--
-- Name: profiles Superadmins can insert profiles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Superadmins can insert profiles" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_superadmin"());


--
-- Name: profiles Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));


--
-- Name: purchase_quote_items Users read own purchase quote items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own purchase quote items" ON "public"."purchase_quote_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."purchase_quote_requests" "pqr"
  WHERE (("pqr"."id" = "purchase_quote_items"."purchase_quote_request_id") AND ("pqr"."profile_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: purchase_quote_requests Users read own purchase quotes; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own purchase quotes" ON "public"."purchase_quote_requests" FOR SELECT TO "authenticated" USING (("profile_id" = ( SELECT "auth"."uid"() AS "uid")));


--
-- Name: rental_request_items Users read own rental request items; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own rental request items" ON "public"."rental_request_items" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."rental_requests" "rr"
  WHERE (("rr"."id" = "rental_request_items"."rental_request_id") AND ("rr"."profile_id" = ( SELECT "auth"."uid"() AS "uid"))))));


--
-- Name: rental_requests Users read own rental requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own rental requests" ON "public"."rental_requests" FOR SELECT TO "authenticated" USING (("profile_id" = ( SELECT "auth"."uid"() AS "uid")));


--
-- Name: request_status_history Users read own request history; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users read own request history" ON "public"."request_status_history" FOR SELECT TO "authenticated" USING (((("request_type" = 'rental'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."rental_requests" "rr"
  WHERE (("rr"."id" = "request_status_history"."request_id") AND ("rr"."profile_id" = ( SELECT "auth"."uid"() AS "uid")))))) OR (("request_type" = 'purchase_quote'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."purchase_quote_requests" "pqr"
  WHERE (("pqr"."id" = "request_status_history"."request_id") AND ("pqr"."profile_id" = ( SELECT "auth"."uid"() AS "uid"))))))));


--
-- Name: admin_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."admin_logs" ENABLE ROW LEVEL SECURITY;

--
-- Name: admin_logs admin_logs_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_logs_insert" ON "public"."admin_logs" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'superadmin'::"text"])))));


--
-- Name: admin_logs admin_logs_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "admin_logs_read" ON "public"."admin_logs" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") IN ( SELECT "profiles"."id"
   FROM "public"."profiles"
  WHERE ("profiles"."role" = ANY (ARRAY['admin'::"text", 'superadmin'::"text"])))));


--
-- Name: categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;

--
-- Name: categories categories_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "categories_admin_delete" ON "public"."categories" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: categories categories_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "categories_admin_insert" ON "public"."categories" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: categories categories_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "categories_admin_update" ON "public"."categories" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: categories categories_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "categories_public_read" ON "public"."categories" FOR SELECT TO "authenticated", "anon" USING (true);


--
-- Name: chat_conversations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."chat_conversations" ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_conversations chat_conversations_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "chat_conversations_select" ON "public"."chat_conversations" FOR SELECT TO "authenticated" USING (("public"."is_superadmin"() OR (("customer_id" = ( SELECT "auth"."uid"() AS "uid")) AND (NOT "public"."is_admin"()))));


--
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_messages chat_messages_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "chat_messages_insert" ON "public"."chat_messages" FOR INSERT TO "authenticated" WITH CHECK ((("sender_id" = ( SELECT "auth"."uid"() AS "uid")) AND ((("sender_type" = 'customer'::"text") AND (NOT "public"."is_admin"()) AND (EXISTS ( SELECT 1
   FROM "public"."chat_conversations" "c"
  WHERE (("c"."id" = "chat_messages"."conversation_id") AND ("c"."customer_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("c"."status" = 'open'::"text"))))) OR (("sender_type" = 'superadmin'::"text") AND "public"."is_superadmin"()))));


--
-- Name: chat_messages chat_messages_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "chat_messages_select" ON "public"."chat_messages" FOR SELECT TO "authenticated" USING (("public"."is_superadmin"() OR ((NOT "public"."is_admin"()) AND (EXISTS ( SELECT 1
   FROM "public"."chat_conversations" "c"
  WHERE (("c"."id" = "chat_messages"."conversation_id") AND ("c"."customer_id" = ( SELECT "auth"."uid"() AS "uid"))))))));


--
-- Name: chat_quick_questions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."chat_quick_questions" ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_quick_questions chat_quick_questions_anon_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "chat_quick_questions_anon_select" ON "public"."chat_quick_questions" FOR SELECT TO "anon" USING (("is_active" = true));


--
-- Name: chat_quick_questions chat_quick_questions_authenticated_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "chat_quick_questions_authenticated_select" ON "public"."chat_quick_questions" FOR SELECT TO "authenticated" USING ((("is_active" = true) OR "public"."is_superadmin"()));


--
-- Name: chat_read_states; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."chat_read_states" ENABLE ROW LEVEL SECURITY;

--
-- Name: chat_read_states chat_read_states_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "chat_read_states_insert" ON "public"."chat_read_states" FOR INSERT TO "authenticated" WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("public"."is_superadmin"() OR ((NOT "public"."is_admin"()) AND (EXISTS ( SELECT 1
   FROM "public"."chat_conversations" "c"
  WHERE (("c"."id" = "chat_read_states"."conversation_id") AND ("c"."customer_id" = ( SELECT "auth"."uid"() AS "uid")))))))));


--
-- Name: chat_read_states chat_read_states_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "chat_read_states_select" ON "public"."chat_read_states" FOR SELECT TO "authenticated" USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("public"."is_superadmin"() OR ((NOT "public"."is_admin"()) AND (EXISTS ( SELECT 1
   FROM "public"."chat_conversations" "c"
  WHERE (("c"."id" = "chat_read_states"."conversation_id") AND ("c"."customer_id" = ( SELECT "auth"."uid"() AS "uid")))))))));


--
-- Name: chat_read_states chat_read_states_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "chat_read_states_update" ON "public"."chat_read_states" FOR UPDATE TO "authenticated" USING ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("public"."is_superadmin"() OR ((NOT "public"."is_admin"()) AND (EXISTS ( SELECT 1
   FROM "public"."chat_conversations" "c"
  WHERE (("c"."id" = "chat_read_states"."conversation_id") AND ("c"."customer_id" = ( SELECT "auth"."uid"() AS "uid"))))))))) WITH CHECK ((("user_id" = ( SELECT "auth"."uid"() AS "uid")) AND ("public"."is_superadmin"() OR ((NOT "public"."is_admin"()) AND (EXISTS ( SELECT 1
   FROM "public"."chat_conversations" "c"
  WHERE (("c"."id" = "chat_read_states"."conversation_id") AND ("c"."customer_id" = ( SELECT "auth"."uid"() AS "uid")))))))));


--
-- Name: contact_rate_limit; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."contact_rate_limit" ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."contact_submissions" ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_submissions contacts_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "contacts_admin_delete" ON "public"."contact_submissions" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: contact_submissions contacts_admin_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "contacts_admin_read" ON "public"."contact_submissions" FOR SELECT TO "authenticated" USING ("public"."is_admin"());


--
-- Name: contact_submissions contacts_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "contacts_admin_update" ON "public"."contact_submissions" FOR UPDATE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: contact_submissions contacts_public_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "contacts_public_insert" ON "public"."contact_submissions" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);


--
-- Name: custom_build_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."custom_build_categories" ENABLE ROW LEVEL SECURITY;

--
-- Name: custom_builds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."custom_builds" ENABLE ROW LEVEL SECURITY;

--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."customers" ENABLE ROW LEVEL SECURITY;

--
-- Name: customers customers_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "customers_admin_delete" ON "public"."customers" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: customers customers_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "customers_admin_insert" ON "public"."customers" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: customers customers_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "customers_admin_update" ON "public"."customers" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: customers customers_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "customers_public_read" ON "public"."customers" FOR SELECT TO "authenticated", "anon" USING (true);


--
-- Name: gallery_albums; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."gallery_albums" ENABLE ROW LEVEL SECURITY;

--
-- Name: gallery_albums gallery_albums_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "gallery_albums_admin_delete" ON "public"."gallery_albums" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: gallery_albums gallery_albums_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "gallery_albums_admin_insert" ON "public"."gallery_albums" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: gallery_albums gallery_albums_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "gallery_albums_admin_update" ON "public"."gallery_albums" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: gallery_albums gallery_albums_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "gallery_albums_public_read" ON "public"."gallery_albums" FOR SELECT TO "authenticated", "anon" USING (true);


--
-- Name: inventory_reservations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."inventory_reservations" ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_select_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "notifications_select_own" ON "public"."notifications" FOR SELECT TO "authenticated" USING (("recipient_user_id" = ( SELECT "auth"."uid"() AS "uid")));


--
-- Name: parts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."parts" ENABLE ROW LEVEL SECURITY;

--
-- Name: parts parts_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "parts_admin_delete" ON "public"."parts" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: parts parts_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "parts_admin_insert" ON "public"."parts" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: parts parts_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "parts_admin_update" ON "public"."parts" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: parts parts_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "parts_public_read" ON "public"."parts" FOR SELECT TO "authenticated", "anon" USING (true);


--
-- Name: product_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."product_images" ENABLE ROW LEVEL SECURITY;

--
-- Name: product_images product_images_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "product_images_admin_delete" ON "public"."product_images" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: product_images product_images_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "product_images_admin_insert" ON "public"."product_images" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: product_images product_images_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "product_images_admin_update" ON "public"."product_images" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: product_images product_images_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "product_images_public_read" ON "public"."product_images" FOR SELECT TO "authenticated", "anon" USING (true);


--
-- Name: products; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

--
-- Name: products products_admin_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "products_admin_delete" ON "public"."products" FOR DELETE TO "authenticated" USING ("public"."is_admin"());


--
-- Name: products products_admin_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "products_admin_insert" ON "public"."products" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_admin"());


--
-- Name: products products_admin_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "products_admin_update" ON "public"."products" FOR UPDATE TO "authenticated" USING ("public"."is_admin"()) WITH CHECK ("public"."is_admin"());


--
-- Name: products products_public_read; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "products_public_read" ON "public"."products" FOR SELECT TO "authenticated", "anon" USING (true);


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_read_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles_read_own" ON "public"."profiles" FOR SELECT TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid")));


--
-- Name: profiles profiles_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "profiles_update_own" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("id" = ( SELECT "auth"."uid"() AS "uid"))) WITH CHECK (("id" = ( SELECT "auth"."uid"() AS "uid")));


--
-- Name: purchase_quote_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."purchase_quote_items" ENABLE ROW LEVEL SECURITY;

--
-- Name: purchase_quote_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."purchase_quote_requests" ENABLE ROW LEVEL SECURITY;

--
-- Name: rental_request_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."rental_request_items" ENABLE ROW LEVEL SECURITY;

--
-- Name: rental_requests; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."rental_requests" ENABLE ROW LEVEL SECURITY;

--
-- Name: request_status_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE "public"."request_status_history" ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "admin_update_user"("target_id" "uuid", "new_name" "text", "new_phone" "text", "new_avatar_url" "text", "new_avatar_style" "text", "new_avatar_seed" "text", "new_avatar_options" "jsonb"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."admin_update_user"("target_id" "uuid", "new_name" "text", "new_phone" "text", "new_avatar_url" "text", "new_avatar_style" "text", "new_avatar_seed" "text", "new_avatar_options" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."admin_update_user"("target_id" "uuid", "new_name" "text", "new_phone" "text", "new_avatar_url" "text", "new_avatar_style" "text", "new_avatar_seed" "text", "new_avatar_options" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_user"("target_id" "uuid", "new_name" "text", "new_phone" "text", "new_avatar_url" "text", "new_avatar_style" "text", "new_avatar_seed" "text", "new_avatar_options" "jsonb") TO "service_role";


--
-- Name: FUNCTION "approve_rental_request"("request_id" "uuid", "admin_note" "text"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."approve_rental_request"("request_id" "uuid", "admin_note" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."approve_rental_request"("request_id" "uuid", "admin_note" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."approve_rental_request"("request_id" "uuid", "admin_note" "text") TO "service_role";


--
-- Name: FUNCTION "auth_avatar_url"("metadata" "jsonb"); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION "public"."auth_avatar_url"("metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."auth_avatar_url"("metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."auth_avatar_url"("metadata" "jsonb") TO "service_role";


--
-- Name: FUNCTION "chat_set_message_identity"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."chat_set_message_identity"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."chat_set_message_identity"() TO "service_role";


--
-- Name: FUNCTION "chat_touch_conversation"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."chat_touch_conversation"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."chat_touch_conversation"() TO "service_role";


--
-- Name: FUNCTION "chat_touch_updated_at"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."chat_touch_updated_at"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."chat_touch_updated_at"() TO "service_role";


--
-- Name: FUNCTION "check_contact_rate_limit"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."check_contact_rate_limit"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."check_contact_rate_limit"() TO "service_role";


--
-- Name: FUNCTION "create_purchase_quote_request"("payload" "jsonb"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."create_purchase_quote_request"("payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_purchase_quote_request"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_purchase_quote_request"("payload" "jsonb") TO "service_role";


--
-- Name: FUNCTION "create_rental_request"("payload" "jsonb"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."create_rental_request"("payload" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."create_rental_request"("payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_rental_request"("payload" "jsonb") TO "service_role";


--
-- Name: FUNCTION "enqueue_notification"("p_recipient_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_title_ar" "text", "p_message_ar" "text", "p_priority" "text", "p_entity_type" "text", "p_entity_id" "text", "p_target_url" "text", "p_metadata" "jsonb", "p_created_by" "uuid", "p_dedupe_key" "text", "p_refresh_existing" boolean); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."enqueue_notification"("p_recipient_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_title_ar" "text", "p_message_ar" "text", "p_priority" "text", "p_entity_type" "text", "p_entity_id" "text", "p_target_url" "text", "p_metadata" "jsonb", "p_created_by" "uuid", "p_dedupe_key" "text", "p_refresh_existing" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."enqueue_notification"("p_recipient_user_id" "uuid", "p_type" "text", "p_title" "text", "p_message" "text", "p_title_ar" "text", "p_message_ar" "text", "p_priority" "text", "p_entity_type" "text", "p_entity_id" "text", "p_target_url" "text", "p_metadata" "jsonb", "p_created_by" "uuid", "p_dedupe_key" "text", "p_refresh_existing" boolean) TO "service_role";


--
-- Name: FUNCTION "generate_request_number"("prefix" "text"); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION "public"."generate_request_number"("prefix" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_request_number"("prefix" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_request_number"("prefix" "text") TO "service_role";


--
-- Name: FUNCTION "get_all_admins"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."get_all_admins"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_all_admins"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_admins"() TO "service_role";


--
-- Name: FUNCTION "get_all_users"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."get_all_users"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_all_users"() TO "service_role";


--
-- Name: FUNCTION "get_chat_unread_count"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."get_chat_unread_count"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_chat_unread_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_chat_unread_count"() TO "service_role";


--
-- Name: FUNCTION "get_notification_unread_count"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."get_notification_unread_count"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_notification_unread_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_notification_unread_count"() TO "service_role";


--
-- Name: FUNCTION "get_or_create_chat_conversation"("p_context_type" "text", "p_context_ref" "text", "p_context_label" "text", "p_context_url" "text"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."get_or_create_chat_conversation"("p_context_type" "text", "p_context_ref" "text", "p_context_label" "text", "p_context_url" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_or_create_chat_conversation"("p_context_type" "text", "p_context_ref" "text", "p_context_label" "text", "p_context_url" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_chat_conversation"("p_context_type" "text", "p_context_ref" "text", "p_context_label" "text", "p_context_url" "text") TO "service_role";


--
-- Name: FUNCTION "get_rental_availability"("product_id" "uuid", "start_date" "date", "end_date" "date"); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION "public"."get_rental_availability"("product_id" "uuid", "start_date" "date", "end_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."get_rental_availability"("product_id" "uuid", "start_date" "date", "end_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_rental_availability"("product_id" "uuid", "start_date" "date", "end_date" "date") TO "service_role";


--
-- Name: FUNCTION "get_superadmin_chat_inbox"("p_status" "text", "p_search" "text"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."get_superadmin_chat_inbox"("p_status" "text", "p_search" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."get_superadmin_chat_inbox"("p_status" "text", "p_search" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_superadmin_chat_inbox"("p_status" "text", "p_search" "text") TO "service_role";


--
-- Name: FUNCTION "handle_new_user"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


--
-- Name: FUNCTION "is_admin"(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";


--
-- Name: FUNCTION "is_superadmin"(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_superadmin"() TO "service_role";


--
-- Name: FUNCTION "lock_profile_role"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."lock_profile_role"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."lock_profile_role"() TO "service_role";


--
-- Name: FUNCTION "mark_all_notifications_read"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."mark_all_notifications_read"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_all_notifications_read"() TO "service_role";


--
-- Name: FUNCTION "mark_chat_conversation_read"("p_conversation_id" "uuid"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."mark_chat_conversation_read"("p_conversation_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_chat_conversation_read"("p_conversation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_chat_conversation_read"("p_conversation_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "mark_notification_read"("p_notification_id" "uuid"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_notification_read"("p_notification_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "notification_capture_contact_submitter"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."notification_capture_contact_submitter"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notification_capture_contact_submitter"() TO "service_role";


--
-- Name: FUNCTION "notification_chat_message_created"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."notification_chat_message_created"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notification_chat_message_created"() TO "service_role";


--
-- Name: FUNCTION "notification_contact_submitted"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."notification_contact_submitted"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notification_contact_submitted"() TO "service_role";


--
-- Name: FUNCTION "notification_purchase_quote_created"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."notification_purchase_quote_created"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notification_purchase_quote_created"() TO "service_role";


--
-- Name: FUNCTION "notification_purchase_quote_status_changed"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."notification_purchase_quote_status_changed"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notification_purchase_quote_status_changed"() TO "service_role";


--
-- Name: FUNCTION "notification_rental_created"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."notification_rental_created"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notification_rental_created"() TO "service_role";


--
-- Name: FUNCTION "notification_rental_status_changed"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."notification_rental_status_changed"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notification_rental_status_changed"() TO "service_role";


--
-- Name: FUNCTION "notification_target_is_safe"("p_target_url" "text"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."notification_target_is_safe"("p_target_url" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notification_target_is_safe"("p_target_url" "text") TO "service_role";


--
-- Name: FUNCTION "preview_notification_audience"("p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."preview_notification_audience"("p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."preview_notification_audience"("p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."preview_notification_audience"("p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean) TO "service_role";


--
-- Name: FUNCTION "remove_admin"("target_id" "uuid"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."remove_admin"("target_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."remove_admin"("target_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."remove_admin"("target_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "send_custom_notification"("p_title" "text", "p_message" "text", "p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean, "p_target_url" "text", "p_type" "text"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."send_custom_notification"("p_title" "text", "p_message" "text", "p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean, "p_target_url" "text", "p_type" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."send_custom_notification"("p_title" "text", "p_message" "text", "p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean, "p_target_url" "text", "p_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_custom_notification"("p_title" "text", "p_message" "text", "p_clients" boolean, "p_admins" boolean, "p_superadmins" boolean, "p_target_url" "text", "p_type" "text") TO "service_role";


--
-- Name: FUNCTION "set_admin_role"("target_id" "uuid", "new_role" "text"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."set_admin_role"("target_id" "uuid", "new_role" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_admin_role"("target_id" "uuid", "new_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_admin_role"("target_id" "uuid", "new_role" "text") TO "service_role";


--
-- Name: FUNCTION "set_chat_conversation_status"("p_conversation_id" "uuid", "p_status" "text"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."set_chat_conversation_status"("p_conversation_id" "uuid", "p_status" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."set_chat_conversation_status"("p_conversation_id" "uuid", "p_status" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_chat_conversation_status"("p_conversation_id" "uuid", "p_status" "text") TO "service_role";


--
-- Name: FUNCTION "sync_profile_from_auth_user"(); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."sync_profile_from_auth_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."sync_profile_from_auth_user"() TO "service_role";


--
-- Name: FUNCTION "update_request_status"("request_type" "text", "request_id" "uuid", "new_status" "text", "note" "text"); Type: ACL; Schema: public; Owner: -
--

REVOKE ALL ON FUNCTION "public"."update_request_status"("request_type" "text", "request_id" "uuid", "new_status" "text", "note" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_request_status"("request_type" "text", "request_id" "uuid", "new_status" "text", "note" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_request_status"("request_type" "text", "request_id" "uuid", "new_status" "text", "note" "text") TO "service_role";


--
-- Name: FUNCTION "update_updated_at"(); Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


--
-- Name: TABLE "admin_logs"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."admin_logs" TO "anon";
GRANT ALL ON TABLE "public"."admin_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_logs" TO "service_role";


--
-- Name: TABLE "categories"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";


--
-- Name: TABLE "chat_conversations"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."chat_conversations" TO "anon";
GRANT ALL ON TABLE "public"."chat_conversations" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_conversations" TO "service_role";


--
-- Name: TABLE "chat_messages"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";


--
-- Name: TABLE "chat_quick_questions"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."chat_quick_questions" TO "anon";
GRANT ALL ON TABLE "public"."chat_quick_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_quick_questions" TO "service_role";


--
-- Name: TABLE "chat_read_states"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."chat_read_states" TO "anon";
GRANT ALL ON TABLE "public"."chat_read_states" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_read_states" TO "service_role";


--
-- Name: TABLE "contact_rate_limit"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."contact_rate_limit" TO "anon";
GRANT ALL ON TABLE "public"."contact_rate_limit" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_rate_limit" TO "service_role";


--
-- Name: TABLE "contact_submissions"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."contact_submissions" TO "anon";
GRANT ALL ON TABLE "public"."contact_submissions" TO "authenticated";
GRANT ALL ON TABLE "public"."contact_submissions" TO "service_role";


--
-- Name: TABLE "custom_build_categories"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."custom_build_categories" TO "anon";
GRANT ALL ON TABLE "public"."custom_build_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_build_categories" TO "service_role";


--
-- Name: TABLE "custom_builds"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."custom_builds" TO "anon";
GRANT ALL ON TABLE "public"."custom_builds" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_builds" TO "service_role";


--
-- Name: TABLE "customers"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."customers" TO "anon";
GRANT ALL ON TABLE "public"."customers" TO "authenticated";
GRANT ALL ON TABLE "public"."customers" TO "service_role";


--
-- Name: TABLE "gallery_albums"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."gallery_albums" TO "anon";
GRANT ALL ON TABLE "public"."gallery_albums" TO "authenticated";
GRANT ALL ON TABLE "public"."gallery_albums" TO "service_role";


--
-- Name: TABLE "inventory_reservations"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."inventory_reservations" TO "anon";
GRANT ALL ON TABLE "public"."inventory_reservations" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_reservations" TO "service_role";


--
-- Name: TABLE "notifications"; Type: ACL; Schema: public; Owner: -
--

GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."notifications" TO "anon";
GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";


--
-- Name: TABLE "parts"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."parts" TO "anon";
GRANT ALL ON TABLE "public"."parts" TO "authenticated";
GRANT ALL ON TABLE "public"."parts" TO "service_role";


--
-- Name: TABLE "product_images"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."product_images" TO "anon";
GRANT ALL ON TABLE "public"."product_images" TO "authenticated";
GRANT ALL ON TABLE "public"."product_images" TO "service_role";


--
-- Name: TABLE "products"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";


--
-- Name: TABLE "profiles"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";


--
-- Name: TABLE "purchase_quote_items"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."purchase_quote_items" TO "anon";
GRANT ALL ON TABLE "public"."purchase_quote_items" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_quote_items" TO "service_role";


--
-- Name: TABLE "purchase_quote_requests"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."purchase_quote_requests" TO "anon";
GRANT ALL ON TABLE "public"."purchase_quote_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."purchase_quote_requests" TO "service_role";


--
-- Name: TABLE "rental_request_items"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."rental_request_items" TO "anon";
GRANT ALL ON TABLE "public"."rental_request_items" TO "authenticated";
GRANT ALL ON TABLE "public"."rental_request_items" TO "service_role";


--
-- Name: TABLE "rental_requests"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."rental_requests" TO "anon";
GRANT ALL ON TABLE "public"."rental_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."rental_requests" TO "service_role";


--
-- Name: TABLE "request_status_history"; Type: ACL; Schema: public; Owner: -
--

GRANT ALL ON TABLE "public"."request_status_history" TO "anon";
GRANT ALL ON TABLE "public"."request_status_history" TO "authenticated";
GRANT ALL ON TABLE "public"."request_status_history" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--



--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--



--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: -
--



--
-- PostgreSQL database dump complete
--
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
