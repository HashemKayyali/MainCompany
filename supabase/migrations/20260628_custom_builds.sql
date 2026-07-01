-- ============================================================================
-- Custom Builds
-- Public visual content managed from the admin panel and rendered on
-- /custom-builds, including the rotating hero carousel.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.custom_builds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  images text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT custom_builds_title_length CHECK (char_length(btrim(title)) BETWEEN 1 AND 140),
  CONSTRAINT custom_builds_description_length CHECK (char_length(description) <= 800),
  CONSTRAINT custom_builds_image_url_length CHECK (char_length(image_url) <= 2000),
  CONSTRAINT custom_builds_images_limit CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 24),
  CONSTRAINT custom_builds_images_total_length CHECK (char_length(array_to_string(images, '')) <= 48000),
  CONSTRAINT custom_builds_category_length CHECK (char_length(category) <= 80)
);

CREATE INDEX IF NOT EXISTS idx_custom_builds_public_order
  ON public.custom_builds(is_active, sort_order, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_custom_builds_featured
  ON public.custom_builds(is_featured)
  WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_custom_builds_updated ON public.custom_builds;
CREATE TRIGGER trg_custom_builds_updated
BEFORE UPDATE ON public.custom_builds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.custom_builds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active custom builds" ON public.custom_builds;
CREATE POLICY "Anyone can read active custom builds"
  ON public.custom_builds FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage custom builds" ON public.custom_builds;
CREATE POLICY "Admins manage custom builds"
  ON public.custom_builds FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT ON public.custom_builds TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.custom_builds TO authenticated;
