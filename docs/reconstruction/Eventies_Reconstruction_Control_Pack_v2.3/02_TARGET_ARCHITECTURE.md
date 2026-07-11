# 02 — TARGET ARCHITECTURE

## System diagram
```
                    ┌────────────────────────── Vercel ──────────────────────────┐
Browser ── HTML ──▶ │ CDN (ISR pages, tag-invalidated)                            │
  │                 │  Next App Router                                            │
  │  client islands │   ├─ RSC (ISR+tags): /, /products, /products/[slug],       │
  │  (cart, chat,   │   │   /categories[/slug], /gallery, /custom-builds,        │
  │  auth forms,    │   │   /customers, legal, and /ar/** twins                   │
  │  lightbox,      │   ├─ DYN (no-store): /my-requests*, /order-summary/*,      │
  │  admin interior)│   │   /profile, /notifications, /rental-cart, /checkout     │
  │                 │   ├─ Server layouts: session gate ▸ admin role+MFA gate     │
  │                 │   ├─ Route Handlers: /auth/callback, /sitemap.xml,          │
  │                 │   │   /api/forms/{contact,support,custom-build},            │
  │                 │   │   /api/revalidate                                       │
  │                 │   └─ middleware: cookie refresh + locale negotiation ONLY   │
  ├── direct ─────▶ Supabase: Postgres (RLS, RPC contracts, triggers, DB limits)  │
  │  (personal reads,├─ Auth (cookie sessions via @supabase/ssr; TOTP MFA admins) │
  │  RPC mutations, ├─ Realtime postgres_changes (stable channels, reducers)      │
  │  realtime)      └─ Edge Fn: cloudinary-assets (sign+quota+constraints, del)   │
  └── direct ─────▶ Cloudinary CDN (custom loader: c_limit,w,f_auto,q_auto)       │
                    Legacy images: Supabase Storage render API (read-only estate) │
Observability: Sentry + Vercel Vitals + app_events                 Future: Expo ─┤
                                                       consumes RPCs + /api/forms │
```

## Rendering registry
| Route group | Model | Cache | Auth gate |
|---|---|---|---|
| Marketing + catalog (+/ar twins) | RSC | ISR, tags per `06`, TTL backstop | none |
| Legal (+301 aliases) | RSC static | 24h | none |
| Auth pages | client islands in server shell | no-store | none (noindex) |
| Cart/checkout/quote | client (draft state) | no-store | session (checkout submit) |
| My-requests / order-summary / profile / notifications | server fetch + client details | no-store | session layout |
| Admin | server shell (role+MFA) → client interior (ADR-04) | no-store | role+AAL2 layout |
| 404 / deleted product | `notFound()` → real 404 | — | — |

## Ten data flows (target)
1. **Public product request (anon page view):** CDN serves ISR HTML → RSC had fetched via server Supabase client (anon) → tags attached → islands hydrate; no client catalog fetch ever.
2. **Authenticated personalized read:** proxy refreshes cookies → server layout verifies session via `getClaims()` + role from `profiles` (ADR-20; `getUser()` only where the fresh Auth record is required) → per-request fetch `no-store` → props to client detail components.
3. **Login:** client form (Zod mirror) → supabase-js `signInWithPassword` via browser client → cookies set by ssr client → next navigation: `getClaims()` session verify + role from `profiles` (ADR-20) → audit event.
4. **Google OAuth:** login page builds sanitized redirect (locale-aware) → Supabase OAuth → `/auth/callback` Route Handler `exchangeCodeForSession` (used-code → existing-session fallback) → 303 to safe path.
5. **Public form:** client POST `/api/forms/contact` → Zod parse → Turnstile verify (server) → insert with anon-scoped server client → DB rate limit backstop → typed error map → event.
6. **Rental request:** client → direct RPC (forced contract) with idempotency key column → advisory-lock approval path unchanged → journey read no-store.
7. **Admin product edit:** admin client → service (RLS) → on success POST `/api/revalidate {tags}` → failure → UI warning + retry + ≤1h TTL self-heal (ADR-07) → audit diff via logs.service.
8. **Cache invalidation:** `/api/revalidate` verifies admin session → `revalidateTag` per `06` graph → event logged.
9. **Image upload:** admin → Edge Fn `sign-upload` (JWT→is_admin→quota→**authorizes approved upload preset + whitelisted folder**; preset enforces `allowed_formats`/`max_file_size` server-side per ADR-21; no client-supplied security params are signed) → direct POST Cloudinary → secure_url persisted → identity layer (KEEP) → failed/oversized upload = Cloudinary rejects, no DB row, no orphan → GC covers stragglers.
10. **Chat send + reconciliation:** client generates uuid message id → optimistic append → direct insert (id column, unique) → realtime echo hits idempotent reducer keyed by id → duplicate = no-op; reconnect → refetch since watermark → replay (`09`).

## Boundaries for Expo (future)
Stable surface: Supabase RPCs, `/api/forms/*`, Edge Fn, `src/shared/{schemas,types,contracts}`. Never shared: React tree, next-intl runtime, image loader, contexts.
