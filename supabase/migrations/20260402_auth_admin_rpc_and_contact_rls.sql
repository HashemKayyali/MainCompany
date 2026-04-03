-- Auth/admin RPC alignment and contact submission RLS completion.
-- Safe to run multiple times.

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT
      TO authenticated
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

DROP POLICY IF EXISTS "contacts_admin_update" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contacts" ON public.contact_submissions;
CREATE POLICY "contacts_admin_update"
  ON public.contact_submissions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP FUNCTION IF EXISTS public.get_all_admins();
CREATE OR REPLACE FUNCTION public.get_all_admins()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view admin accounts.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    COALESCE(p.email, ''),
    COALESCE(p.name, ''),
    COALESCE(p.role, 'user'),
    p.created_at
  FROM public.profiles p
  WHERE p.role IN ('admin', 'superadmin')
  ORDER BY
    CASE p.role
      WHEN 'superadmin' THEN 0
      WHEN 'admin' THEN 1
      ELSE 2
    END,
    p.created_at DESC;
END;
$$;

DROP FUNCTION IF EXISTS public.get_all_users();
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  phone text,
  role text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can view users.' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    COALESCE(p.email, ''),
    COALESCE(p.name, ''),
    COALESCE(p.phone, ''),
    COALESCE(p.role, 'user'),
    p.created_at
  FROM public.profiles p
  ORDER BY p.created_at DESC;
END;
$$;

DROP FUNCTION IF EXISTS public.set_admin_role(uuid, text);
CREATE OR REPLACE FUNCTION public.set_admin_role(target_id uuid, new_role text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_target_role text;
BEGIN
  IF v_actor_id IS NULL OR NOT public.is_superadmin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Only superadmins can change admin roles.');
  END IF;

  IF new_role NOT IN ('admin', 'superadmin') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Role must be admin or superadmin.');
  END IF;

  SELECT p.role
  INTO v_target_role
  FROM public.profiles p
  WHERE p.id = target_id;

  IF v_target_role IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'User not found.');
  END IF;

  IF target_id = v_actor_id AND new_role <> 'superadmin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'You cannot remove your own superadmin access.');
  END IF;

  IF v_target_role = 'superadmin' AND target_id <> v_actor_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Change superadmin roles directly from Supabase when needed.');
  END IF;

  UPDATE public.profiles
  SET role = new_role
  WHERE id = target_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

DROP FUNCTION IF EXISTS public.remove_admin(uuid);
CREATE OR REPLACE FUNCTION public.remove_admin(target_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor_id uuid := auth.uid();
  v_target_role text;
BEGIN
  IF v_actor_id IS NULL OR NOT public.is_superadmin() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Only superadmins can remove admin access.');
  END IF;

  IF target_id = v_actor_id THEN
    RETURN jsonb_build_object('ok', false, 'error', 'You cannot remove your own admin access.');
  END IF;

  SELECT p.role
  INTO v_target_role
  FROM public.profiles p
  WHERE p.id = target_id;

  IF v_target_role IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'User not found.');
  END IF;

  IF v_target_role = 'superadmin' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'Superadmin access must be changed manually.');
  END IF;

  UPDATE public.profiles
  SET role = 'user'
  WHERE id = target_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_admins() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_all_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_admin_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_admin(uuid) TO authenticated;
