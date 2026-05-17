-- ============================================================================
-- Security hardening: force rental / purchase-quote creation through RPCs
-- ============================================================================
-- Root cause: the policies "Users insert own rental requests" and
-- "Users insert own purchase quotes" only check `profile_id = auth.uid()`.
-- They place NO restriction on the money columns (subtotal, grand_total, …),
-- so any authenticated user could POST directly to the Supabase REST API
-- (/rest/v1/rental_requests, /rest/v1/purchase_quote_requests) and submit a
-- request with arbitrary, attacker-chosen prices — bypassing the
-- server-side pricing logic in the RPCs (create_rental_request,
-- create_purchase_quote_request).
--
-- Fix: drop the direct-INSERT policies. With these gone, RLS denies any raw
-- INSERT from the `authenticated` role, so the only path left to create a
-- request is the SECURITY DEFINER RPCs, which compute prices from the
-- database. Admin policies (FOR ALL) and read policies are left untouched.
-- ============================================================================

DROP POLICY IF EXISTS "Users insert own rental requests"
  ON public.rental_requests;

DROP POLICY IF EXISTS "Users insert own purchase quotes"
  ON public.purchase_quote_requests;
