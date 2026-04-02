-- ═══════════════════════════════════════════════════════════
-- BikeLand Migration: Add missing columns & tables
-- Run this ONCE in Supabase SQL Editor
-- Safe: uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS
-- ═══════════════════════════════════════════════════════════

-- ── 1. Categories: add icon, description, image ──
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';

-- ── 2. Products: add all missing columns ──
-- title = name (already exists as 'title')
-- price = rental per day (already exists as 'price')
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS badge_color TEXT DEFAULT 'from-violet-500 to-pink-500';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_tags TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS short_description TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS hero_image TEXT DEFAULT '';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS quick_options JSONB DEFAULT '[]';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS notes TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features_left TEXT[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS features_right TEXT[] DEFAULT '{}';
ALTER TABLE public.products DROP COLUMN IF EXISTS rental_price_per_event;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'JOD';

-- ── 3. Customers: add slug, category ──
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS category TEXT DEFAULT '';

-- Add unique constraint on slug if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_slug_key') THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_slug_key UNIQUE (slug);
  END IF;
END $$;

-- ── 4. Parts: add product link, currency, image, in_stock ──
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS product_slug TEXT DEFAULT '';
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'JOD';
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS image TEXT DEFAULT '';
ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS in_stock BOOLEAN DEFAULT true;

-- ── 5. Contact Submissions (new table) ──
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  product_slug TEXT DEFAULT '',
  city TEXT DEFAULT '',
  address TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','booked','archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
DROP POLICY IF EXISTS "contacts_public_insert" ON public.contact_submissions;
CREATE POLICY "contacts_public_insert"
ON public.contact_submissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin read/update/delete
DROP POLICY IF EXISTS "contacts_admin_read" ON public.contact_submissions;
CREATE POLICY "contacts_admin_read"
ON public.contact_submissions FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "contacts_admin_update" ON public.contact_submissions;
CREATE POLICY "contacts_admin_update"
ON public.contact_submissions FOR UPDATE
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "contacts_admin_delete" ON public.contact_submissions;
CREATE POLICY "contacts_admin_delete"
ON public.contact_submissions FOR DELETE
TO authenticated
USING (public.is_admin());

-- ── 6. Profiles: add phone and email for user data ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_style TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_seed TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_options JSONB;

-- Update the trigger to also save email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.email, ''),
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = coalesce(new.email, ''),
    avatar_style = coalesce(nullif(new.raw_user_meta_data->>'avatarStyle', ''), public.profiles.avatar_style),
    avatar_seed = coalesce(nullif(new.raw_user_meta_data->>'avatarSeed', ''), public.profiles.avatar_seed),
    avatar_options = coalesce(
      CASE
        WHEN new.raw_user_meta_data ? 'avatarOptions'
          THEN (new.raw_user_meta_data->'avatarOptions')::jsonb
        ELSE NULL
      END,
      public.profiles.avatar_options
    );

  UPDATE public.profiles
  SET
    avatar_style = coalesce(nullif(new.raw_user_meta_data->>'avatarStyle', ''), avatar_style),
    avatar_seed = coalesce(nullif(new.raw_user_meta_data->>'avatarSeed', ''), avatar_seed),
    avatar_options = coalesce(
      CASE
        WHEN new.raw_user_meta_data ? 'avatarOptions'
          THEN (new.raw_user_meta_data->'avatarOptions')::jsonb
        ELSE NULL
      END,
      avatar_options
    )
  WHERE id = new.id;
  RETURN new;
END;
$$;

-- Done!
SELECT 'Migration complete!' AS result;
