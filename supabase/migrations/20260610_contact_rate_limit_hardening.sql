-- ============================================================================
-- Harden the contact_submissions per-IP rate limit
-- ============================================================================
-- Builds on 20260515_contact_submissions_hardening.sql. Two problems with the
-- original check_contact_rate_limit:
--
--   1. When the client IP cannot be derived from request.headers it collapses
--      to the literal 'unknown', so EVERY header-less request shares one bucket
--      with the normal 5/hour allowance. A flood of direct REST calls (which
--      can omit the proxy headers) rides that single generous bucket, and at
--      the same time any legitimate header-less traffic gets blocked en masse
--      once the shared bucket fills.
--
--   2. The contact_rate_limit table is never pruned — stale buckets accumulate
--      forever.
--
-- This migration:
--   * Parses x-forwarded-for / cf-connecting-ip more defensively (first hop,
--     trimmed; guards an empty/missing request.headers setting).
--   * Applies a much stricter cap (2 vs 5) to the shared 'unknown' bucket and
--     raises a WARNING so these inserts are visible in the logs, instead of
--     letting unidentifiable traffic share the normal allowance.
--   * Opportunistically deletes buckets older than one hour on every insert,
--     keeping the table small (the "separate cleanup" option folded inline).
--
-- Idempotent: CREATE OR REPLACE FUNCTION + DROP/CREATE TRIGGER.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_contact_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

DROP TRIGGER IF EXISTS check_contact_rate_limit ON public.contact_submissions;
CREATE TRIGGER check_contact_rate_limit
  BEFORE INSERT ON public.contact_submissions
  FOR EACH ROW EXECUTE FUNCTION public.check_contact_rate_limit();
