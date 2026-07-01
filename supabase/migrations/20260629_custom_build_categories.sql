-- ============================================================================
-- Custom Build Categories
-- Stores admin-managed category options for /custom-builds instead of relying
-- on fixed frontend tabs or categories inferred from build text.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS public.custom_build_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT custom_build_categories_name_length CHECK (char_length(btrim(name)) BETWEEN 1 AND 80)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_build_categories_name_unique
  ON public.custom_build_categories (lower(btrim(name)));

CREATE INDEX IF NOT EXISTS idx_custom_build_categories_public_order
  ON public.custom_build_categories(is_active, sort_order, name);

INSERT INTO public.custom_build_categories (name, sort_order, is_active)
SELECT category, row_number() OVER (ORDER BY lower(category))::integer * 10, true
FROM (
  SELECT DISTINCT btrim(category) AS category
  FROM public.custom_builds
  WHERE btrim(COALESCE(category, '')) <> ''
) existing_categories
ON CONFLICT DO NOTHING;

DROP TRIGGER IF EXISTS trg_custom_build_categories_updated ON public.custom_build_categories;
CREATE TRIGGER trg_custom_build_categories_updated
BEFORE UPDATE ON public.custom_build_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE public.custom_build_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read active custom build categories" ON public.custom_build_categories;
CREATE POLICY "Anyone can read active custom build categories"
  ON public.custom_build_categories FOR SELECT
  TO public
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins manage custom build categories" ON public.custom_build_categories;
CREATE POLICY "Admins manage custom build categories"
  ON public.custom_build_categories FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

GRANT SELECT ON public.custom_build_categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.custom_build_categories TO authenticated;
