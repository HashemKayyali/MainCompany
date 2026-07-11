# 00 — ARCHITECTURE CONSTITUTION
Re-read this file in full before every phase. It is deliberately short. Violations are stop conditions.

## 1. Reconstruction Principle
Preserve correct **business behavior**; never preserve weak implementation. The Vite codebase is a behavioral specification, not a source of code. Every subsystem carries a classification — KEEP / HARDEN / REFACTOR / REARCHITECT / REPLACE / REMOVE — recorded in the ledgers (`14`, `15`) and the task ledger's Migration Type. Porting code classified REPLACE/REMOVE/REARCHITECT is prohibited; only KEEP/HARDEN/REFACTOR items may carry code across (see `14_PRESERVE_LEDGER.md`).
**Design-change rule (5-way, reconciled with Master Plan §3.1):** (1) product/visual design is preserved — no redesign during reconstruction; (2) architecture reconstruction is sanctioned per the ledgers; (3) security hardening is sanctioned additive; (4) performance-architecture changes are sanctioned when a budget/gate requires them; (5) intentional UX changes require ⛔ human approval and are logged.

## 2. Server/Client Rules
- Server Components are the default for every route segment. A component becomes a Client Component only for: state/effects, browser APIs, event handlers, realtime subscriptions, animation.
- `'use client'` at a **page or layout root merely to make ported code compile is prohibited** (exception: the admin interior, ruled ADR-04). Extract islands instead.
- Browser-only libraries (`three`, `cobe`, `@paper-design/shaders-react`, lightbox, framer-heavy sections) load via `next/dynamic` with `ssr: false` inside a client island — never imported by a server module.
- Providers: no provider wraps the app unless every route needs it. Target global providers: Theme, Intl, Toast, Supabase-browser-context. Cart/Quote providers mount only on their route group. The 14-deep legacy tree is not recreated.
- Data fetching: server data enters via RSC/loaders; client components receive data as props or fetch **personal/realtime** data only. A client component must never fetch public catalog data (that domain is server-owned — `06`).

## 3. Trust Boundaries (verbatim, non-negotiable)
UI visibility ≠ authorization. Proxy (proxy.ts) ≠ authorization. Layout gate ≠ authorization — layouts are early screens; every sensitive operation enforces at its trusted boundary (05 §Destructive-Operation Boundary Matrix). Valid session ≠ permission. Server rendering ≠ authorization. TypeScript type ≠ runtime validation. Client validation ≠ trusted validation. A successful build ≠ production readiness. The authoritative layer for any operation is the deepest layer that can still see the full context: RLS/RPC for data-shape rules; Route Handler/Edge Function for cross-system rules (Turnstile, Cloudinary, cache revalidation). Every privileged mutation re-authorizes at its own boundary.

## 4. Data Ownership
One owner per data domain (`06_DATA_AND_CACHE_CONSTITUTION.md` is the registry). Prohibited: a browser cache and a Next cache for the same catalog data; duplicated fetch ownership; module-level demo/fallback data as a silent source of truth. Any fetch that reads cookies/session is `no-store` by construction (CI-enforced grep gate, QG-ARCH-3).
**Database-change policy (reconciled with Master Plan §3.2):** no framework-driven database churn; database changes are allowed only when they enforce justified business, integrity, security, localization, or reliability requirements — additive, DBMIG-piped, human-gated, frozen-Vite-compatible until P7.

## 5. Temporary Bridges
Default is zero bridges. Every bridge must be registered in `16_TEMPORARY_BRIDGE_LEDGER.md` with reason, owner, creation phase, removal phase, fallback, and a test. Unregistered compatibility code is a stop condition. Currently sanctioned: BRIDGE-01 (auth session adoption) only.

## 6. AI Coding Rules
Code is not accepted because it compiles, looks right, or passes the happy path. Every critical implementation is reviewed against: correctness, security, failure behavior, race conditions, duplication, performance, observability, testability, accessibility, and RTL/LTR where applicable. Every task's Acceptance Criteria and Tests in the ledger are the definition of done — not the diff.

## 7. Freeze Rule
The Vite app is bugfix-only from Phase 0 until decommission. The only sanctioned Vite-side changes: the two P0 exceptions (compress `public/images/og-default.png`; align `index.html` meta copy) and genuine production bugfixes, each logged.

## 8. Conflict Resolution
If any instruction here conflicts with a phase prompt or specialized constitution, this file wins; below it, `17_DECISION_LOG.md`; below that, the specialized constitution. Record any newly needed ruling as a Decision Log entry before proceeding.
