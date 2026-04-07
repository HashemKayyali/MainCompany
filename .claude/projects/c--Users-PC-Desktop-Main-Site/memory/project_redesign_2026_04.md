---
name: Frontend Redesign April 2026
description: Comprehensive premium UI redesign across all key pages — completed April 2026
type: project
---

Major visual and UX redesign was completed across all key public pages, auth, admin, and shared components.

**Why:** User wanted a dramatically more premium, luxury-grade event marketplace feel — not a generic template.

**Files changed:**
- `src/styles/input.css` — Atmospheric body backgrounds (radial gradients for dark/light), improved `.section-title` sizing, new `.premium-card`, `.contact-info-card`, `.auth-card`, `.pricing-header-gradient` classes, improved `.card-surface` with `will-change: transform`, better `.btn-primary/.btn-outline` hover states
- `src/components/product/ProductGallery.tsx` — 16:10 aspect ratio main viewer, dot navigation indicators, bigger thumbnails (82×58px), cleaner arrows
- `src/components/store/PricingCard.tsx` — Gradient header band, dramatically larger price (`2.6rem`), in-stock badge, zap icon on "included" list
- `src/pages/ProductDetailsPage.tsx` — **FLAGSHIP** — bigger title (3rem), ambient glow orbs, premium breadcrumb pill, trust-badge bar, notes with left-border accent, specs inside a card container, parts cards with anti-flicker hover glow, enhanced mobile sticky bar
- `src/components/home/OfferSection.tsx` — 4:3 cards with hover arrow reveal, ambient corner glow, premium section header with label + divider line, richer ViewAll tile with pill CTA
- `src/components/product/ProductCard.tsx` — Fixed flickering: `transition-[border-color,box-shadow]` only (no transform transition on card), glow uses opacity-only transition, `willChange: transform` on article only
- `src/pages/ProductsPage.tsx` — Section label + divider line header, bigger stat card, gradient HR divider, better empty state with Search icon
- `src/pages/AuthPage.tsx` — Mode toggle pills (Sign In / Sign Up), `pc-cta` shimmer on submit button, cleaner alerts with status dot, better brand mark header
- `src/pages/ContactPage.tsx` — `contact-info-card` CSS class, ArrowUpRight on hover, section label + divider header, form section title/subtitle
- `src/pages/RentalCartPage.tsx` — Premium empty state with ambient glow, better page header with `text-glow` span
- `src/pages/admin/AdminLayout.tsx` — Richer layered dark background gradients, sharper header with bottom shadow, wider max-width main area

**How to apply:** This is the established design language. New pages/components should follow:
- Section headers: `section-label` + thin `h-px w-8` divider line, then `section-title` with `text-glow` accent
- Cards: use `card-surface` or `premium-card` CSS classes
- Flickering fix: use `transition-[border-color,box-shadow]` on cards, NOT `transition-all`, put `willChange: transform` on outer element only
- Ambient glows: `pointer-events-none absolute` divs with `rounded-full bg-violet-600/[0.08] blur-[120px]` for depth
