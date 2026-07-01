-- ============================================================================
-- Custom Build Photo Galleries
-- Adds multiple related images per custom build card while preserving
-- image_url as the cover/legacy field.
-- ============================================================================

ALTER TABLE public.custom_builds
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

UPDATE public.custom_builds
SET images = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND COALESCE(array_length(images, 1), 0) = 0;

ALTER TABLE public.custom_builds
  DROP CONSTRAINT IF EXISTS custom_builds_images_limit;

ALTER TABLE public.custom_builds
  ADD CONSTRAINT custom_builds_images_limit CHECK (array_length(images, 1) IS NULL OR array_length(images, 1) <= 24);

ALTER TABLE public.custom_builds
  DROP CONSTRAINT IF EXISTS custom_builds_image_item_length;

ALTER TABLE public.custom_builds
  DROP CONSTRAINT IF EXISTS custom_builds_images_total_length;

ALTER TABLE public.custom_builds
  ADD CONSTRAINT custom_builds_images_total_length CHECK (char_length(array_to_string(images, '')) <= 48000);
