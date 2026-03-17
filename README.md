# 🚲 Bike Land - Interactive Cycling Experiences

A vibrant, space-themed website for Bike Land Jordan - interactive bike-powered event activations.

## ✨ Features

- **Vibrant Neon Space Theme** - Colorful, energetic design with animated nebulas, stars, and glow effects
- **Full Admin Panel** - Manage products, parts, customers, categories, and admins
- **Supabase-Ready Backend** - Complete service layer, types, and SQL schema prepared
- **Responsive Design** - Dark/light mode, mobile-friendly
- **Framer Motion** animations throughout

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🔗 Supabase Integration

### 1. Create Supabase Project
Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Run Database Migration
Copy `supabase/schema.sql` and run it in the **SQL Editor** of your Supabase dashboard.

### 3. Configure Environment
```bash
cp .env.example .env
```
Fill in your Supabase URL and anon key from Project Settings → API.

### 4. Create Admin User
In Supabase Auth → Users, create a user with email `admin@bike-jo.com`. Then link the `auth_uid` in the `admin_users` table.

### 5. Switch to Supabase Services
Replace localStorage-based context calls with imports from `src/services/`:
- `products.service.ts` - CRUD for products
- `parts.service.ts` - CRUD for parts
- `customers.service.ts` - CRUD for customers
- `categories.service.ts` - CRUD for categories
- `auth.service.ts` - Admin authentication
- `users.service.ts` - Public user registration/login
- `contact.service.ts` - Contact form submissions

## 📁 Project Structure

```
src/
├── components/     # UI components (vibrant neon design)
├── contexts/       # React contexts (localStorage-based, swap for services)
├── data/           # Default data & types
├── hooks/          # Custom hooks
├── lib/            # Supabase client & database types
├── pages/          # Route pages + admin pages
├── services/       # Supabase CRUD services (ready to use)
├── styles/         # CSS (neon theme, star field, glass effects)
└── utils/          # Formatters, validators
supabase/
└── schema.sql      # Full database migration with RLS policies
```

## 🎨 Design System

- **Colors**: Purple, Cyan, Pink, Amber, Lime neon accents
- **Effects**: Animated gradients, glow shadows, star field, nebula clouds
- **Glass**: Frosted glass cards with colored borders
- **Typography**: Outfit (display), Nunito Sans (body), JetBrains Mono (code)



تمام. لرفع التحديثات على GitHub اكتب هالأوامر داخل فولدر مشروعك (PowerShell) بالترتيب:



git status
git add .
git commit -m "photos scale"
git push

