# 18 — TEST MASTER MATRIX
Type: U unit · C contract · I integration · E E2E · V visual. Env: CI / preview / prod-smoke. B = blocking.

| ID | Scenario | Subsystem | Risk | Phase | Type | Env | B |
|---|---|---|---|---|---|---|---|
| SAN-01 | redirect sanitizer: //evil.com, /\evil, scheme, /login loop | auth | R-01 | P0 | U | CI | B |
| AU-RS | TOKEN_REFRESHED keeps object identity → open modal survives | auth | legacy regression | P0 | U/I | CI | B |
| RD-01 | reducer: out-of-order, duplicate echo, buffer-replay, read-watermark | realtime | R-07 | P0 prep/P5 | U | CI | B |
| CT-RPC | request/quote/chat/admin RPC shapes | contracts | R-09 | P1→ | C | CI | B |
| CT-RLS | anon/user/admin probe matrix per table | authz | R-03 | P1 | C | CI branch DB | B |
| I18N-COV | key coverage EN=AR, no raw keys rendered | i18n | R-05 | P1→ | U | CI | B |
| AU-EN | enumeration diff-test (existing vs missing email, class+timing) | auth | sec | P3 | I | preview | B |
| AU-FLOWS | login remember on/off; logout multi-tab; expired code reuse; refresh mid-callback; password-change kills other session | auth | R-01 | P3 | E | preview | B |
| AU-BR | bridge: Vite login → Next authed; rollback → Vite authed; partial failure soft | bridge | R-01 | P1B/P3 | E | preview | B |
| FORM-TS | forms: server 403 without Turnstile token; Zod rejects; DB limit backstop; dedup window | forms | R-11 | P3 | I/E | preview | B |
| MUT-DC | double-click submit → single row (requests, quotes, contact) | mutations | data | P4 | E | preview | B |
| MUT-TO | timeout-after-success → retry no duplicate (idempotency key) | mutations | data | P4 | E | preview | B |
| MUT-SS | stale session mid-checkout → recover with draft intact | mutations | UX | P4 | E | preview | B |
| RT-RC | kill socket → reconnect → catchup, no dupes, unread converges | realtime | R-07 | P5 | E | preview | B |
| RT-RACE | message sent during initial history load | realtime | R-07 | P5 | I | CI | B |
| RT-LEAK | double mount/unmount → one live channel | realtime | perf | P5 | U | CI | B |
| ADM-GATE | non-AAL2 admin blocked at layout; revoked admin denied at layout AND RPC | admin | R-10 | P6 | E | preview | B |
| ADM-RA | destructive op without recent-auth → denied | admin | sec | P6 | I | CI | B |
| ADM-INV | each catalog entity edit → tag fired → fresh HTML | cache | R-04 | P6 | I/E | preview | B |
| CACHE-AB | user A/B probe: no personalized bleed on any cached route | cache | R-03 | P2→ | E | preview | B |
| SEO-PAR | head extraction diff vs baseline per route group | seo | R-02 | per cutover | I | preview | B |
| SEO-404 | deleted product → HTTP 404; sitemap excludes | seo | R-02 | P2 | E | preview | B |
| AR-DL | /ar deep link cold load: lang/dir/hreflang/content Arabic | i18n | R-05 | P2 | E | preview | B |
| AR-SW | language switch on product page: URL flips, canonical correct | i18n | R-05 | P2 | E | preview | B |
| RTL-G | lightbox/carousel swipe direction under RTL | rtl | UX | P2/P5 | E | preview | B |
| RTL-V | AR visual snapshots ×6 templates | rtl | UX | P2 | V | CI | B |
| IMG-F | image load failure → fallback svg, no layout jump | images | UX | P2 | E | preview | nb |
| PERF-SL | slow-3G product page: LCP budget, content pre-hydration | perf | R-15 | P2 | E | preview | B |
| BFC-01 | back/forward cache on personal route revalidates | data | R-14 | P4 | E | preview | nb |
| DBT-01 | Supabase timeout on personal route → error+retry UI (no white screen) | data | UX | P4 | E | preview | B |
| UPL-PF | signature ok + POST fail → no orphan DB row; retry clean | images | R-08 | P6 | I | preview | B |
| ROLL-01 | rewrite-restore rehearsal returns group to Vite intact | cutover | all | pre-P2 cutover | E | preview | B |
| SMOKE | login, browse→request, admin edit→freshness, /ar deep link | all | all | each prod cutover | E | prod-smoke | B |

## V2.1 additions
| ID | Scenario | Subsystem | Risk | Phase | Type | Env | B |
|---|---|---|---|---|---|---|---|
| RT-TOP | topology proof: rewrite serving, /_next assets, RSC nav, hard refresh, streaming, query strings, 404/301, CSP headers | routing | R-01/R-02 | P1 | E | preview | B |
| RT-COOKIE | cookie round-trip + Set-Cookie propagation through topology | routing | R-01 | P1 | I/E | preview | B |
| PROXY-INT | proxy composition: refreshed cookies on intl redirects, same-request propagation, matcher exclusions per path class, single-refresh, fault pass-through | proxy | R-01 | P1 | I | CI/preview | B |
| BYPASS-01..09 | direct RPC/REST/EdgeFn calls (no UI) for each 05-matrix operation ×4 personas (non-admin, AAL1 admin, AAL2 stale, AAL2 recent) — only the last succeeds | authz | sec | P6 | I | staging+prod probe | B |
| UPL-NEG | oversized/banned-format upload → Cloudinary preset rejects → no DB row, no orphan | images | R-08 | P6 | I | preview | B |
| CACHE-MODEL | ADR-19 conformance: DAL cacheTag attach, cacheLife TTL expiry, new-slug on-demand, delete→404, admin-edit fresh-on-next-request vs marketing SWR | cache | R-04 | P2 | I | preview | B |
| REVOKE-SEM | revocation semantics per ADR-22 (role change immediate at DB checks; token-TTL lag on claim-only; sign-out-others blocks refresh not in-flight) | auth | sec | P3/P6 | I | preview | B |
