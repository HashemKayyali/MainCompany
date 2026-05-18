# Eventies

Eventies is an event-focused web platform built to help organizers find, compare, and request everything an event needs in one place. The current codebase combines a polished public-facing marketplace with Supabase-backed authentication, rental and purchase request flows, and a protected admin workspace for catalog and request management.

## Project Overview

The repository is no longer a generic frontend starter. It already contains:

- A branded Eventies marketing and marketplace experience
- Public catalog browsing for event services and products
- Customer auth, profile, request tracking, and checkout-style flows
- A substantial admin dashboard for content, users, logs, and request review
- Supabase integration for auth, database access, storage uploads, and request workflows

## Current Purpose of the Platform

Eventies is currently positioned as a marketplace for event services in Jordan. In its present implementation, the platform is designed to:

- Showcase event-related products, activations, and service offerings
- Let users browse products, customer references, and gallery content
- Support account creation and authenticated user workflows
- Collect rental requests and purchase quote requests
- Give admins tools to manage catalog data, media, users, and request status updates

## Main Features Implemented So Far

### Public Experience

- Responsive landing page with animated hero, branded background system, featured products, offer sections, and partner/logo content
- Public pages for home, products, product details, customers, gallery, about, and contact
- Marketplace browsing with category filters and product detail pages
- Search dialog with keyboard shortcut support
- Responsive navigation with desktop dropdowns, mobile menu, cart/quote entry points, and account menu
- Light/dark theme system with persisted preference

### Authentication and Account Flows

- Login and registration pages under the Eventies brand
- Supabase email/password auth
- Auth callback flow for email confirmation and redirect handling
- Password reset flow
- Profile page with editable user details
- Avatar support with generated avatars plus uploaded profile photos
- Remember-me style auth persistence handling

### Rental and Quote Workflows

- Rental cart with shared-date and per-item date modes
- Availability checks against Supabase RPCs for rental stock
- Checkout flow for authenticated rental request submission
- Purchase quote draft flow with local persistence
- My Requests list and request detail pages for both rental and purchase quote requests
- Status history display for submitted requests

### Contact and Lead Capture

- Contact page with structured inquiry form
- Contact submissions saved through Supabase when configured
- WhatsApp and email fallback launch even if persistence fails
- Client-side validation and basic rate limiting for the contact form

### Admin Workspace

- Protected `/admin` area guarded by authenticated admin roles
- Dashboard with summary cards and operational reports
- CRUD-style admin pages for:
  - Products
  - Parts
  - Customers
  - Categories
  - Gallery albums
  - Users
  - Admin users
  - Activity logs
- Admin request list and request details pages
- Rental approval and request status updates
- Internal admin notes on requests
- Media upload and framing tools for images and videos

### Performance and UX Work

- Route-level lazy loading
- Manual Vite chunk splitting for React, motion, Supabase, icons, and avatar libraries
- Reduced-motion and low-performance heuristics
- Custom toast system, dialogs, loaders, and error boundary

## Tech Stack

- React 18
- TypeScript
- Vite 5
- React Router 6
- Tailwind CSS 3
- Framer Motion
- Supabase JavaScript SDK
- Lucide React
- Radix UI primitives
- DiceBear avatars
- Lenis
- PostCSS + Autoprefixer

## Project Structure Overview

The active app boots from `src/main.tsx` and uses `src/router.tsx` for route configuration.

```text
Main-Site/
|-- public/
|   |-- assets/
|   |-- images/
|   |-- _redirects
|   \-- robots.txt
|-- src/
|   |-- components/
|   |   |-- admin/
|   |   |-- auth/
|   |   |-- contact/
|   |   |-- customer/
|   |   |-- gallery/
|   |   |-- home/
|   |   |-- layout/
|   |   |-- product/
|   |   |-- requests/
|   |   |-- theme/
|   |   \-- ui/
|   |-- contexts/
|   |-- data/
|   |-- hooks/
|   |-- lib/
|   |-- pages/
|   |   \-- admin/
|   |-- services/
|   |-- styles/
|   |-- types/
|   |-- utils/
|   |-- App.tsx
|   |-- main.tsx
|   \-- router.tsx
|-- supabase/
|   |-- functions/
|   |-- migrations/
|   |-- migration.sql
|   |-- rental-commerce.sql
|   |-- rls-policies.sql
|   \-- schema.sql
|-- index.html
|-- package.json
|-- tailwind.config.js
|-- vite.config.ts
\-- README.md
```

## Setup and Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Create a local `.env`

This repository does not currently include a dedicated `.env.example`, so create your own `.env` in the project root:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start the development server

```bash
npm run dev
```

### 4. Create a production build

```bash
npm run build
```

### 5. Preview the production build

```bash
npm run preview
```

## Available Scripts

From `package.json`:

- `npm run dev` - start the Vite development server
- `npm run build` - build the production bundle
- `npm run preview` - preview the built app locally

There are currently no dedicated linting or automated test scripts defined in `package.json`.

## Environment Variables

The current codebase reads the following variables:

```bash
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Behavior notes:

- If Supabase is configured, auth, request flows, contact persistence, admin data, storage uploads, and availability checks are enabled.
- If Supabase is not configured, the public data layer falls back to seeded local content where possible so the UI can still render.
- Authenticated, admin, request submission, and storage-backed features should be treated as backend-dependent.

## Supabase / Backend Notes

Supabase is a core part of the current architecture.

- `src/lib/supabase.ts` configures the client and custom auth persistence behavior.
- `src/services/` contains the main backend-facing service layer for products, parts, customers, categories, gallery, profiles, requests, contacts, logs, and storage.
- `supabase/migrations/` includes newer work for:
  - profile/avatar updates
  - contact submission changes
  - rental commerce and request approval flows
  - admin/user RPCs and RLS adjustments
- `supabase/functions/` currently contains Edge Functions for:
  - `invite-admin`
  - `remove-admin`

Based on the service layer and SQL files, the backend currently covers:

- Authenticated user profiles
- Admin roles and admin RPC helpers
- Contact submissions
- Rental requests and rental request items
- Purchase quote requests and quote items
- Request history and status transitions
- Availability checks for rental inventory
- Storage-backed image and video uploads

Storage expectations in the frontend currently include public buckets named:

- `product-images`
- `product-videos`

## Current Development Status

This project is already beyond a template stage, but it is still in active development.

- The Eventies brand, marketplace shell, auth system, request workflows, and admin workspace are all implemented in code.
- The repository supports both public browsing and authenticated operational flows.
- Supabase-backed request, admin, and profile features are implemented through service files and SQL migrations.
- The frontend includes a meaningful amount of UI polish, animation work, responsive behavior, and media tooling.

At the same time, a few areas are clearly still transitional:

- Some seeded catalog content and copy still reflect older activation-specific examples such as bike-based products and legacy event content.
- Parts of the About page and default data model have not been fully normalized into a broader Eventies marketplace dataset yet.
- The repository contains both snapshot SQL files and timestamped migrations, which should eventually be consolidated into a cleaner backend bootstrap path.
- Root-level `main.tsx` and `router.tsx` exist, but `index.html` points to `src/main.tsx`; the root copies appear to be older leftovers rather than the primary entry path.
- Testing, linting, and CI are not yet formalized in the scripts.

## Planned Next Steps

Recommended next steps based on the current repository state:

- Finish migrating legacy seed data and older copy into consistent Eventies marketplace content
- Add a proper `.env.example` and a cleaner Supabase setup/bootstrap guide
- Consolidate overlapping SQL snapshots and migration paths
- Add linting, tests, and CI checks
- Continue expanding real marketplace catalog and reference content while hardening admin review workflows
- Clean up legacy duplicate entry files that are no longer part of the active app path

## Notes for Developers

- The active app entry is `src/main.tsx`.
- The active route map is `src/router.tsx`.
- Public catalog content is loaded through `DataContext`, which can cache snapshots in local storage and fall back to seeded defaults.
- Admin features are tightly coupled to Supabase roles, RPCs, and request tables.
- Media uploads are converted and uploaded in the browser via `src/services/storage.service.ts`.
- `public/_redirects` is present for SPA-friendly hosting behavior.
- If you are working on copy or demo data, review `src/data/defaults.ts` and the public pages carefully because some branding/content migration work is still in progress.


git status
git add .
git commit -m "Update website "
git push origin main