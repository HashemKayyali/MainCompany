-- ============================================================================
-- Security hardening: lock the profiles.role column
-- ============================================================================
-- Root cause: the RLS policy "Users can update own profile" allows a user to
-- update their own profiles row WITHOUT any restriction on the `role` column.
-- A normal user could therefore send a direct PATCH to the Supabase REST API
-- (/rest/v1/profiles) setting role = 'superadmin' and gain admin access.
--
-- Fix: a BEFORE UPDATE trigger that rejects any change to `role` unless the
-- caller is a superadmin (public.is_superadmin() is defined in
-- 20260402_auth_admin_rpc_and_contact_rls.sql). The trigger runs regardless
-- of which client/policy issued the UPDATE, so it closes the hole even for
-- raw REST/PATCH calls that bypass the app.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.lock_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

DROP TRIGGER IF EXISTS lock_profile_role ON public.profiles;
CREATE TRIGGER lock_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.lock_profile_role();
