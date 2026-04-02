-- Profile / Avatar auth alignment fix
-- Safe to run multiple times.
-- Aligns the live profiles schema with the runtime auth/avatar flow.

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_style TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_seed TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_options JSONB;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    phone,
    role,
    avatar_style,
    avatar_seed,
    avatar_options
  )
  VALUES (
    new.id,
    COALESCE(NULLIF(new.raw_user_meta_data->>'name', ''), SPLIT_PART(COALESCE(new.email, ''), '@', 1), 'User'),
    COALESCE(new.email, ''),
    COALESCE(NULLIF(new.raw_user_meta_data->>'phone', ''), ''),
    'user',
    NULLIF(new.raw_user_meta_data->>'avatarStyle', ''),
    NULLIF(new.raw_user_meta_data->>'avatarSeed', ''),
    CASE
      WHEN new.raw_user_meta_data ? 'avatarOptions'
        THEN (new.raw_user_meta_data->'avatarOptions')::jsonb
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(NULLIF(EXCLUDED.name, ''), public.profiles.name),
    email = COALESCE(NULLIF(EXCLUDED.email, ''), public.profiles.email),
    phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone),
    avatar_style = COALESCE(EXCLUDED.avatar_style, public.profiles.avatar_style),
    avatar_seed = COALESCE(EXCLUDED.avatar_seed, public.profiles.avatar_seed),
    avatar_options = COALESCE(EXCLUDED.avatar_options, public.profiles.avatar_options);

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (
  id,
  name,
  email,
  phone,
  role,
  avatar_style,
  avatar_seed,
  avatar_options
)
SELECT
  u.id,
  COALESCE(NULLIF(u.raw_user_meta_data->>'name', ''), SPLIT_PART(COALESCE(u.email, ''), '@', 1), 'User'),
  COALESCE(u.email, ''),
  COALESCE(NULLIF(u.raw_user_meta_data->>'phone', ''), ''),
  'user',
  NULLIF(u.raw_user_meta_data->>'avatarStyle', ''),
  NULLIF(u.raw_user_meta_data->>'avatarSeed', ''),
  CASE
    WHEN u.raw_user_meta_data ? 'avatarOptions'
      THEN (u.raw_user_meta_data->'avatarOptions')::jsonb
    ELSE NULL
  END
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

UPDATE public.profiles AS p
SET
  email = COALESCE(NULLIF(p.email, ''), COALESCE(u.email, '')),
  phone = COALESCE(NULLIF(p.phone, ''), COALESCE(NULLIF(u.raw_user_meta_data->>'phone', ''), '')),
  avatar_style = COALESCE(p.avatar_style, NULLIF(u.raw_user_meta_data->>'avatarStyle', '')),
  avatar_seed = COALESCE(p.avatar_seed, NULLIF(u.raw_user_meta_data->>'avatarSeed', '')),
  avatar_options = COALESCE(
    p.avatar_options,
    CASE
      WHEN u.raw_user_meta_data ? 'avatarOptions'
        THEN (u.raw_user_meta_data->'avatarOptions')::jsonb
      ELSE NULL
    END
  )
FROM auth.users u
WHERE p.id = u.id;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (id = auth.uid());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Admins can read all profiles'
  ) THEN
    CREATE POLICY "Admins can read all profiles"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (public.is_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());
  END IF;
END $$;

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
