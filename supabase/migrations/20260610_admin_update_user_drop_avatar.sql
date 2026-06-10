-- ============================================================================
-- Fix admin_update_user after the avatar columns were dropped
-- ============================================================================
-- Root cause: admin_update_user (defined in
-- 20260401_request_approval_and_admin_avatar_fix.sql) still UPDATEs
-- profiles.avatar_url / avatar_style / avatar_seed / avatar_options. Those
-- columns were removed in 20260515_drop_avatar_columns.sql, so any call to the
-- function now fails at runtime ("column avatar_url does not exist") — which
-- breaks the admin "Edit User" action entirely.
--
-- Fix: redefine the function to update only name + phone, and drop the old
-- avatar-aware overload so only this signature remains. The frontend
-- (AdminUsersPage) now calls it with target_id / new_name / new_phone only.
--
-- Idempotent: drops the obsolete overload (IF EXISTS) and CREATE OR REPLACEs
-- the slim one.
-- ============================================================================

-- Remove the obsolete avatar-aware overload so it can't be called anymore.
DROP FUNCTION IF EXISTS public.admin_update_user(uuid, text, text, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION public.admin_update_user(
  target_id uuid,
  new_name text DEFAULT NULL,
  new_phone text DEFAULT NULL
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
    END
  WHERE p.id = admin_update_user.target_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user(uuid, text, text) TO authenticated;
