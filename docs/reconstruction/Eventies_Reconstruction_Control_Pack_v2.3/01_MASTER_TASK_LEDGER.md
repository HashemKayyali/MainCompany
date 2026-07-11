 BLOCKED:owner decision (recommendation drafted in PHASE_01B_REPORT) | BLOCKED:ROUTE-010 gate (measurement plan in RUNBOOKS.md) | BLOCKED:ROUTE-010 gate | BLOCKED:ROUTE-010 gate | BLOCKED:ROUTE-010 gate | BLOCKED:ROUTE-010 gate (runbook + instrument ready) | BLOCKED:ROUTE-010 gate | BLOCKED:ROUTE-010 gate | BLOCKED:ROUTE-010 gate | IN_PROGRESS:route authored (noindex); preview run gated on ROUTE-010 | IN_PROGRESS:snippet+unit layer done; preview acceptance gated on ROUTE-010 | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | IN_PROGRESS:file authored+review-ready; staging apply blocked by DBMIG-002 | BLOCKED:owner action (3 options in DBMIG_PIPELINE.md) | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | BLOCKED:NOT PASSED - P1B gate closed (docs/ROUTE_TOPOLOGY.md) | BLOCKED:needs Vercel access (specs drafted) | BLOCKED:needs Vercel access (specs drafted) | BLOCKED:needs Vercel access (specs drafted) | BLOCKED:needs Vercel access (specs drafted) | BLOCKED:needs Vercel access (specs drafted) | BLOCKED:needs Vercel access (specs drafted) | BLOCKED:needs Vercel access (specs drafted) | BLOCKED:needs Vercel access (specs drafted) | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | BLOCKED:staging DB (harness committed, env-gated) | BLOCKED:staging DB (harness committed, env-gated) | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | IN_PROGRESS:products/categories ported w/ injection; rest deferred to owning phases (P1 report) | BLOCKED:needs SENTRY_DSN for the live test event (code + redaction test DONE) | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | BLOCKED:needs a live preview-deployment URL | DONE | DONE | DONE | BLOCKED:dashboard rate-limit/MFA values (public GoTrue settings captured in 19) | DONE | DONE | DONE | DONE | DONE | BLOCKED:needs GSC access (runbook committed) | BLOCKED:needs operator prod-login session (runbook committed) | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE | DONE |# 01 — MASTER TASK LEDGER
The project progress tracker. Claude Code updates Status per task (TODO / IN_PROGRESS / DONE / BLOCKED:reason) in the same PR as the work.

## Ledger legend (field semantics — applies to every row)
- **Type** = Migration Type: KEEP / HARDEN / REFACTOR / REARCHITECT / REPLACE / REMOVE / NEW.
- **Risk**: L/M/H. **Flags**: S=security-critical, E=SEO-critical, P=performance-critical, D=data-integrity-critical.
- **Deps** = blocking dependencies (task may not start until all DONE). Phase prereqs from `04` apply implicitly.
- **Acceptance** is abbreviated; the governing detail lives in the referenced constitution section. **Tests** reference `18_TEST_MASTER_MATRIX.md` IDs or describe new ones.
- **Current Evidence** default: the audited Vite repo path named in the title/notes; **Expected Files/Areas** default: the target paths named in the title + the governing constitution section; **Rollback** default per phase = the phase rollback checkpoint (`04`); group-specific rollback noted in group headers.
- **Status** column is the single source of truth for progress: TODO / IN_PROGRESS / DONE / BLOCKED:<reason>. Claude Code updates it in the same PR as the work.
- V2.1: Phase and Domain are now explicit columns; new groups ENV/ROUTE/PROXY/DBMIG/ARB/A11Y appended below; over-broad wave tasks split.

## Summary
```
Total tasks: 347
By phase: P0:26 · P1:59 · P1/P2:28 · P1B:11 · P2:81 · P3:33 · P4:22 · P5:18 · P6:33 · P7:18 · cross:17
By risk: H:83 · M:199 · L:65
Critical path: BASE-001→FOUND-001→FOUND-010→PROXY-008→ROUTE-010→AUTHP-009/010 (auth track) ∥ DATA-001→CACHE-005→CAT-007→SEO-014→CUT-002 (EN public) ∥ DBMIG-004→ARB-010 (/ar launch)
Security-critical (S): 111 · SEO-critical (E): 64 · Data-integrity-critical (D): 68
Status source of truth: the Status column below (all initialize TODO)
```

---
## BASE — Phase 0: Baseline & Safety Net (rollback: none needed — no prod change; evidence: prod deployment + Vite repo)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| BASE-001 | P0 | baseline | Repo health check: install, typecheck, build, run existing 17 test files | KEEP | L | — | — | all green; report committed | existing suite | TODO |
| BASE-002 | P0 | baseline | Route inventory reconciliation: extract all 51 router entries + vercel.json rewrites/headers into versioned JSON | NEW | L | E | BASE-001 | JSON matches src/router.tsx exactly | manual diff | TODO |
| BASE-003 | P0 | baseline | SEO baseline capture script: curl every public route (prod), extract title/desc/canonical/robots/OG/Twitter/JSON-LD → JSON | NEW | M | E | BASE-002 | baseline committed; script rerunnable | script self-test | TODO |
| BASE-004 | P0 | baseline | Performance baseline: Lighthouse JSON on /, /products, one product, /gallery ×(mobile,desktop) + bundle-size report | NEW | M | P | BASE-001 | baselines committed; budget file drafted | — | TODO |
| BASE-005 | P0 | baseline | Security-header baseline: curl -I prod for HSTS/XFO/nosniff/referrer/X-Robots on noindex list | NEW | L | S | — | log committed | — | TODO |
| BASE-006 | P0 | baseline | Environment inventory: all env keys ×(local, preview, prod names), flags incl. VITE_IMAGE_TRANSFORMATIONS_ENABLED prod value | NEW | M | S | — | 19-matrix populated | — | TODO |
| BASE-007 | P0 | baseline | Existing-test inventory + gap notes vs 18-matrix | NEW | L | — | BASE-001 | mapping table committed | — | TODO |
| BASE-008 | P0 | baseline | Playwright E2E skeleton against Vite prod build (runner, fixtures, auth helper, ar/en projects, mobile/desktop) | NEW | M | — | BASE-001 | skeleton runs green with 2 sample specs | E skeleton | TODO |
| BASE-009 | P0 | baseline | SAN-01: redirect sanitizer unit tests (//evil.com, /\evil, scheme, /login loop) | NEW | M | S | BASE-001 | tests green against src/lib/auth-routing.ts | SAN-01 | TODO |
| BASE-010 | P0 | baseline | AU-RS: encode TOKEN_REFRESHED reference-stability (modal survives) as regression test | NEW | H | S | BASE-008 | test green vs current SessionContext behavior | AU-RS | TODO |
| BASE-011 | P0 | baseline | RD-01 prep: extract notification reducer test patterns into reusable harness for chat | NEW | M | D | BASE-001 | harness runs existing reducer cases | RD-01 | TODO |
| BASE-012 | P0 | baseline | Realtime behavior capture: document current sub lifecycle (5 sites), echo/dedup behavior observed at runtime | NEW | M | D | BASE-008 | findings appended to 09 as evidence notes | manual | TODO |
| BASE-013 | P0 | baseline | Chat optimistic/dedup runtime probe: does echo duplicate today? | NEW | M | D | BASE-012 | answer recorded (drives CHAT-002 urgency) | manual | TODO |
| BASE-014 | P0 | baseline | Prod behavior capture: OAuth happy path, refresh-mid-callback, remember-me on/off — raw recordings stay in PRIVATE storage; git gets a sanitized redacted summary only | NEW | M | S | BASE-008 | sanitized MD summary committed; raw evidence access-controlled, never in git | manual | TODO |
| BASE-015 | P0 | baseline | GSC/analytics baseline: derived non-sensitive metrics (counts, coverage states, top-query themes) committed; raw exports stay in private storage | NEW | L | E | — | sanitized metrics MD committed; raw export never in git | — | TODO |
| BASE-016 | P0 | baseline | Freeze declaration: freeze rule (Constitution §7) posted; Vite branch protection notes | NEW | L | — | — | freeze documented | — | TODO |
| BASE-017 | P0 | baseline | P0 exception: compress public/images/og-default.png → ≤100 KB 1200×630 (Vite) | HARDEN | L | E,P | — | file ≤100 KB; social preview verified | manual share test | TODO |
| BASE-018 | P0 | baseline | P0 exception: align index.html meta copy with prerender STATIC_PAGES copy (Vite) | HARDEN | L | E | BASE-003 | drift removed; baseline re-captured | BASE-003 rerun | TODO |
| BASE-019 | P0 | baseline | DEL-13 verification: grep references to hero-bg-event.png; delete if unreferenced (Vite public/) | REMOVE | L | P | — | grep proof + deletion or KEEP note | 404 monitor | TODO |
| BASE-020 | P0 | baseline | Sitemap runtime verification: curl prod /sitemap.xml; validate XML; diff URL set vs DB | KEEP | L | E | — | valid; URL set recorded as baseline | — | TODO |
| BASE-021 | P0 | baseline | Supabase dashboard settings capture: auth rate limits, email confirm, MFA availability, region — values transcribed (no screenshots with project secrets/IDs beyond the already-public ref) | NEW | M | S | — | redacted values recorded in 19/05; no raw dashboard screenshots in git | — | TODO |
| BASE-022 | P0 | baseline | ROLL-01 prep: document current vercel.json rewrite state as restorable artifact | NEW | L | — | BASE-002 | restore artifact committed | ROLL-01 later | TODO |

## FOUND — Phase 1: Foundation (evidence: new repo; rollback: delete app dir / revert PR)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| FOUND-001 | P1 | foundation | Create Next.js 16 App Router project — current tested stable 16.x line (TS strict, src layout per 03; exact patch verified + version-locked at execution per ADR-16) | NEW | M | — | BASE-001 | builds; structure matches 03 | build | TODO |
| FOUND-002 | P1 | foundation | TypeScript config: strict, noUncheckedIndexedAccess review, path aliases | NEW | L | — | FOUND-001 | tsc clean | QG-ARCH-1 | TODO |
| FOUND-003 | P1 | foundation | ESLint: core + import-boundary zones per 03 + logical-CSS rule (08) | NEW | M | — | FOUND-001 | deliberate violation fails | QG-ARCH-2 | TODO |
| FOUND-004 | P1 | foundation | Prettier/format + editorconfig | NEW | L | — | FOUND-001 | CI formatted | — | TODO |
| FOUND-005 | P1 | foundation | CI pipeline (GitHub Actions): typecheck, lint, unit, contract, build, boundary+madge, import-graph audit | NEW | M | S | FOUND-002..004 | all jobs green; failure blocks merge | QG universal | TODO |
| FOUND-006 | P1 | foundation | Vitest setup in new repo; port the 17 preserved test files that are framework-free | KEEP | M | D | FOUND-005 | preserved tests green | existing suite | TODO |
| FOUND-007 | P1 | foundation | `server-only` enforcement scaffold: server/ tree with marker imports | NEW | L | S | FOUND-001 | grep gate QG-ARCH-3 wired | QG-ARCH-3 | TODO |
| FOUND-008 | P1 | foundation | Supabase browser client (`lib/supabase-browser.ts`, @supabase/ssr) | REARCHITECT | M | S | FOUND-001 | singleton; cookie storage; typed Database | unit | TODO |
| FOUND-009 | P1 | foundation | Supabase server client + session helpers (`server/supabase/`) | NEW | M | S | FOUND-007 | per-request client; identity helpers per ADR-20 (getClaims default; getUser only where fresh record required) | unit | TODO |
| FOUND-010 | P1 | foundation | next-intl plugin: as-needed prefix, [locale] segment per 03, proxy locale negotiation, cookie | NEW | H | E | FOUND-001 | /ar hello SSR lang/dir correct | AR-DL smoke | TODO |
| FOUND-011 | P1 | foundation | Typed messages foundation: per-domain JSON split, type augmentation | NEW | M | — | FOUND-010 | typed keys compile-checked | I18N-COV | TODO |
| FOUND-012 | P1 | foundation | proxy.ts (Next 16 Proxy): composed per PROXY-001..008 — Supabase cookie refresh + next-intl negotiation ONLY (no auth logic) | NEW | M | S | FOUND-009, FOUND-010, PROXY-001 | composition per 05 §Proxy; code review vs Constitution §3 | PROXY-INT | TODO |
| FOUND-013 | P1 | foundation | Security headers report-only (05 CSP + set) via next.config/headers | NEW | M | S | FOUND-001 | present on preview; violations logged | QG-P1 | TODO |
| FOUND-014 | P1 | foundation | Zod foundation: `shared/schemas` package layout + error-map i18n | NEW | M | S | FOUND-011 | sample schema + typed errors | unit | TODO |
| FOUND-015 | P1 | foundation | Error-handling foundation: root error.tsx, not-found.tsx, typed error utils (port lib/errors) | REFACTOR | L | — | FOUND-001 | segment errors render | E sample | TODO |
| FOUND-016 | P1 | foundation | Observability foundation: Sentry (scrubbed), app_events table migration FILE + track() util, Vercel analytics | NEW | M | S | FOUND-005 | test event visible; PII redaction test green | redaction unit | TODO |
| FOUND-017 | P1 | foundation | Services port with client injection: copy src/services/*, inject SupabaseClient param, keep signatures | REFACTOR | H | D | FOUND-008, FOUND-009 | signatures unchanged; both clients work | CT-RPC subset | TODO |
| FOUND-018 | P1 | foundation | shared/contracts: RPC names, event names, tag names re-exported constants | NEW | L | — | FOUND-017 | single source; grep no string dupes | unit | TODO |
| FOUND-019 | P1 | foundation | madge circular-dependency gate in CI | NEW | L | — | FOUND-005 | zero cycles | QG-ARCH-2 | TODO |
| FOUND-020 | P1 | foundation | `server/cache/tags.ts` + `server/cache/revalidate.ts` skeleton | NEW | M | D | FOUND-007 | tag constants match 06 | unit | TODO |
| FOUND-021 | P1 | foundation | `/api/revalidate` Route Handler: admin session check + tag revalidation + event | NEW | M | S,D | FOUND-020, FOUND-009 | non-admin 403; tags revalidate | I | TODO |
| FOUND-022 | P1 | foundation | Cloudinary loader `lib/image-loader.ts` wrapping ported toCloudinaryTransformUrl | KEEP→REFACTOR | M | P | FOUND-001 | URL output identical to legacy builder | image-variants tests ported | TODO |
| FOUND-023 | P1 | foundation | `<Bidi>` component (scoped natural-direction) + dir=auto input primitives | REARCHITECT | M | — | FOUND-010 | unit: AR/EN/mixed strings | unit | TODO |
| FOUND-024 | P1 | foundation | Base UI primitives port plan: identify components/ui items that are framework-free vs page-coupled | NEW | M | — | FOUND-001 | inventory list committed | — | TODO |
| FOUND-025 | P1 | foundation | Tailwind config port (tokens, fonts, animations) + logical-property audit of ported CSS | REFACTOR | M | — | FOUND-001 | visual smoke on sample page | RTL-V prep | TODO |
| FOUND-026 | P1 | foundation | Fonts: self-host or keep Google Fonts via next/font (decide; preserve Alexandria/Sora) | REFACTOR | L | P | FOUND-001 | no FOUT regression vs baseline | PERF | TODO |
| FOUND-027 | P1 | foundation | CT-RLS harness: branch-DB RLS probe suite (anon/user/admin per table) | NEW | H | S,D | FOUND-005 | matrix green vs current policies | CT-RLS | TODO |
| FOUND-028 | P1 | foundation | CT-RPC suite: request/quote/notification/admin RPC contract tests (extend existing pattern) | NEW | H | D | FOUND-017 | contracts locked | CT-RPC | TODO |
| FOUND-029 | P1 | foundation | I18N key-coverage CI check (convert legacy audit scripts) | REFACTOR | M | E | FOUND-011 | missing key fails CI | I18N-COV | TODO |
| FOUND-030 | P1 | foundation | E2E projects in new repo: en/ar × mobile/desktop, preview target wiring | NEW | M | — | FOUND-005, BASE-008 | sample specs green on preview | E | TODO |
| FOUND-031 | P1 | foundation | Env schema validation at boot (server): fail-fast on missing keys | NEW | L | S | FOUND-014 | boot fails loudly on gap | unit | TODO |
| FOUND-032 | P1 | foundation | Decide + implement fonts/preconnects parity (Supabase, Cloudinary preconnect port) | KEEP | L | P | FOUND-026 | preconnects present | PERF | TODO |
| FOUND-033 | P1 | foundation | Rate-limit module interface `server/security/rate-limit.ts` (config-driven, 05 calibration fields; storage adapter per ADR-18 — NO process-memory counters) | NEW | M | S | FOUND-009 | thresholds in one module | unit | TODO |
| FOUND-034 | P1 | foundation | Turnstile server verify util `server/security/turnstile.ts` | NEW | M | S | FOUND-031 | verifies test token; fails closed | unit | TODO |

## AUTHP — Phase 1B: Auth Compatibility Prototype (rollback: preview-only; evidence: 07 §P1B)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| AUTHP-001 | P1B | auth-proto | Bridge snippet v0: legacy token read (both storages) → setSession → verify identity | NEW | H | S | FOUND-008, ROUTE-010 | works on preview with a real legacy session | AU-BR | TODO |
| AUTHP-002 | P1B | auth-proto | /bridge-test route + one protected Next page | NEW | M | S | AUTHP-001 | authenticated render post-bridge | AU-BR | TODO |
| AUTHP-003 | P1B | auth-proto | Q1–Q2 evidence: no unwanted logout; correct cookie session incl. remember-me inference | NEW | H | S | AUTHP-002 | recorded evidence | AU-BR | TODO |
| AUTHP-004 | P1B | auth-proto | Q3/Q7 evidence: return to Vite route mid-strangler + rollback → legacy session intact (keys untouched) | NEW | H | S | AUTHP-002 | recorded evidence | AU-BR | TODO |
| AUTHP-005 | P1B | auth-proto | Q4 evidence: expired refresh token → soft signed-out, no loop | NEW | M | S | AUTHP-001 | recorded | AU-BR | TODO |
| AUTHP-006 | P1B | auth-proto | **Q5 measurement: dual-tab (Vite+Next) refresh rotation behavior** | NEW | H | S | AUTHP-002 | measured, not reasoned; verdict written | AU-BR | TODO |
| AUTHP-007 | P1B | auth-proto | Q6 evidence: setSession failure → logged-out page + event + next-visit retry | NEW | M | S | AUTHP-001 | recorded | AU-BR | TODO |
| AUTHP-008 | P1B | auth-proto | Q8 answer: legacy-key removal spec → BRIDGE-01 removal section finalized | NEW | M | S | AUTHP-003..007 | 16-ledger updated | — | TODO |
| AUTHP-009 | P1B | auth-proto | P1B verdict report + ADR amendment if Q5 fails (atomic auth-surface fallback) | NEW | H | S | AUTHP-006 | QG-P1B pass/fail recorded | — | TODO |

## I18N — i18n build-out (P1 foundation → P2 content) (evidence: src/lib/i18n.ts, LanguageContext)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| I18N-001 | P1/P2 | i18n | Locale routing E2E baseline: /ar variants of P2 route list resolve | NEW | M | E | FOUND-010 | routes render both locales | AR-DL | TODO |
| I18N-002 | P1/P2 | i18n | hreflang + og:locale(:alternate) in metadata builder | NEW | M | E | FOUND-010 | pairs + x-default emitted | SEO-PAR | TODO |
| I18N-003 | P1/P2 | i18n | Language switcher component (URL navigate + cookie) | NEW | L | — | FOUND-010 | switch preserves deep path | AR-SW | TODO |
| I18N-004 | P1/P2 | i18n | Extraction script: legacy phrase dict → keyed corpus (en/ar JSON drafts) | REPLACE | H | E | FOUND-011 | ≥95% phrases mapped; report of leftovers | script test | TODO |
| I18N-005 | P1/P2 | i18n | Domain dictionaries: common+catalog+forms curated from extraction | REPLACE | M | E | I18N-004 | key-coverage green for P2 scope | I18N-COV | TODO |
| I18N-006 | P1/P2 | i18n | Dictionaries: auth+account | REPLACE | M | — | I18N-004 | coverage green P3/P4 scope | I18N-COV | TODO |
| I18N-007 | P1/P2 | i18n | Dictionaries: chat+notifications | REPLACE | M | — | I18N-004 | coverage green P5 scope | I18N-COV | TODO |
| I18N-008 | P1/P2 | i18n | Dictionaries: admin | REPLACE | M | — | I18N-004 | coverage green P6 scope | I18N-COV | TODO |
| I18N-009 | P1/P2 | i18n | Migration FILES: `*_ar` columns (products, categories, custom_builds+cats, gallery album titles) — additive, nullable | NEW | H | E,D | DBMIG-001 | files reviewed; frozen-Vite compatible; NOT executed by Code | migration review checklist | TODO |
| I18N-010 | P1/P2 | i18n | DAL locale-aware selects with EN fallback (coalesce pattern) | NEW | M | E | DBMIG-004, DATA-001 | AR page shows AR when present, EN fallback | AR-DL | TODO |
| I18N-011 | P1/P2 | i18n | AR-coverage report tooling: count null `_ar` per entity (admin dashboard tile later) | NEW | L | — | I18N-009 | report runs; feeds R-06 | — | TODO |
| I18N-012 | P1/P2 | i18n | Logical-CSS sweep of ported components (ms/me/ps/pe/text-start) | REFACTOR | M | — | FOUND-025 | lint rule green; RTL snapshots pass | RTL-V | TODO |
| I18N-013 | P1/P2 | i18n | Direction-sensitive icon/gesture utilities (rtl: variants; swipe from locale) | REARCHITECT | M | — | FOUND-023 | lightbox/carousel spec green in RTL | RTL-G | TODO |
| I18N-014 | P1/P2 | i18n | OAuth locale preservation through sanitized redirect | NEW | M | S | AUTH-004 | /ar login → callback lands /ar/... | AU-FLOWS | TODO |
| I18N-015 | P1/P2 | i18n | Arabic typography check: line-height/heading scale on 6 templates | NEW | L | — | I18N-005 | snapshots approved | RTL-V | TODO |
| I18N-016 | P1/P2 | i18n | `<Bidi>` adoption pass: product names in AR pages, chat bubbles, inputs | REARCHITECT | M | — | FOUND-023 | mixed-content renders correctly | unit+V | TODO |
| I18N-017 | P1/P2 | i18n | messages loading strategy: per-locale per-domain split (no ar in en bundle) | NEW | M | P | FOUND-011 | bundle report shows split | PERF | TODO |
| I18N-018 | P1/P2 | i18n | 404/error pages localized | NEW | L | — | FOUND-015 | both locales | E | TODO |
| I18N-019 | P1/P2 | i18n | Legal docs locale strategy decision + implementation (static MD per locale vs DB) | NEW | L | E | CAT-017 | decision logged; pages render | SEO-PAR | TODO |
| I18N-020 | P1/P2 | i18n | Admin forms AR fields (name_ar, description_ar...) wiring | NEW | M | E | I18N-009, ADMIN-006 | AR editable; saved; rendered on /ar | I | TODO |

## DATA/CACHE — server data layer (P1→P2) (evidence: DataContext, services)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| DATA-001 | P1/P2 | data | DAL: products (list, bySlug, featured) with tags | NEW | M | D | FOUND-017, FOUND-020 | RSC-usable; tags attached | I | TODO |
| DATA-002 | P1/P2 | data | DAL: categories (+bySlug) | NEW | M | D | DATA-001 | same | I | TODO |
| DATA-003 | P1/P2 | data | DAL: parts byProduct | NEW | L | — | DATA-001 | same | I | TODO |
| DATA-004 | P1/P2 | data | DAL: custom builds + categories | NEW | L | — | FOUND-020 | same | I | TODO |
| DATA-005 | P1/P2 | data | DAL: customers wall | NEW | L | — | FOUND-020 | same | I | TODO |
| DATA-006 | P1/P2 | data | DAL: gallery albums | NEW | M | P | FOUND-020 | list server-side; images meta incl. dimensions | I | TODO |
| DATA-007 | P1/P2 | data | DAL: legal docs | NEW | L | — | — | — | I | TODO |
| DATA-008 | P1/P2 | data | Personal fetchers: requests/quotes/profile (server, no-store) | NEW | M | D | FOUND-009 | no-store verified | CACHE-AB | TODO |
| CACHE-001 | P2 | cache | Tag wiring per 06 graph on all DAL reads | NEW | M | D | DATA-001..006 | tags match constants | I | TODO |
| CACHE-002 | P2 | cache | TTL backstops per 06 on every cached segment | NEW | M | D | CACHE-001 | revalidate values reviewed | I | TODO |
| CACHE-003 | P2 | cache | Invalidation integration tests per entity (edit→tag→fresh) | NEW | H | D | FOUND-021, CACHE-001 | ADM-INV green | ADM-INV | TODO |
| CACHE-004 | P2 | cache | QG-ARCH-3 grep gate implementation in CI | NEW | M | S | FOUND-005 | violation fails CI | QG-ARCH-3 | TODO |

## CAT — Phase 2: Public catalog pages (evidence: src/pages/*; rollback: Group A rewrite restore)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| CAT-001 | P2 | catalog | Layout shell: PageContainer/header/footer rebuilt (server) + nav island | REARCHITECT | M | P | FOUND-025 | visual parity approved | V | TODO |
| CAT-002 | P2 | catalog | Home hero (WebGL) as ssr:false island; fallback static hero | REARCHITECT | M | P | CAT-001 | no SSR crash; LCP budget | PERF-SL | TODO |
| CAT-003 | P2 | catalog | Home: categories + featured-products sections (RSC via DAL) | REARCHITECT | M | E,P | DATA-001, DATA-002 | parity + budgets | SEO-PAR | TODO |
| CAT-004 | P2 | catalog | Home gallery strip (server data, lazy images) | REARCHITECT | M | P | DATA-006 | budgets | PERF | TODO |
| CAT-005 | P2 | catalog | /products listing RSC + filter state → URL params | REARCHITECT | H | E,P | DATA-001 | filters shareable via URL | E | TODO |
| CAT-006 | P2 | catalog | Product card component (next/image + loader, sizes per grid) | REARCHITECT | M | P | FOUND-022 | ≤90 KB target; W/H set | IMG | TODO |
| CAT-007 | P2 | catalog | /products/[slug] RSC + generateStaticParams + ISR | REARCHITECT | H | E,P,D | DATA-001 | detail parity; tags | SEO-PAR | TODO |
| CAT-008 | P2 | catalog | Product detail gallery + thumbnails (islands) | REARCHITECT | M | P | CAT-007 | decode/lazy per 10 | E | TODO |
| CAT-009 | P2 | catalog | Product parts lazy section (DAL byProduct) | REFACTOR | L | — | DATA-003 | parts render; loading state | E | TODO |
| CAT-010 | P2 | catalog | Deleted/inactive product → notFound() | NEW | M | E | CAT-007 | HTTP 404 | SEO-404 | TODO |
| CAT-011 | P2 | catalog | /categories + /categories/[slug] RSC | REARCHITECT | M | E | DATA-002 | parity | SEO-PAR | TODO |
| CAT-012 | P2 | catalog | /custom-builds page RSC | REARCHITECT | M | E | DATA-004 | parity | SEO-PAR | TODO |
| CAT-013 | P2 | catalog | /customers wall RSC (marquee island) | REARCHITECT | L | — | DATA-005 | parity | V | TODO |
| CAT-014 | P2 | catalog | /gallery: album list RSC + progressive image grid island (batches ~12, IO, content-visibility) | REARCHITECT | H | P | DATA-006 | first viewport fast; no reshuffle on data arrival | PERF-SL, RT n/a | TODO |
| CAT-015 | P2 | catalog | Lightbox island port (prefetch ±1, RTL gestures) | REFACTOR | M | P | CAT-014, I18N-013 | swipe correct in RTL | RTL-G | TODO |
| CAT-016 | P2 | catalog | /about + /contact page shells (form island separate, P3) | REARCHITECT | L | E | CAT-001 | parity | SEO-PAR | TODO |
| CAT-017 | P2 | catalog | Legal pages ×5 primaries | REARCHITECT | L | E | DATA-007 | parity | SEO-PAR | TODO |
| CAT-018 | P2 | catalog | 301 redirects: legal aliases, /user-login, /forgot-password | NEW | M | E | — | 301 responses verified | SEO | TODO |
| CAT-019 | P2 | catalog | Search dialog rebuild over server lists (client island, bounded) | REARCHITECT | M | P | DATA-001 | results parity | E | TODO |
| CAT-020 | P2 | catalog | /ar twins for all Group A routes render with dictionaries + _ar fallback | NEW | H | E | I18N-005, I18N-010 | AR-DL green across group | AR-DL | TODO |
| CAT-021 | P2 | catalog | Reveal/scroll animations port as islands (framer) without layout thrash | REFACTOR | M | P | CAT-001 | scroll perf vs baseline | PERF | TODO |
| CAT-022 | P2 | catalog | Route loading states (loading.tsx) per segment | NEW | L | — | CAT-001 | skeletons render | E | TODO |
| CAT-023 | P2 | catalog | not-found.tsx per catalog segment localized | NEW | L | E | I18N-018 | 404 pages localized | E | TODO |
| CAT-024 | P2 | catalog | Vite-parity visual pass: 6 template snapshots (EN) approved | NEW | M | — | CAT-003..017 | snapshots baseline committed | V | TODO |

## SEO — Phase 2 metadata/sitemap (evidence: prerender-seo.mjs, api/sitemap.ts)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| SEO-001 | P2 | seo | Metadata builder `server/metadata/builders.ts` (typed; parity with prerender output) | REPLACE | H | E | FOUND-010 | field-for-field parity | SEO-PAR | TODO |
| SEO-002 | P2 | seo | generateMetadata: home + 6 static pages | REPLACE | M | E | SEO-001 | parity diff clean | SEO-PAR | TODO |
| SEO-003 | P2 | seo | generateMetadata: product detail (incl. product OG image via Cloudinary 1200×630 transform) | REPLACE | H | E | SEO-001, CAT-007 | parity + OG image ≤100 KB | SEO-PAR | TODO |
| SEO-004 | P2 | seo | generateMetadata: categories/builds/customers/gallery/legal | REPLACE | M | E | SEO-001 | parity | SEO-PAR | TODO |
| SEO-005 | P2 | seo | JSON-LD: Organization + WebSite global | REPLACE | L | E | SEO-001 | valid schema | Rich Results | TODO |
| SEO-006 | P2 | seo | JSON-LD: ItemList on listing pages | REPLACE | M | E | SEO-002 | valid | Rich Results | TODO |
| SEO-007 | P2 | seo | JSON-LD: Product on detail — offers per OQ-1 decision (omit if unresolved) | REPLACE | M | E | SEO-003 | no misleading offers | Rich Results | TODO |
| SEO-008 | P2 | seo | Sitemap Route Handler: port api/sitemap.ts ~verbatim | KEEP | M | E | FOUND-009 | URL set ⊇ baseline (BASE-020) | I | TODO |
| SEO-009 | P2 | seo | Sitemap: + /custom-builds, legal decision, xhtml alternates, category visibility check | HARDEN | M | E | SEO-008, I18N-002 | valid XML with alternates | I | TODO |
| SEO-010 | P2 | seo | robots metadata for noindex routes (parity with vercel.json list) | REPLACE | M | E | BASE-002 | route-by-route parity | SEO-PAR | TODO |
| SEO-011 | P2 | seo | canonical strategy per locale implemented in builder | NEW | M | E | I18N-002 | correct pairs | SEO-PAR | TODO |
| SEO-012 | P2 | seo | robots.txt served unchanged | KEEP | L | E | — | byte-identical | curl | TODO |
| SEO-013 | P2 | seo | SEO parity tooling: extraction+diff script vs BASE-003 baseline wired into preview CI | NEW | H | E | BASE-003 | gate executable | SEO-PAR | TODO |
| SEO-014 | P2 | seo | Group A parity run + approval report | NEW | H | E | SEO-013, CAT-020 | QG-P2 SEO section pass | SEO-PAR | TODO |

## IMG — Phase 2 images (evidence: image-delivery.ts, public/, GC reports)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| IMG-001 | P2 | images | Loader parity tests: port image-variants/media-frame test suites | KEEP | M | P | FOUND-022 | green | unit | TODO |
| IMG-002 | P2 | images | Surface registry implementation: presets bound per 10 table | REFACTOR | M | P | FOUND-022 | components use registry only | unit | TODO |
| IMG-003 | P2 | images | LCP hero loading strategy per template: identify actual LCP candidate → deliberate choice among preload / fetchPriority="high" / loading="eager" / lazy per pinned Next 16 (no conflicting signals) + preconnect + budget | NEW | M | P | CAT-002, FOUND-035 | LCP ≤2.5s p75 lab; no contradictory loading signals | PERF-SL | TODO |
| IMG-004 | P2 | images | W/H or ratio-box on every rendered image (CLS sweep) | HARDEN | M | P | CAT-006.. | CLS <0.1 on templates | PERF | TODO |
| IMG-005 | P2 | images | Shared error-fallback wrapper (image-fallback.svg) | NEW | L | — | — | fallback renders w/o jump | IMG-F | TODO |
| IMG-006 | P2 | images | Legacy Supabase-URL fallback path verified in loader (render API) | KEEP | M | — | FOUND-022 | legacy album renders | E | TODO |
| IMG-007 | P2 | images | GC schedule: monthly cron/runbook + report commit convention | KEEP | M | — | — | runbook committed | — | TODO |
| IMG-008 | P2 | images | Execute GC cleanup batch (240 SAFE_CANDIDATE) per runbook — HUMAN-RUN, Code prepares commands | HARDEN | M | D | IMG-007 | verify step green; report committed | GC verify | TODO |
| IMG-009 | P2 | images | Static asset audit: public/ >150 KB list → compress/convert plan (globe jpg, capability webps) | HARDEN | L | P | — | list + fixes committed | PERF | TODO |
| IMG-010 | P2 | images | Admin preview components ported `<img>` (per ADR-08) | KEEP | L | — | ADMIN-005 | previews thumbnail preset | — | TODO |
| IMG-011 | P2 | images | Lightbox transfer budget + prefetch±1 verification | HARDEN | L | P | CAT-015 | budget met | PERF | TODO |
| IMG-012 | P2 | images | og-default reference swap if filename changes (P0 fix parity) | KEEP | L | E | BASE-017 | metadata points at compressed asset | SEO-PAR | TODO |
| IMG-013 | P2 | images | Per-product OG transform preset (1200×630 crop) in loader | NEW | M | E | SEO-003 | ≤100 KB output | SEO | TODO |
| IMG-014 | P2 | images | Bundle/image report per template vs BASE-004 budgets | NEW | M | P | CAT-024 | ≤ baselines | QG-PERF | TODO |

## AUTH — Phase 3: auth reconstruction (evidence: supabase.ts, AuthCallback, Login/Register pages; rollback: Group B restore + bridge fallback)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| AUTH-001 | P3 | auth | Login page island: canonical pipeline (07) with Zod mirror | REARCHITECT | H | S | FOUND-008, FOUND-014 | flow green; enumeration-safe copy | AU-FLOWS | TODO |
| AUTH-002 | P3 | auth | Signup page + Turnstile always | REARCHITECT | H | S | AUTH-001, FOUND-034 | server-verified challenge | FORM-TS | TODO |
| AUTH-003 | P3 | auth | Enumeration-safe error map (single module) | NEW | H | S | AUTH-001 | AU-EN diff-test green | AU-EN | TODO |
| AUTH-004 | P3 | auth | Sanitizer port to lib/ + wire login/OAuth redirects | KEEP | M | S | BASE-009 | SAN-01 green in new repo | SAN-01 | TODO |
| AUTH-005 | P3 | auth | /auth/callback Route Handler: exchange + used-code fallback + friendly errors + 303 | REARCHITECT | H | S | AUTH-004 | refresh-mid-callback safe | AU-FLOWS | TODO |
| AUTH-006 | P3 | auth | Session listener + UI state: single browser listener; modal-survival regression test ported | REARCHITECT | H | S | FOUND-008 | AU-RS green in new app | AU-RS | TODO |
| AUTH-007 | P3 | auth | Remember-me implementation per CLOSED ADR-17 (P1B evidence); release-note doc | REARCHITECT | M | S | AUTH-001, AUTHP-010 | behavior documented+tested | AU-FLOWS | TODO |
| AUTH-008 | P3 | auth | Reset-password flow (uniform responses) | REARCHITECT | M | S | AUTH-003 | flow + limits | AU-FLOWS | TODO |
| AUTH-009 | P3 | auth | Update-password flow (ssr recovery session; revoke others) | REARCHITECT | M | S | AUTH-008 | other session killed | AU-FLOWS | TODO |
| AUTH-010 | P3 | auth | Logout (server-aware, multi-tab converge) | REARCHITECT | M | S | AUTH-006 | multi-tab test | AU-FLOWS | TODO |
| AUTH-011 | P3 | auth | BRIDGE-01 production form + adoption/failure events | NEW | H | S | AUTHP-009 | <2% forced re-login on cohort | AU-BR | TODO |
| AUTH-012 | P3 | auth | Progressive delay + failure counters (distributed store per CLOSED ADR-18) | NEW | M | S | FOUND-033, SEC-014, SEC-015 | delays observed; config-driven | I | TODO |
| AUTH-013 | P3 | auth | Login Turnstile trigger (after threshold) | NEW | M | S | AUTH-012, FOUND-034 | triggered challenge path | I | TODO |
| AUTH-014 | P3 | auth | Locale-aware OAuth redirect (with I18N-014) | NEW | M | S | AUTH-005 | /ar round-trip | AU-FLOWS | TODO |
| AUTH-015 | P3 | auth | Session-gate server layout for (account)/(commerce) groups | NEW | M | S | FOUND-009 | unauth → login with return path | E | TODO |
| AUTH-016 | P3 | auth | auth.* telemetry events wired | NEW | L | S | FOUND-016 | events visible | I | TODO |
| AUTH-017 | P3 | auth | Auth pages noindex metadata | KEEP | L | E | SEO-010 | parity | SEO-PAR | TODO |
| AUTH-018 | P3 | auth | Multi-tab session E2E in new app | NEW | M | S | AUTH-010 | green | AU-FLOWS | TODO |
| AUTH-019 | P3 | auth | Expired-refresh handling: clean signed-out + return path | NEW | M | S | AUTH-006 | no loop | AU-FLOWS | TODO |
| AUTH-020 | P3 | auth | Group B cutover readiness report (QG-P3 evidence) | NEW | H | S | AUTH-001..019, FORM-005 | gate pass | — | TODO |

## FORM — Phase 3: public forms (evidence: ContactForm, contact rate-limit migrations)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| FORM-001 | P3 | forms | Zod schemas: contact/support/custom-build (mirror DB constraints) | NEW | M | S,D | FOUND-014 | parse rules match validators.ts+DB | unit | TODO |
| FORM-002 | P3 | forms | /api/forms/contact: Zod→Turnstile→insert→typed errors | REARCHITECT | H | S | FORM-001, FOUND-034 | FORM-TS green | FORM-TS | TODO |
| FORM-003 | P3 | forms | /api/forms/support + custom-build handlers | REARCHITECT | M | S | FORM-002 | same pattern | FORM-TS | TODO |
| FORM-004 | P3 | forms | Dedup window (identifier+hash, 10 min) | NEW | M | S,D | FORM-002 | duplicate rejected politely | I | TODO |
| FORM-005 | P3 | forms | Contact form island rewired to handler; WhatsApp/email fallback behavior preserved (existing UX) | REFACTOR | M | — | FORM-002 | fallback copy preserved | E | TODO |
| FORM-006 | P3 | forms | Client cosmetic limiter removed from new form (DEL-11 forward) | REMOVE | L | — | FORM-005 | grep clean | — | TODO |
| FORM-007 | P3 | forms | ratelimit.tripped telemetry + weekly review doc | NEW | L | S | FOUND-016 | events flowing | I | TODO |
| FORM-008 | P3 | forms | Form dictionaries + AR validation messages | NEW | M | — | I18N-005 | AR errors correct | AR E2E | TODO |
| FORM-009 | P3 | forms | E2E: rate-limit reached UX (friendly, localized) | NEW | M | — | FORM-002 | green | E | TODO |
| FORM-010 | P3 | forms | Handlers documented as Expo-callable contracts (shared/contracts) | NEW | L | — | FORM-002 | contract doc | — | TODO |

## REQ — Phase 4: transactional flows (evidence: cart/quote contexts, request RPCs; rollback: Group C restore)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| REQ-001 | P4 | transactions | Cart context port (client-owned, localStorage) into (commerce) group only | KEEP | M | D | CAT-006 | cart persists; group-scoped provider | E | TODO |
| REQ-002 | P4 | transactions | PurchaseQuote context port (same scoping) | KEEP | L | D | REQ-001 | — | E | TODO |
| REQ-003 | P4 | transactions | Migration FILE: idempotency-key column + unique index on rental requests | NEW | H | D | DBMIG-001 | additive; frozen-Vite safe | DBMIG review | TODO |
| REQ-004 | P4 | transactions | Migration FILE: idempotency key on purchase quotes | NEW | M | D | REQ-003 | same | review | TODO |
| REQ-005 | P4 | transactions | Migration FILES: DB CHECKs — quantities ≥1≤cap, date ordering, message lengths (verify absent first) | NEW | M | D | — | evidence of absence + files | review | TODO |
| REQ-006 | P4 | transactions | Checkout flow rebuild: session-gated submit → RPC with idempotency key | REARCHITECT | H | D | AUTH-015, DBMIG-006 | MUT-DC/TO green | MUT-DC, MUT-TO | TODO |
| REQ-007 | P4 | transactions | Quote flow rebuild (same pattern) | REARCHITECT | M | D | REQ-006 | green | MUT-DC | TODO |
| REQ-008 | P4 | transactions | Draft persistence semantics preserved (cart survives login redirect) | KEEP | M | — | REQ-006 | MUT-SS green | MUT-SS | TODO |
| REQ-009 | P4 | transactions | /my-requests list (server fetch no-store) + journey UI port | REARCHITECT | M | D | AUTH-015 | parity | E | TODO |
| REQ-010 | P4 | transactions | /my-requests/[n] details + status timeline | REARCHITECT | M | D | REQ-009 | parity | E | TODO |
| REQ-011 | P4 | transactions | /order-summary/[n] | REARCHITECT | L | — | REQ-009 | parity | E | TODO |
| REQ-012 | P4 | transactions | /profile rebuild (avatar via existing pipeline) | REARCHITECT | M | S | AUTH-015 | update flow + profile-sync equivalent | E | TODO |
| REQ-013 | P4 | transactions | Request/quote Zod schemas shared | NEW | M | D | FORM-001 | parse before RPC | unit | TODO |
| REQ-014 | P4 | transactions | RPC contract tests extended for idempotency params | HARDEN | M | D | FOUND-028, REQ-003 | contracts green | CT-RPC | TODO |
| REQ-015 | P4 | transactions | Stale-session mid-submit recovery UX | NEW | M | — | REQ-006 | MUT-SS | MUT-SS | TODO |
| REQ-016 | P4 | transactions | DBT-01: Supabase timeout → error+retry UI | NEW | M | — | REQ-009 | green | DBT-01 | TODO |
| REQ-017 | P4 | transactions | bfcache revalidation on personal routes (pageshow) | NEW | L | — | REQ-009 | BFC-01 | BFC-01 | TODO |
| REQ-018 | P4 | transactions | Account dictionaries applied; AR flows E2E | NEW | M | — | I18N-006 | AR checkout green | E | TODO |
| REQ-019 | P4 | transactions | Group C cutover readiness report | NEW | H | D | REQ-001..018 | QG-P4 pass | — | TODO |

## CHAT/NOTIF — Phase 5: realtime (evidence: chat.service, ChatContext, notifications.service; rollback: Group D restore)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| CHAT-001 | P5 | realtime | Subscription manager hook (stable keys, one channel per key, leak-proof) | REARCHITECT | H | D | FOUND-008 | RT-LEAK green | RT-LEAK | TODO |
| CHAT-002 | P5 | realtime | Migration FILE: client message id uuid column + unique index | NEW | H | D | BASE-013, DBMIG-001 | additive; review | DBMIG review | TODO |
| CHAT-003 | P5 | realtime | Chat reducer on harness: id-keyed idempotent, ordering rules | REARCHITECT | H | D | BASE-011 | RD-01 chat cases green | RD-01 | TODO |
| CHAT-004 | P5 | realtime | Buffer→snapshot→replay wiring for conversation load | REARCHITECT | H | D | CHAT-001, CHAT-003 | RT-RACE green | RT-RACE | TODO |
| CHAT-005 | P5 | realtime | Optimistic send + echo reconcile by id; retry = unique-violation → sent | REARCHITECT | H | D | DBMIG-008 | no dupes ever | RT-RC | TODO |
| CHAT-006 | P5 | realtime | Reconnect catchup (watermark −60s refetch) | NEW | H | D | CHAT-004 | RT-RC green | RT-RC | TODO |
| CHAT-007 | P5 | realtime | Unread counts server-recomputed; mark-all-read race rule | HARDEN | M | D | CHAT-003 | convergence E2E | RT-RC | TODO |
| CHAT-008 | P5 | realtime | Chat widget island rebuild (quick questions anon path preserved) | REARCHITECT | M | — | CHAT-004 | anon+authed flows | E | TODO |
| CHAT-009 | P5 | realtime | Migration FILE: chat msg-rate DB limit (pattern from contact) | NEW | M | S | — | review | review | TODO |
| CHAT-010 | P5 | realtime | Chat dictionaries + Bidi bubbles | NEW | M | — | I18N-007, I18N-016 | AR chat correct | E | TODO |
| NOTIF-001 | P5 | realtime | Notification stream on manager+reducer (port tested reducer) | KEEP→HARDEN | M | D | CHAT-001 | existing contract tests green | CT | TODO |
| NOTIF-002 | P5 | realtime | Reconnect refetch for notifications | NEW | M | D | NOTIF-001 | RT-RC notif case | RT-RC | TODO |
| NOTIF-003 | P5 | realtime | /notifications page rebuild | REARCHITECT | M | — | NOTIF-001, AUTH-015 | parity | E | TODO |
| NOTIF-004 | P5 | realtime | Bell/badge island (multi-tab convergence) | REFACTOR | L | — | NOTIF-001 | converges | E | TODO |
| NOTIF-005 | P5 | realtime | Group D cutover readiness report | NEW | M | D | CHAT-*, NOTIF-* | QG-P5 pass | — | TODO |

## ADMIN — Phase 6 (evidence: pages/admin/*, AdminGuard; rollback: Group E restore)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| ADMIN-001 | P6 | admin | Server-gated admin layout: getUser→role→AAL2 | REARCHITECT | H | S | AUTH-015 | ADM-GATE green | ADM-GATE | TODO |
| ADMIN-002 | P6 | admin | MFA enrollment flow (TOTP) + staged rollout flag | NEW | H | S | ADMIN-001 | superadmin first; runbook for reset | E | TODO |
| ADMIN-003 | P6 | admin | Admin UX integration of destructive-op enforcement (typed confirm, recent-auth re-prompt flows — UX ONLY, never the enforcement) + final end-to-end enforcement verification | NEW | H | S | ADMIN-001, SEC-016 | ADM-RA green + BYPASS suite green end-to-end | ADM-RA, BYPASS | TODO |
| ADMIN-004 | P6 | admin | SuperAdmin gate for sensitive children (parity with SuperAdminGuard) | REARCHITECT | M | S | ADMIN-001 | route matrix parity | E | TODO |
| ADMIN-005 | P6 | admin | Interior port: Dashboard page (ADR-04: client page) | REFACTOR | M | — | ADMIN-001, FOUND-017 | behavior parity | E | TODO |
| ADMIN-006 | P6 | admin | Product/category forms + AR fields (I18N-020) + uploads via Edge Fn | REFACTOR | H | D | ADMIN-020, ADMIN-021, DBMIG-004 | CRUD green; AR saved | E | TODO |
| ADMIN-007 | P6 | admin | Revalidation wiring: every catalog mutation → /api/revalidate tags | NEW | H | D | FOUND-021, ADMIN-006 | ADM-INV per entity | ADM-INV | TODO |
| ADMIN-008 | P6 | admin | Revalidate-failure UX (warning + retry + event) | NEW | M | D | ADMIN-007 | simulated failure path | I | TODO |
| ADMIN-009 | P6 | admin | Interior port: Parts page | REFACTOR | M | — | ADMIN-005 | parity | E | TODO |
| ADMIN-010 | P6 | admin | Interior port: Requests list page | REFACTOR | M | D | ADMIN-005 | parity | E | TODO |
| ADMIN-011 | P6 | admin | Interior port: Chats inbox page (manager-based sub) | REFACTOR | M | D | CHAT-001 | inbox realtime green | E | TODO |
| ADMIN-012 | P6 | admin | Interior port: Admins page (role ops via trusted boundary) | REFACTOR | M | S | ADMIN-003 | BYPASS green for role ops | ADM-RA, BYPASS | TODO |
| ADMIN-013 | P6 | admin | Audit events for sensitive ops appended to logs pattern | HARDEN | M | S | ADMIN-003 | events recorded | I | TODO |
| ADMIN-014 | P6 | admin | Revoked-admin mid-session E2E (layout AND RPC deny) | NEW | H | S | ADMIN-001 | green | ADM-GATE | TODO |
| ADMIN-015 | P6 | admin | Edge Fn hardening: signed upload PRESET with allowed_formats + max_file_size (verified Cloudinary mechanism per 10 §Upload; signer authorizes preset use) | HARDEN | M | S | — | signature includes constraints; upload of banned type fails | I | TODO |
| ADMIN-016 | P6 | admin | Edge Fn quota (SEC-013, provisional 30/h) | HARDEN | M | S | ADMIN-015 | 31st sign denied + event | I | TODO |
| ADMIN-017 | P6 | admin | UPL-PF: partial upload failure → no orphan row; upload-record idempotency key prevents duplicate rows (Master Plan §11.7) | NEW | M | D | ADMIN-006 | green; dup-record test | UPL-PF | TODO |
| ADMIN-018 | P6 | admin | Admin dictionaries (I18N-008) applied | NEW | L | — | I18N-008 | coverage green | I18N-COV | TODO |
| ADMIN-019 | P6 | admin | Group E cutover readiness report | NEW | H | S | ADMIN-* | QG-P6 pass | — | TODO |

## SEC/OBS — cross-phase security & observability
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| SEC-001 | cross | security | Threat-model doc kept current per phase (05 deltas) | NEW | L | S | — | reviewed each phase report | — | TODO |
| SEC-002 | cross | security | Verify Supabase native auth limits + email-confirm settings (BASE-021 follow-up) | NEW | M | S | BASE-021 | values in 05; gaps ticketed | — | TODO |
| SEC-003 | cross | security | Headers report-only violation triage log (P1→P7) | NEW | M | S | FOUND-013 | zero unexplained violations before P7 | QG-P7 | TODO |
| SEC-004 | cross | security | Verify GIS origins need (grep for accounts.google script) → CSP final origin list | NEW | L | S | FOUND-013 | evidence note | — | TODO |
| SEC-005 | cross | security | Origin/Sec-Fetch-Site checks on cookie-authed handlers | NEW | M | S | FOUND-021 | cross-site POST rejected | I | TODO |
| SEC-006 | cross | security | Enumeration copy review across auth+reset (with AUTH-003) | NEW | M | S | AUTH-003 | AU-EN green | AU-EN | TODO |
| SEC-007 | cross | security | PII scrubber implementation + redaction unit test | NEW | M | S | FOUND-016 | test green | unit | TODO |
| SEC-008 | cross | security | SECURITY_STRICT emergency flag wired (halve thresholds, force login challenge) | NEW | L | S | FOUND-033 | flag flips behavior in test | I | TODO |
| SEC-009 | cross | security | RLS probe suite maintained green through migrations | KEEP | H | S,D | FOUND-027 | CT-RLS green every CI | CT-RLS | TODO |
| SEC-010 | cross | security | Import-graph audit in CI (service-role confinement) | KEEP | M | S | FOUND-005 | QG-ARCH-4 | CI | TODO |
| SEC-011 | cross | security | Permissions-Policy + HSTS confirm/emit | NEW | L | S | FOUND-013 | headers present | curl | TODO |
| SEC-012 | cross | security | (=ADMIN-015 spec) upload-preset constraint enforcement — preset definition + signer diff + UPL-NEG negative test | HARDEN | M | S | — | see ADMIN-015 | I | TODO |
| SEC-013 | cross | security | (=ADMIN-016 spec) signing quota storage + thresholds config | HARDEN | M | S | — | see ADMIN-016 | I | TODO |
| OBS-001 | cross | observability | app_events schema + track() finalized; event catalog from 05 | NEW | M | S | FOUND-016 | catalog implemented | I | TODO |
| OBS-002 | cross | observability | 6 alert rules configured + synthetic-fault test each | NEW | M | S | OBS-001 | alerts fire on synthetic | QG-FINAL | TODO |
| OBS-003 | cross | observability | Web Vitals dashboards per route group | NEW | L | P | FOUND-016 | visible post-cutover | — | TODO |
| OBS-004 | cross | observability | revalidate.failed → alert + weekly review | NEW | M | D | FOUND-021 | wired | I | TODO |

## CUT/DEL — Phase 7: cutover & decommission (rollback: per 20)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| CUT-001 | P7 | cutover | SUPERSEDED by ROUTE-001..010 (topology proven pre-P1B). Retained as pointer only. | REMOVE | L | — | ROUTE-010 | ROUTE group DONE | — | TODO |
| CUT-002 | P7 | cutover | Group A cutover (procedure per 20) | NEW | H | E | SEO-014, QG-P2 | smoke + 72h window clean | SMOKE | TODO |
| CUT-003 | P7 | cutover | Group B cutover (auth atomicity per AUTHP-009) | NEW | H | S | AUTH-020 | window clean; bridge telemetry | SMOKE | TODO |
| CUT-004 | P7 | cutover | Group C cutover | NEW | H | D | REQ-019 | window clean | SMOKE | TODO |
| CUT-005 | P7 | cutover | Group D cutover | NEW | M | D | NOTIF-005 | window clean | SMOKE | TODO |
| CUT-006 | P7 | cutover | Group E cutover | NEW | H | S | ADMIN-019 | window clean | SMOKE | TODO |
| CUT-007 | P7 | cutover | Catch-all flip + 301 set live; prerender build hook removed | NEW | H | E | CUT-002..006 | full E2E matrix green | E | TODO |
| CUT-008 | P7 | cutover | CSP enforce after 72h zero-violation | NEW | M | S | SEC-003 | enforced; no breakage | QG-P7 | TODO |
| DELX-001 | P7 | decommission | Execute deletion ledger DEL-01..12,14 with per-item verification | REMOVE | H | — | CUT-007 | 15-ledger 100% checked | greps+E | TODO |
| DELX-002 | P7 | decommission | BRIDGE-01 removal per trigger + legacy key hygiene (DEL-06) | REMOVE | M | S | CUT-003 +2 cycles | adoption <1%/wk evidence | AU-BR final | TODO |
| DELX-003 | P7 | decommission | Vite project decommission: tag archive release, park project, DNS/domain final | REMOVE | M | — | DELX-001 | archive tagged; rollback doc closed | — | TODO |
| DELX-004 | P7 | decommission | Final GC run + report | KEEP | L | — | IMG-007 | report committed | GC verify | TODO |
| DELX-005 | P7 | decommission | Dead-code sweep in new repo (knip/ts-prune) | NEW | L | — | DELX-001 | zero unused exports report | CI | TODO |
| CUT-009 | P7 | cutover | Post-cutover GSC 2-week watch per group closed out | NEW | M | E | CUT-002..007 | coverage stable notes | — | TODO |
| CUT-010 | P7 | cutover | FINAL validation phase kickoff (see FINAL prompt) | NEW | H | — | all | QG-FINAL | all | TODO |
| CUT-011 | P7 | cutover | Runbooks: incident, rollback, MFA reset, GC — committed | NEW | M | S | — | four runbooks exist | — | TODO |

---
# V2.1 ADDITIONS

## ROUTE — Pre-P1B: Routing topology proof (Phase P1; rollback: preview-only; evidence: vercel.json, 20-plan)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| ROUTE-001 | P1 | routing | Topology decision spike: Vite-project rewrites → Next deployment vs domain path routing; document with restore artifact | NEW | H | — | FOUND-001 | decision recorded; ADR note | ROLL-01 | TODO |
| ROUTE-002 | P1 | routing | Prove public route rewrite: one marketing route served by Next through chosen topology on preview | NEW | H | E | ROUTE-001 | HTML served; headers correct | RT-TOP | TODO |
| ROUTE-003 | P1 | routing | Prove `/_next/*` static + chunk assets resolve through topology (no 404s, correct cache headers) | NEW | H | P | ROUTE-002 | assets 200 + immutable cache | RT-TOP | TODO |
| ROUTE-004 | P1 | routing | Prove RSC navigation + hard refresh + streamed responses through the rewrite layer | NEW | H | — | ROUTE-003 | soft nav, F5, streaming all intact | RT-TOP | TODO |
| ROUTE-005 | P1 | routing | Prove cookie round-trip: request cookies forwarded, Set-Cookie propagated unmodified through topology | NEW | H | S | ROUTE-002 | cookie echo test green | RT-COOKIE | TODO |
| ROUTE-006 | P1 | routing | Prove OAuth-callback-shaped route (query strings + 303 redirect) traverses topology intact | NEW | H | S | ROUTE-005 | params + redirect preserved | RT-TOP | TODO |
| ROUTE-007 | P1 | routing | Prove locale rewrites (/ar/*) + 404 + 301 behavior through topology | NEW | M | E | ROUTE-002, FOUND-010 | all three verified | RT-TOP | TODO |
| ROUTE-008 | P1 | routing | Prove CSP/report headers survive the rewrite layer un-stripped | NEW | M | S | ROUTE-002, FOUND-013 | headers present end-to-end | RT-TOP | TODO |
| ROUTE-009 | P1 | routing | Rollback rehearsal on topology: restore rewrite, group returns to Vite intact | NEW | H | — | ROUTE-002 | ROLL-01 executed + logged | ROLL-01 | TODO |
| ROUTE-010 | P1 | routing | Topology proof report: PASS/FAIL per dimension; P1B is BLOCKED until PASS | NEW | H | S | ROUTE-002..009 | report committed; gate pass | — | TODO |

## PROXY — proxy.ts composition (Phase P1; evidence: 05 §Proxy Composition; rollback: revert PR)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| PROXY-001 | P1 | proxy | Composition design doc in-code: order = next-intl negotiate → Supabase refresh → merge cookies onto final response (per 05 §Proxy) | NEW | H | S | FOUND-009, FOUND-010 | design comment + unit skeleton | PROXY-INT | TODO |
| PROXY-002 | P1 | proxy | Response-cookie preservation: intl redirect/rewrite responses carry Supabase refreshed cookies (no loss on NextResponse.redirect) | NEW | H | S | PROXY-001 | cookie present after locale redirect | PROXY-INT | TODO |
| PROXY-003 | P1 | proxy | Request-cookie propagation: downstream RSC/handlers see refreshed tokens same-request (request header mutation pattern) | NEW | H | S | PROXY-001 | RSC getClaims sees new token | PROXY-INT | TODO |
| PROXY-004 | P1 | proxy | Matcher exclusions: /_next, /_vercel, static/image files, /api/*, /auth/callback, sitemap.xml — explicit list + rationale | NEW | M | S | PROXY-001 | matcher tested per path class | PROXY-INT | TODO |
| PROXY-005 | P1 | proxy | Desync prevention: single refresh per request; no double-refresh between proxy and server client; token reuse rules documented | NEW | H | S | PROXY-003 | one refresh observed under trace | PROXY-INT | TODO |
| PROXY-006 | P1 | proxy | Locale redirect vs auth-refresh interaction matrix (anon /ar, authed /ar, expired-token + locale change) | NEW | M | S | PROXY-002 | matrix cases green | PROXY-INT | TODO |
| PROXY-007 | P1 | proxy | Failure behavior: Supabase unreachable in proxy → pass-through unauthenticated, never 500 the page; event logged | NEW | M | S | PROXY-001 | fault-injection test | PROXY-INT | TODO |
| PROXY-008 | P1 | proxy | Blocking integration suite PROXY-INT wired into CI (all cases above) | NEW | H | S | PROXY-002..007 | suite green in CI | PROXY-INT | TODO |

## ENV — Environment parity (cross-phase; evidence: 19-matrix; rollback: n/a)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| ENV-001 | P0 | env | Full env-var inventory ×(local, preview, prod) + VITE_→NEXT_PUBLIC_ mapping table committed into 19 | NEW | M | S | BASE-006 | 19 populated; no secret values printed | — | TODO |
| ENV-002 | P1 | env | Kill dual-prefix fork deliberately: single NEXT_PUBLIC_ set in new app; envPrefix legacy documented | REMOVE | M | S | ENV-001, FOUND-001 | new app has no VITE_ reads | unit | TODO |
| ENV-003 | P0 | env | Record prod value of VITE_IMAGE_TRANSFORMATIONS_ENABLED + decide Next equivalent flag semantics | NEW | M | P | BASE-006 | value + decision in 19 | — | TODO |
| ENV-004 | P0 | env | Verify Vercel preview noindex (X-Robots-Tag) on both projects; document | NEW | M | E | — | curl evidence in 19 | — | TODO |
| ENV-005 | P0 | env | Record Supabase region + Vercel function region; measure server→DB latency; flag if cross-region before P2 cutover | NEW | M | P | BASE-021 | latency numbers in 19 | — | TODO |
| ENV-006 | P1B | env | OAuth preview policy decision (OQ-2): enable preview callback URIs or disable OAuth on previews; implement | NEW | M | S | ENV-001 | decision + Supabase config note | AU-FLOWS | TODO |

## DBMIG — Migration execution gates (cross-phase; HUMAN gates marked ⛔; rollback: restore column/table via inverse migration file)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| DBMIG-001 | P1 | dbmig | Migration pipeline definition: author → static SQL review → backward-compat review → branch/staging apply → schema verify → contract tests → frozen-Vite test → ⛔ human approval → ⛔ prod apply → prod verify → feature enable | NEW | H | D | FOUND-005 | pipeline doc + checklist template | — | TODO |
| DBMIG-002 | P1 | dbmig | Branch/staging Supabase environment wired for CI contract tests (Code MAY apply migrations HERE only) | NEW | H | D | DBMIG-001 | CT-RLS/CT-RPC run against branch DB | CT | TODO |
| DBMIG-003 | P1 | dbmig | Wave A files+review: app_events (FOUND-016) | NEW | M | S | DBMIG-001 | reviewed; staging applied | CT | TODO |
| DBMIG-004 | P2 | dbmig | Wave B: `*_ar` columns (I18N-009) — STAGING-VERIFIED gate; ⛔ prod apply | NEW | H | E,D | DBMIG-002, I18N-009 | staging verified; frozen-Vite test green; ⛔ approved | CT, SMOKE | TODO |
| DBMIG-005 | P2 | dbmig | Wave B prod verification + feature enablement note (AR read path may ship) | NEW | M | E | DBMIG-004 | prod schema verified | — | TODO |
| DBMIG-006 | P4 | dbmig | Wave C: idempotency keys (REQ-003/004) + DB CHECKs (REQ-005) — staging verified; ⛔ prod | NEW | H | D | DBMIG-002, REQ-003, REQ-004, REQ-005 | staging + contract green; ⛔ approved | CT-RPC | TODO |
| DBMIG-007 | P4 | dbmig | Wave C prod verification | NEW | M | D | DBMIG-006 | verified | SMOKE | TODO |
| DBMIG-008 | P5 | dbmig | Wave D: chat client message id (CHAT-002) + msg-rate limit (CHAT-009) — staging verified; ⛔ prod | NEW | H | D | DBMIG-002, CHAT-002, CHAT-009 | staging + reducer tests green; ⛔ approved | RD-01 | TODO |
| DBMIG-009 | P5 | dbmig | Wave D prod verification | NEW | M | D | DBMIG-008 | verified | RT-RC | TODO |
| DBMIG-010 | P6 | dbmig | Wave E: AAL2/recent-auth DB enforcement migrations per APPROVED SEC-018 design (RPC assurance params / RLS checks / EXECUTE revocations) — staging verified; ⛔ prod | NEW | H | S,D | DBMIG-002, SEC-018 | BYPASS suite green on staging; ⛔ approved | BYPASS | TODO |
| DBMIG-011 | P6 | dbmig | Wave E prod verification + bypass re-probe on prod | NEW | H | S | DBMIG-010 | BYPASS green on prod | BYPASS | TODO |
| DBMIG-012 | P7 | dbmig | Migration ledger close-out: every wave verified; no orphan migration files | NEW | M | D | DBMIG-003..011 | close-out report | — | TODO |

## ARB — Arabic content backfill & launch readiness (P2→cutover; evidence: I18N-009/011, R-06)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| ARB-001 | P2 | arabic | Active-entity inventory: counts of active products/categories/builds/albums needing _ar fields | NEW | M | E | DBMIG-005 | inventory report | — | TODO |
| ARB-002 | P2 | arabic | Backfill workflow decision: admin-form manual vs CSV import tooling vs assisted draft + human edit | NEW | M | — | ARB-001 | decision logged | — | TODO |
| ARB-003 | P2 | arabic | Import/backfill tooling if chosen (script writes via service role in scripts/ only) | NEW | M | D | ARB-002 | dry-run report; idempotent | script test | TODO |
| ARB-004 | P2 | arabic | Category names + descriptions AR backfill (100% of active) | NEW | M | E | ARB-002 | coverage report 100% names | I18N-011 | TODO |
| ARB-005 | P2 | arabic | Product names AR backfill (100% of active) | NEW | H | E | ARB-002 | 100% names | I18N-011 | TODO |
| ARB-006 | P2 | arabic | Product descriptions/specs AR coverage to threshold ⛔ (product-owner sets %) | NEW | M | E | ARB-005 | threshold met + logged | I18N-011 | TODO |
| ARB-007 | P2 | arabic | Custom-build + gallery-title AR review | NEW | L | E | ARB-002 | reviewed | I18N-011 | TODO |
| ARB-008 | P2 | arabic | Arabic SEO title/description review per indexable /ar route (metadata builder inputs) | NEW | H | E | ARB-004, ARB-005 | every indexable AR route has AR title+desc | SEO-PAR (ar) | TODO |
| ARB-009 | P2 | arabic | Human QA sample: native-speaker review of N pages ⛔ (owner sets N) | NEW | M | E | ARB-008 | QA sign-off note | — | TODO |
| ARB-010 | P2 | arabic | AR launch gate report: coverage metrics vs ⛔ approved thresholds; /ar cutover BLOCKED until pass | NEW | H | E | ARB-004..009 | QG-AR-LAUNCH pass | — | TODO |

## A11Y — Accessibility implementation (P2–P6; evidence: components in CAT/AUTH/ADMIN groups)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| A11Y-001 | P2 | a11y | Semantic landmarks in layout shell (header/nav/main/footer; skip-link) | NEW | M | — | CAT-001 | axe landmarks clean | axe CI | TODO |
| A11Y-002 | P2 | a11y | Heading hierarchy audit on 8 templates (single h1, ordered levels) | NEW | M | E | CAT-024 | audit clean | axe CI | TODO |
| A11Y-003 | P2 | a11y | Keyboard navigation: nav menus, search dialog, cards focusable order | NEW | M | — | CAT-019 | tab-order E2E | E | TODO |
| A11Y-004 | P2 | a11y | Lightbox focus trap + Escape + focus-return | NEW | M | — | CAT-015 | trap E2E green | E | TODO |
| A11Y-005 | P3 | a11y | Form labels/errors: programmatic association + aria-invalid on auth+public forms | NEW | M | — | AUTH-001, FORM-005 | axe forms clean | axe CI | TODO |
| A11Y-006 | P3 | a11y | aria-live status regions for async submit states (forms, checkout later) | NEW | M | — | FORM-005 | announced in SR test | E | TODO |
| A11Y-007 | P2 | a11y | Reduced-motion: prefers-reduced-motion honored by reveal/scroll/hero animations (port usePerfMode intent) | NEW | M | P | CAT-021 | media-query E2E | E | TODO |
| A11Y-008 | P2 | a11y | Contrast review of token palette on light/dark (fix violations or log exceptions) | NEW | M | — | FOUND-025 | axe contrast clean | axe CI | TODO |
| A11Y-009 | P2 | a11y | RTL keyboard behavior: arrow-key direction in carousels/lightbox under dir=rtl | NEW | M | — | I18N-013 | RTL key E2E | E | TODO |
| A11Y-010 | P1 | a11y | axe CI integration (fails on critical, top-8 template set) | NEW | M | — | FOUND-005 | gate wired | axe CI | TODO |
| A11Y-011 | P6 | a11y | Admin modal/dialog accessibility: focus trap, labels, destructive-confirm announced | NEW | M | — | ADMIN-003 | axe + trap E2E | E | TODO |
| A11Y-012 | P4 | a11y | Checkout/cart flows: error summaries, quantity steppers, date pickers keyboard-operable | NEW | M | — | REQ-006 | E2E keyboard pass | E | TODO |

## V2.1 SPLITS & NEW CROSS TASKS
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| CAT-025 | P2 | catalog | Home: stats/testimonials/CTA sections (RSC) | REARCHITECT | M | E,P | DATA-001 | parity + budgets | SEO-PAR | TODO |
| CAT-026 | P2 | catalog | Home: events/locations sections (islands where interactive) | REARCHITECT | M | P | DATA-001 | parity + budgets | PERF | TODO |
| ADMIN-020 | P6 | admin | Interior port: Products page | REFACTOR | M | — | ADMIN-001, FOUND-017 | behavior parity | E | TODO |
| ADMIN-021 | P6 | admin | Interior port: Categories page | REFACTOR | M | — | ADMIN-001, FOUND-017 | parity | E | TODO |
| ADMIN-022 | P6 | admin | Interior port: Customers page | REFACTOR | M | — | ADMIN-005 | parity | E | TODO |
| ADMIN-023 | P6 | admin | Interior port: CustomBuilds page | REFACTOR | M | — | ADMIN-005 | parity | E | TODO |
| ADMIN-024 | P6 | admin | Interior port: Gallery page | REFACTOR | M | — | ADMIN-005 | parity | E | TODO |
| ADMIN-025 | P6 | admin | Interior port: RequestDetails page (approval advisory-lock path untouched) | REFACTOR | H | D | ADMIN-010 | approval E2E; lock preserved | E | TODO |
| ADMIN-026 | P6 | admin | Interior port: Notifications send page (broadcast preview preserved) | REFACTOR | M | D | ADMIN-011 | broadcast E2E | E | TODO |
| ADMIN-027 | P6 | admin | Interior port: Users page | REFACTOR | M | S | ADMIN-003 | parity | E | TODO |
| ADMIN-028 | P6 | admin | Interior port: Logs page | REFACTOR | L | — | ADMIN-005 | parity | E | TODO |
| ADMIN-029 | P6 | admin | Interior port: ContactSubmissions page | REFACTOR | L | — | ADMIN-005 | parity | E | TODO |
| SEC-014 | P1 | security | ADR-18 closure: rate-limit state store evaluation (Supabase RPC counters vs KV/Redis vs WAF combo) with latency/cost/atomicity/privacy analysis + trusted client-IP source on Vercel + HMAC identifier keys + retention | NEW | H | S | FOUND-033 | ADR-18 CLOSED with evidence | — | TODO |
| SEC-015 | P3 | security | Implement chosen rate-limit store (atomic increments, expiry, cleanup) behind FOUND-033 interface | NEW | H | S | SEC-014 | concurrency test; limits survive multi-instance | I | TODO |
| SEC-016 | P6 | security | Destructive-Op trusted-boundary APPLICATION implementation per SEC-018 design (handler wraps, RPC call-sites, EXECUTE-revocation consumers) — per operation | HARDEN | H | S,D | SEC-018, DBMIG-010 | matrix row-by-row enforced | BYPASS | TODO |
| SEC-017 | P7 | security | CSP inline audit: violation inventory, nonce/hash feasibility, ⛔ P7 decision to drop 'unsafe-inline' or documented exception | HARDEN | M | S | SEC-003 | decision + final policy | QG-P7 | TODO |
| CACHE-005 | P2 | cache | ADR-19 conformance: implement chosen Next 16 cache model (use cache + cacheTag + cacheLife) in DAL; integration tests for tag attach, TTL, new-slug, delete→404, SWR vs immediate semantics | NEW | H | D | DATA-001, FOUND-020 | CACHE-MODEL suite green | CACHE-MODEL | TODO |
| FOUND-035 | P1 | foundation | Version-lock decision: record exact Next 16.x/react/supabase-ssr/next-intl versions; pin via lockfile; major upgrades require ADR (ADR-16) | NEW | M | — | FOUND-001 | versions doc committed | — | TODO |
| AUTHP-010 | P1B | auth-proto | Remember-me semantics measurement (ADR-17): ssr cookie behavior, session lifetime, browser-close semantics, rotation interaction, local sign-out vs server session, bridge compat, multi-tab | NEW | H | S | AUTHP-002 | ADR-17 CLOSED with runtime evidence | AU-BR | TODO |

## V2.3 ADDITION (cycle fix)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| SEC-018 | P6 | security | Destructive-operation trusted-boundary DESIGN/SPECIFICATION: per 05-matrix row choose mechanism (A RPC self-enforce via auth.jwt() assurance inspection / B RLS / C EXECUTE-revoke + handler), define exact RPC param & claim checks, migration list for DBMIG-010, BYPASS test plan — ⛔ human design approval | NEW | H | S,D | — | approved design doc; every matrix row has a chosen mechanism + test | design review | TODO |

## V2.2 ADDITIONS (Master Plan reconciliation — 4 real tasks)
| ID | Phase | Domain | Title | Type | Risk | Flags | Deps | Acceptance | Tests | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| SEO-015 | P2 | seo | manifest.ts + icon metadata parity with current favicon set (Master Plan §5 convention; V2.1 gap) | NEW | L | E | SEO-001 | valid manifest served; icons parity | curl + Lighthouse PWA row | TODO |
| SEO-016 | P2 | seo | BreadcrumbList JSON-LD on category→product paths (Master Plan §12.6; V2.1 gap) | NEW | L | E | SEO-005, CAT-007 | valid schema on detail + category pages | Rich Results | TODO |
| DATA-009 | P2 | data | DAL query hygiene: explicit column selection (no select('*') on heavy pages), parallelize independent queries, index-review notes from real queries, keyset pagination where offset is costly (Master Plan §9.4) | NEW | M | P,D | DATA-001..006 | hygiene checklist per DAL file; review notes committed | I + bundle/query report | TODO |
| CHAT-011 | P5 | realtime | Chat history pagination: load recent window, fetch older on demand; never load entire thread (Master Plan §16) | NEW | M | P | CHAT-004 | older-messages fetch works through reducer; window size config | RT-RACE variant + E | TODO |
