-- Profiles avatar URL support
-- Adds a canonical uploaded-avatar column and keeps auth metadata aligned.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

CREATE OR REPLACE FUNCTION public.auth_avatar_url(metadata jsonb)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    NULLIF(metadata->>'avatarUrl', ''),
    NULLIF(metadata->>'avatar_url', ''),
    NULLIF(metadata->>'picture', '')
  );
$$;

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
    avatar_url,
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
    public.auth_avatar_url(new.raw_user_meta_data),
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
    avatar_url = COALESCE(NULLIF(EXCLUDED.avatar_url, ''), public.profiles.avatar_url),
    avatar_style = COALESCE(EXCLUDED.avatar_style, public.profiles.avatar_style),
    avatar_seed = COALESCE(EXCLUDED.avatar_seed, public.profiles.avatar_seed),
    avatar_options = COALESCE(EXCLUDED.avatar_options, public.profiles.avatar_options);

  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_profile_from_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  UPDATE public.profiles
  SET
    name = COALESCE(NULLIF(new.raw_user_meta_data->>'name', ''), public.profiles.name),
    email = COALESCE(NULLIF(new.email, ''), public.profiles.email),
    phone = COALESCE(NULLIF(new.raw_user_meta_data->>'phone', ''), public.profiles.phone),
    avatar_url = COALESCE(public.auth_avatar_url(new.raw_user_meta_data), public.profiles.avatar_url),
    avatar_style = COALESCE(NULLIF(new.raw_user_meta_data->>'avatarStyle', ''), public.profiles.avatar_style),
    avatar_seed = COALESCE(NULLIF(new.raw_user_meta_data->>'avatarSeed', ''), public.profiles.avatar_seed),
    avatar_options = COALESCE(
      CASE
        WHEN new.raw_user_meta_data ? 'avatarOptions'
          THEN (new.raw_user_meta_data->'avatarOptions')::jsonb
        ELSE NULL
      END,
      public.profiles.avatar_options
    )
  WHERE public.profiles.id = new.id;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_updated_profile_sync ON auth.users;

CREATE TRIGGER on_auth_user_updated_profile_sync
AFTER UPDATE OF email, raw_user_meta_data ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sync_profile_from_auth_user();

UPDATE public.profiles AS p
SET
  avatar_url = COALESCE(
    NULLIF(p.avatar_url, ''),
    public.auth_avatar_url(u.raw_user_meta_data)
  ),
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
