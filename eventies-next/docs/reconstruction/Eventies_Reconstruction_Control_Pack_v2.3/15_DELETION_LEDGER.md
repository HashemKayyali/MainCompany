# 15 — DELETION LEDGER
Everything here dies; none of it may be ported. Verification runs in the phase listed; DEL tasks in the ledger mirror these rows.

| ID | Current path (verified) | Reason | Replacement | Phase | Prerequisite | Verification after deletion |
|---|---|---|---|---|---|---|
| DEL-01 | scripts/prerender-seo.mjs (654 LOC) + build hook in package.json | build-time SEO coupling | generateMetadata + ISR | P7 | P2 parity gate passed | build has no prerender step; head parity still green |
| DEL-02 | DocumentI18nBridge + observer machinery in src/contexts/LanguageContext.tsx | DOM-rewrite translation engine (banned, 08) | next-intl | P7 (never ported from P1) | I18N tasks done | grep: no MutationObserver i18n in new repo; AR E2E green |
| DEL-03 | applyNaturalTextDirections (same file) | global heuristic dir mutation | scoped `<Bidi>` | P7 | Bidi shipped | RTL snapshots green |
| DEL-04 | src/lib/i18n.ts phrase dictionary + translateVisibleText | phrase-matching translation | typed dictionaries (extracted first) | P7 | I18N-004 extraction complete | key-coverage CI green |
| DEL-05 | src/data/defaults.ts (+DEFAULT_* consumers), demo fallbacks in DataContext | silent fake data source | none (server-owned catalog) | P7 | P2 cutover | E2E: Supabase-down → last-good ISR HTML, never demo data |
| DEL-06 | dual-storage adapter + bl-auth-persistence in src/lib/supabase.ts | cookie sessions replace it | @supabase/ssr clients | P7 | BRIDGE-01 removal trigger | no sb-* localStorage writes from new app |
| DEL-07 | src/hooks/usePageMeta.ts | client meta mutation | generateMetadata | P7 | P2 | grep clean |
| DEL-08 | src/contexts/DataContext.tsx (1,352 LOC) incl. localStorage snapshot cache | double-cache-owner (ADR-07) | server DAL + no-store personal fetches | P7 | P2/P4 cutovers | localStorage has no catalog snapshot key |
| DEL-09 | uuid-suffixed channel names (chat.service.ts:203, notifications.service.ts:134, AdminChatsPage.tsx:149) | churn + duplicate joins | stable names + subscription manager | P5 (in new code), legacy dies P7 | 09 protocol shipped | leak test green |
| DEL-10 | src/utils/lazyWithRetry.ts + clearChunkReloadFlag in App.tsx | Vite-chunk-failure workaround | Next segment error handling | P7 | — | grep clean |
| DEL-11 | src/hooks/useRateLimit.ts (client cosmetic limiter) | false sense of control | server abuse gates (05) | P7 | P3 forms live | ContactForm has no client limiter |
| DEL-12 | manualChunks vendor map in vite.config.ts (+ whole Vite build) | Vite-specific | Next build | P7 | full cutover | Vite project archived |
| DEL-13 | public/images/hero-bg-event.png (1.2 MB, webp twin exists) | duplicate heavy asset | .webp twin | P0 | reference grep proves .png unreferenced | site renders; 404 monitor clean |
| DEL-14 | SessionContext 7s-timeout + ref-stability workarounds | replaced by server session | server session + AUTH-006 regression test | P7 | test encodes the modal-survival behavior | test green in new app |
