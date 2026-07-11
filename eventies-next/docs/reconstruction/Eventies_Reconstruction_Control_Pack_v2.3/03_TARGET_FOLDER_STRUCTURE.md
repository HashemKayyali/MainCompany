# 03 — TARGET FOLDER STRUCTURE & IMPORT BOUNDARIES

```
src/
  app/
    [locale]/                  # next-intl dynamic segment; en = default, NO visible prefix
      (marketing)/             # /, about, contact, customers, legal
      (catalog)/               # products[/slug], categories[/slug], custom-builds, gallery
      (account)/               # profile, my-requests[/n], notifications, order-summary/[n]
      (commerce)/              # rental-cart, checkout, purchase-quote
      (auth)/                  # login, register, reset-password, update-password
      admin/                   # server-gated layout + client interior (locale-aware chrome)
      layout.tsx               # sets <html lang dir> from locale; loads messages
      not-found.tsx            # locale-aware 404
    api/forms/{contact,support,custom-build}/route.ts   # outside [locale]
    api/revalidate/route.ts
    auth/callback/route.ts     # outside [locale]; excluded from proxy matcher
    sitemap.xml/route.ts
  i18n/
    routing.ts                 # defineRouting: locales [en, ar], defaultLocale en, localePrefix 'as-needed'
    navigation.ts              # createNavigation wrappers: Link, redirect, usePathname, useRouter
    request.ts                 # getRequestConfig: message loading per locale/domain
  proxy.ts                     # Next 16 Proxy: composed per 05 §Proxy Composition (PROXY-001..008)
  features/                    # one folder per domain; UI + hooks + client logic
    catalog/  gallery/  custom-builds/  customers/
    cart/  quotes/  requests/  profile/
    chat/  notifications/  auth/  admin/{products,categories,...}
  server/                      # SERVER-ONLY (enforced by 'server-only' import)
    supabase/{server-client.ts, admin-guard.ts, session.ts}
    dal/{products.ts, categories.ts, gallery.ts, ...}   # 'use cache' + cacheTag owners (ADR-19)
    cache/{tags.ts, invalidate.ts, cache-life.ts}
    security/{turnstile.ts, rate-limit.ts, headers.ts}
    metadata/{builders.ts, jsonld.ts}
  lib/                         # isomorphic utilities (no react, no server-only)
    supabase-browser.ts  image-loader.ts  auth-routing.ts (ported sanitizer)
    format.ts  commerce.ts  media-frame.ts  errors.ts
  shared/                      # Expo-extraction-ready; framework-free
    schemas/ (Zod)  types/  contracts/ (RPC names, event names)  constants/
  components/                  # cross-feature primitives only (ui/, layout/, Bidi)
  messages/{en,ar}/*.json      # typed next-intl dictionaries, per-domain files
  styles/
```

## Locale architecture rules (V2.1 — explicit)
- **`[locale]` dynamic segment** wraps every page route; `localePrefix: 'as-needed'` renders English at unprefixed URLs (zero URL change) and Arabic under `/ar/*`.
- **Navigation only via `i18n/navigation.ts` wrappers** — raw `next/link`/`next/navigation` for page routes is a lint violation (locale would be dropped).
- **Static rendering:** localized static/ISR pages call `setRequestLocale(locale)` at the top of layout+pages so Cache Components/static generation work per locale; `generateStaticParams` yields locales where warm-up is wanted.
- **Metadata is locale-aware:** `generateMetadata` receives the locale param → builder emits per-locale title/description/canonical + hreflang pair + x-default (11).
- **not-found:** `[locale]/not-found.tsx` renders localized 404; unknown locales fall to the root 404.
- **Route Handlers live outside `[locale]`** and are excluded from the proxy matcher (PROXY-004).

## Responsibilities & import rules
| Folder | May import | Must NOT import | Runtime |
|---|---|---|---|
| `shared/` | nothing internal | features/app/server/lib/components/react/next | both, framework-free |
| `lib/` | shared | features/app/server, `server-only` | both |
| `server/` | shared, lib | features/app/components; anything client-marked | server only (`import 'server-only'` at top of every file) |
| `components/` | shared, lib | features/app/server | per-file |
| `features/X/` | shared, lib, components, own feature | **other features** (cross-feature via shared/contracts or props), server (except type-only) | mostly client |
| `app/` | everything above | — (but keeps pages thin: compose, don't implement) | per-segment |

Enforcement: ESLint `import/no-restricted-paths` zones per the table + `eslint-plugin-boundaries`; CI grep gates (QG-ARCH). `messages/` keys typed via next-intl type augmentation.

Concrete anchors: products DAL `server/dal/products.ts`; cache tags `server/cache/tags.ts` (single source of tag names); auth helpers `server/supabase/*` + `lib/supabase-browser.ts`; validation `shared/schemas/{contact,request,chat,...}.ts`; locale messages `messages/{en,ar}/{catalog,forms,admin,...}.json`; Cloudinary loader `lib/image-loader.ts`; authorization helpers `server/supabase/admin-guard.ts` (role+AAL2+recent-auth assertions).
Anti-goals honored: no global data context; no feature↔feature imports; server code cannot leak client-ward (`server-only` + zones); circular deps fail CI (madge task FOUND-019).
