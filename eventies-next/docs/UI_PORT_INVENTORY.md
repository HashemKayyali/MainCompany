# FOUND-024 — Base UI primitives port plan

Inventory of the Vite `src/components/ui/` + cross-cutting components, classified for the port. "Framework-free" here means: no router/context/data coupling — portable as-is into `components/` (client or server as marked).

| Vite component | Classification | Target | Phase |
|---|---|---|---|
| `components/ui/PageLoader` | page-coupled (route Suspense fallback) | replaced by per-segment `loading.tsx` | P2 |
| `components/ui/*` buttons/badges/cards (CVA-based) | framework-free | `components/ui/` verbatim (server-compatible) | P2 with first consumer |
| `components/AdminGuard`, `SuperAdminGuard` | REARCHITECT (client guard → server layout gate) | `app/[locale]/admin/layout.tsx` (ADMIN-001) | P6 |
| `components/ErrorBoundary` | replaced by `error.tsx` segments | done (FOUND-015) | P1 ✓ |
| `components/home/Hero` (WebGL shader) | browser-only island | `features/catalog/hero` via `next/dynamic` `ssr:false` (CAT-002) | P2 |
| `components/chat/ChatWidget` | realtime island | `features/chat/` on the subscription manager | P5 |
| `components/notifications/NotificationBell` | realtime island | `features/notifications/` | P5 |
| `components/auth/GoogleIdentityButton` | auth island | `features/auth/` | P3 |
| navbar/footer/layout chrome | REARCHITECT server shell + nav island | CAT-001 | P2 |
| `<Bidi>` (new) | done | `components/Bidi.tsx` | P1 ✓ |

Rule of thumb applied: nothing ports before its first consumer exists (phase prompt: no product pages in P1); this file is the binding list so P2+ port work starts from classification, not rediscovery.
