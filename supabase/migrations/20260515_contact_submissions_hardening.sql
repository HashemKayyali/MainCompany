-- ============================================================================
-- Security hardening: contact_submissions spam mitigation
-- ============================================================================
-- Root cause: policy "Anyone can submit contact" / "contacts_public_insert"
-- uses WITH CHECK (true) for the public role, and the only rate limit lives
-- in the frontend (trivially bypassed via direct REST calls). The table is
-- wide open to automated spam with arbitrary payload sizes.
--
-- This migration adds:
--   1. Column length / format constraints (size + email-shape sanity).
--   2. A per-IP rate limit (5 inserts / rolling hour) enforced by a
--      BEFORE INSERT trigger, using the proxy IP headers Supabase exposes.
-- ============================================================================

-- Length caps and email format
ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_name_length CHECK (char_length(name) BETWEEN 1 AND 100),
  ADD CONSTRAINT contact_email_length CHECK (char_length(email) BETWEEN 3 AND 254),
  ADD CONSTRAINT contact_email_format CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  ADD CONSTRAINT contact_message_length CHECK (message IS NULL OR char_length(message) <= 2000),
  ADD CONSTRAINT contact_phone_length CHECK (phone IS NULL OR char_length(phone) <= 20);

-- Per-IP rate limit (5/hour)
CREATE TABLE IF NOT EXISTS public.contact_rate_limit (
  ip text PRIMARY KEY,
  count integer NOT NULL DEFAULT 1,
  window_start timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.check_contact_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ip text := COALESCE(
    current_setting('request.headers', true)::jsonb->>'cf-connecting-ip',
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for',
    'unknown'
  );
  v_count integer;
BEGIN
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

  IF v_count > 5 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Try again later.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS check_contact_rate_limit ON public.contact_submissions;
CREATE TRIGGER check_contact_rate_limit
  BEFORE INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.check_contact_rate_limit();
