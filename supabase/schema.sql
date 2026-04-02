-- ====================================================
-- Bike Land - Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Products ──
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  badge TEXT DEFAULT '',
  badge_color TEXT DEFAULT 'from-violet-500 to-pink-500',
  category_tags TEXT[] DEFAULT '{}',
  category_id TEXT,
  short_description TEXT DEFAULT '',
  description TEXT DEFAULT '',
  featured BOOLEAN DEFAULT false,
  hero_image TEXT DEFAULT '',
  gallery TEXT[] DEFAULT '{}',
  quick_options JSONB DEFAULT '[]',
  notes TEXT[] DEFAULT '{}',
  features_left TEXT[] DEFAULT '{}',
  features_right TEXT[] DEFAULT '{}',
  rental_price_per_day NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'JOD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(featured);

-- ── Parts ──
CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY,
  product_slug TEXT NOT NULL REFERENCES products(slug) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(10,2) DEFAULT 0,
  currency TEXT DEFAULT 'JOD',
  image TEXT DEFAULT '',
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_parts_product ON parts(product_slug);

-- ── Customers ──
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo TEXT DEFAULT '',
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_customers_slug ON customers(slug);

-- ── Categories ──
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT '',
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Admin Users ──
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  auth_uid UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_admin_email ON admin_users(email);

-- ── App Users (public-facing) ──
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_app_users_email ON app_users(email);
CREATE INDEX idx_app_users_auth ON app_users(auth_uid);

-- ── Contact Submissions ──
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  product_slug TEXT DEFAULT '',
  city TEXT DEFAULT '',
  address TEXT DEFAULT '',
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'archived')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_contacts_status ON contact_submissions(status);

-- ── Auto-update timestamps ──
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_parts_updated BEFORE UPDATE ON parts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ──
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public read for public-facing tables
CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read parts" ON parts FOR SELECT USING (true);
CREATE POLICY "Public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

-- Admin full access (authenticated users who exist in admin_users)
CREATE POLICY "Admin manage products" ON products FOR ALL USING (
  auth.uid() IN (SELECT auth_uid FROM admin_users WHERE auth_uid IS NOT NULL)
);
CREATE POLICY "Admin manage parts" ON parts FOR ALL USING (
  auth.uid() IN (SELECT auth_uid FROM admin_users WHERE auth_uid IS NOT NULL)
);
CREATE POLICY "Admin manage customers" ON customers FOR ALL USING (
  auth.uid() IN (SELECT auth_uid FROM admin_users WHERE auth_uid IS NOT NULL)
);
CREATE POLICY "Admin manage categories" ON categories FOR ALL USING (
  auth.uid() IN (SELECT auth_uid FROM admin_users WHERE auth_uid IS NOT NULL)
);
CREATE POLICY "Admin view admins" ON admin_users FOR SELECT USING (
  auth.uid() IN (SELECT auth_uid FROM admin_users WHERE auth_uid IS NOT NULL)
);
CREATE POLICY "Superadmin manage admins" ON admin_users FOR ALL USING (
  auth.uid() IN (SELECT auth_uid FROM admin_users WHERE role = 'superadmin')
);
CREATE POLICY "Admin view contacts" ON contact_submissions FOR SELECT USING (
  auth.uid() IN (SELECT auth_uid FROM admin_users WHERE auth_uid IS NOT NULL)
);
CREATE POLICY "Admin manage contacts" ON contact_submissions FOR ALL USING (
  auth.uid() IN (SELECT auth_uid FROM admin_users WHERE auth_uid IS NOT NULL)
);

-- App users can read their own data
CREATE POLICY "Users read own profile" ON app_users FOR SELECT USING (auth.uid() = auth_uid);
CREATE POLICY "Users update own profile" ON app_users FOR UPDATE USING (auth.uid() = auth_uid);

-- Anyone can submit contact forms
CREATE POLICY "Public insert contacts" ON contact_submissions FOR INSERT WITH CHECK (true);

-- ── Default super admin ──
INSERT INTO admin_users (email, name, role) VALUES ('admin@bike-jo.com', 'Super Admin', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- ── Default categories ──
INSERT INTO categories (id, name, slug, icon, description) VALUES
  ('cat-terminal-vr', 'The Terminal VR', 'terminal-vr', '🥽', 'VR gaming experiences and immersive virtual reality activations'),
  ('cat-bikeland', 'Bike Land', 'bike-land', '🚲', 'Interactive bike-powered activations — LED racing, smoothie bikes, energy generation'),
  ('cat-custom', 'Custom Builds', 'custom-builds', '🔧', 'Tailor-made activations designed for your specific event needs')
ON CONFLICT (id) DO NOTHING;

-- ══════════════════════════════════════════
-- Storage Bucket Setup
-- Run these in the SQL Editor as well
-- ══════════════════════════════════════════

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bikeland-images', 'bikeland-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to images
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT USING (bucket_id = 'bikeland-images');

-- Allow authenticated admin users to upload/delete images
CREATE POLICY "Admin upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'bikeland-images'
    AND auth.uid() IN (SELECT auth_uid FROM public.admin_users WHERE auth_uid IS NOT NULL)
  );

CREATE POLICY "Admin update images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'bikeland-images'
    AND auth.uid() IN (SELECT auth_uid FROM public.admin_users WHERE auth_uid IS NOT NULL)
  );

CREATE POLICY "Admin delete images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'bikeland-images'
    AND auth.uid() IN (SELECT auth_uid FROM public.admin_users WHERE auth_uid IS NOT NULL)
  );
