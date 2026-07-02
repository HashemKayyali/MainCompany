-- ============================================================================
-- Contact submission size caps (gap fill) + foreign-key covering indexes
-- ============================================================================
-- Follow-up to 20260702_security_hardening.sql (production audit, batch 1).
--
--   1. contact_submissions is publicly insertable by design (INSERT policy
--      WITH CHECK (true), throttled by the check_contact_rate_limit trigger).
--      20260515_contact_submissions_hardening already caps name/email/phone/
--      message and constrains the email format and status enum — but left
--      city, address, and product_slug unbounded. These three CHECK
--      constraints close that gap so no text field on the table is
--      unlimited. The table is empty at migration time, so plain
--      (validating) constraints are safe.
--
--   2. Covering indexes for the five foreign keys flagged by the Supabase
--      performance advisor (lint 0001_unindexed_foreign_keys). These speed
--      up category/product joins, availability lookups, and cascade checks.
--
-- Idempotent: DROP CONSTRAINT IF EXISTS + CREATE INDEX IF NOT EXISTS.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. contact_submissions: cap the three previously-unbounded text fields
-- ----------------------------------------------------------------------------
ALTER TABLE public.contact_submissions
  DROP CONSTRAINT IF EXISTS contact_submissions_product_slug_len,
  DROP CONSTRAINT IF EXISTS contact_submissions_city_len,
  DROP CONSTRAINT IF EXISTS contact_submissions_address_len;

ALTER TABLE public.contact_submissions
  ADD CONSTRAINT contact_submissions_product_slug_len
    CHECK (product_slug IS NULL OR length(product_slug) <= 200),
  ADD CONSTRAINT contact_submissions_city_len
    CHECK (city IS NULL OR length(city) <= 120),
  ADD CONSTRAINT contact_submissions_address_len
    CHECK (address IS NULL OR length(address) <= 400);

-- ----------------------------------------------------------------------------
-- 2. Foreign-key covering indexes (performance advisor lint 0001)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category_id
  ON public.products (category_id);

CREATE INDEX IF NOT EXISTS idx_rental_request_items_product_id
  ON public.rental_request_items (product_id);

CREATE INDEX IF NOT EXISTS idx_purchase_quote_items_product_id
  ON public.purchase_quote_items (product_id);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_rental_request_id
  ON public.inventory_reservations (rental_request_id);

CREATE INDEX IF NOT EXISTS idx_inventory_reservations_rental_request_item_id
  ON public.inventory_reservations (rental_request_item_id);
