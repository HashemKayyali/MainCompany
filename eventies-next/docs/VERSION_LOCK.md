# FOUND-035 — Version Lock (ADR-16)

Locked 2026-07-11 at FOUND-001 execution. Pinned by `package-lock.json` (committed);
**major upgrades require an ADR**, minor/patch upgrades require CI green + a note here.

| Package | Locked version | Notes |
|---|---|---|
| next | **16.2.10** | current stable 16.x at execution (dist-tag `latest`) |
| react / react-dom | 19.2.4 | ships with create-next-app for Next 16 |
| next-intl | 4.13.2 | [locale] segment + `localePrefix: 'as-needed'` (ADR-03) |
| @supabase/ssr | 0.12.0 | cookie-based clients (browser + server + proxy) |
| @supabase/supabase-js | 2.110.2 | matches the Vite app's v2 line |
| zod | 4.4.3 | shared/schemas foundation |
| typescript | 5.9.3 | strict + noUncheckedIndexedAccess |
| eslint | 9.39.5 | flat config + boundary zones |
| vitest | 4.1.10 | unit/contract runner (same major as Vite repo) |
| @playwright/test | 1.61.1 | same version as the Phase-0 baseline suite |
| tailwindcss | 3.4.19 | **deliberately v3** to port the Vite token config verbatim (FOUND-025); v4 migration is its own ADR later |

## API forms locked with these versions (ADR-19 conformance)

- Cache model: `cacheComponents: true` + `'use cache'` + `cacheTag(...)` + `cacheLife('<profile>')`; profiles defined once in `next.config.ts`.
- Invalidation: **two-argument** `revalidateTag(tag, 'max')` in Route Handlers (single-argument form is deprecated — banned); `updateTag(tag)` in Server Actions for read-your-own-writes.
- Middleware convention: **`src/proxy.ts`** (the `middleware` file convention is deprecated in Next 16).
- Route-segment configs (`dynamicParams`, `revalidate`, `force-dynamic`) are incompatible with `cacheComponents` — enforced by the build itself (verified: build fails).
