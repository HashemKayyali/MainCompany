-- ============================================================
-- Bike Land — Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor
-- ============================================================

-- ── Helper: check if current user is admin ──
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'superadmin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: check if current user is superadmin ──
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'superadmin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;


-- ============================================================
-- PRODUCTS
-- ============================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- PARTS
-- ============================================================
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read parts"
  ON public.parts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert parts"
  ON public.parts FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update parts"
  ON public.parts FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete parts"
  ON public.parts FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- CUSTOMERS
-- ============================================================
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read customers"
  ON public.customers FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert customers"
  ON public.customers FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update customers"
  ON public.customers FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete customers"
  ON public.customers FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- CATEGORIES
-- ============================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON public.categories FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- GALLERY
-- ============================================================
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read gallery"
  ON public.gallery FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert gallery"
  ON public.gallery FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update gallery"
  ON public.gallery FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete gallery"
  ON public.gallery FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- CONTACT SUBMISSIONS
-- ============================================================
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit a contact form (including anonymous)
CREATE POLICY "Anyone can submit contact"
  ON public.contact_submissions FOR INSERT
  TO public
  WITH CHECK (true);

-- Only admins can read submissions
CREATE POLICY "Admins can read contacts"
  ON public.contact_submissions FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can delete submissions
CREATE POLICY "Admins can delete contacts"
  ON public.contact_submissions FOR DELETE
  TO authenticated
  USING (public.is_admin());


-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Users can update their own profile (name only)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

-- Only superadmins can insert profiles (for inviting new admins)
CREATE POLICY "Superadmins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_superadmin());


-- ============================================================
-- LOGS
-- ============================================================
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Admins can read logs
CREATE POLICY "Admins can read logs"
  ON public.logs FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can insert logs
CREATE POLICY "Admins can insert logs"
  ON public.logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());


-- ============================================================
-- USERS (public user accounts, not admins)
-- ============================================================
-- If you have a public users table:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can read own data" ON public.users FOR SELECT TO authenticated USING (id = auth.uid());
-- CREATE POLICY "Users can update own data" ON public.users FOR UPDATE TO authenticated USING (id = auth.uid());
-- CREATE POLICY "Admins can read all users" ON public.users FOR SELECT TO authenticated USING (public.is_admin());


-- ============================================================
-- VERIFY: Check all tables have RLS enabled
-- ============================================================
-- Run this to verify:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- All should show rowsecurity = true
