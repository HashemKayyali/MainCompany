# 05 — SECURITY CONSTITUTION

## Authentication & abuse
- Enumeration-safe responses: login, signup, reset return class-uniform messages/timing ("If an account exists…"); a diff-test is a blocking test (TEST matrix AU-EN).
- Brute force / stuffing: Supabase Auth native limits are the base (verify dashboard values, task SEC-002). App layer adds: progressive delay after 3 failures per identifier; Turnstile challenge after 5 per (identifier ∪ IP); identifier dimension dominates (Jordan CGNAT — IP thresholds loose).
- Bot defense: Cloudflare Turnstile, **server-verified** in Route Handlers, on: signup (always), the 3 public forms (always), login (triggered). Client-side-only Turnstile is a violation.
- Public form abuse: Route Handler = Zod parse → Turnstile verify → insert; existing DB rate-limit functions remain the backstop (PRESERVE). Dedup window: reject identical (identifier, message-hash) within 10 min.
- Admin identities: TOTP MFA mandatory for admin/superadmin; AAL2 asserted in the admin server layout; **recent-auth ≤15 min** required for destructive ops (delete product/category/album/build, role change, admin removal, bulk delete, Cloudinary delete, notification broadcast). Role/admin changes additionally require typed confirmation.
- Role enforcement: DB layer (RLS + SECURITY DEFINER RPCs + role-lock trigger) is authoritative and PRESERVED. Server layouts verify session presence via `getClaims()` (ADR-20) and resolve role from the authoritative `profiles` row; `getUser()` only where the fresh Auth record is required (AAL/recent-auth assertions); JWT role claims are never authoritative for Eventies roles; trusted mutation boundaries authorize independently.
- Safe redirects: only the ported sanitizer (`lib/auth-routing.ts`) may compute post-auth destinations; unit tests for `//evil.com`, `/\evil`, scheme injection, `/login` loop are blocking.
- CSRF surface: cookie-authed Route Handlers accept JSON only (no form-encoded), verify `Origin`/`Sec-Fetch-Site` where present; mutations via supabase-js carry bearer tokens (not ambient) — document per handler.

## Secrets & uploads
- Service role: server env only; never `VITE_`/`NEXT_PUBLIC_`; `scripts/audit-import-graph.mjs` runs in CI (SEC-010).
- Cloudinary: secrets live in the Edge Fn only. The Edge Fn **chooses/authorizes an approved signed upload preset** (which itself defines `allowed_formats` + `max_file_size`, enforced server-side by Cloudinary) and the whitelisted folder; **the client can never supply security-sensitive parameters for the signer to sign** (ADR-21, SEC-012). Exact request shape verified against current official Cloudinary behavior at implementation. Per-admin signing quota: provisional 30/h, 300/day (SEC-013).
- Upload quota breaches, signature failures → `app_events` + alert.

## Headers (rollout: report-only P1 → enforce P7)
CSP (origins inventoried from code; extend only with evidence):
`default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com https://challenges.cloudflare.com; img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests`
(Google Identity origins only if GIS script is actually loaded — evidence says OAuth is redirect-based via Supabase: verify in P1, task SEC-004.) Plus: HSTS `max-age=63072000; includeSubDomains` (confirm Vercel default), `Permissions-Policy` minimal deny, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options: nosniff`, `frame-ancestors` supersedes but retains `X-Frame-Options: DENY`. Preview deployments must remain noindex (Vercel default — verify, ENV-004).

## Audit, PII, logging
- Audit events (append to existing logs.service pattern): auth.login_failed, auth.mfa_enrolled, admin.role_changed, admin.destructive_confirmed, ratelimit.tripped{dimension}, upload.signature_denied, revalidate.failed.
- PII: no message bodies, emails, phones in Sentry/app_events; hash identifiers where a join key is needed; scrubbers are code-reviewed (OBS tasks).
- Log redaction test: a blocking unit test feeds PII through the event pipeline and asserts absence.

## Rate-limit calibration protocol (ADR-11 — all numbers PROVISIONAL)
initial threshold → measurement window: 2 weeks of `ratelimit.tripped` + false-positive tickets → false-positive review: weekly during P3–P7 → adjustment: change constant + log ADR amendment → emergency tightening: env flag `SECURITY_STRICT=1` halves thresholds + forces Turnstile on login. Thresholds are configuration, never hard-coded into multiple call sites (single module `server/security/rate-limit.ts`).

---
# V2.1 HARDENING ADDITIONS

## Proxy Composition (proxy.ts — Next 16; implements PROXY-001..008)
Order of operations per request: (1) matcher excludes `/_next/*`, `/_vercel/*`, static/image files, `/api/*`, `/auth/callback`, `/sitemap.xml`; (2) next-intl negotiation computes locale + any rewrite/redirect; (3) Supabase session refresh runs against the (possibly rewritten) request; (4) refreshed auth cookies are merged onto WHATEVER response leaves the proxy — including intl redirects (`NextResponse.redirect` must not drop Set-Cookie); (5) request-cookie propagation: downstream RSC/handlers must observe the refreshed token in the same request (mutate forwarded request headers, not only the response). Desync rules: exactly one refresh per request; the server client never refreshes again in the same request; Supabase unreachable in the proxy → pass through unauthenticated, log event, never 500 the page. Authorization NEVER lives here (Constitution §3 applies to proxy.ts verbatim). Blocking suite: PROXY-INT.

## Destructive-Operation Boundary Matrix (ADR-04/05/09 amendment; SEC-016/DBMIG-010 implement)
Layout gate = early screen only. Enforcement lives at the trusted boundary. Boundary options: **A** RPC self-enforces (verifies AAL2/recent-auth from auth claims or a server-verified assertion), **B** RLS expresses the assurance requirement, **C** client EXECUTE revoked; op moves behind Route Handler/Edge Fn verifying identity+role+AAL+recent-auth independently. UI confirmation / layout gate / client wrapper are NOT enforcement.

| Sensitive operation | Existing boundary | Target authoritative boundary | Role | AAL2 | Recent-auth | Direct bypass possible today? | Test |
|---|---|---|---|---|---|---|---|
| Product delete | admin RLS | A: RPC w/ assurance check (or C if RPC absent) | ✔ | ✔ | ✔ | YES (raw REST delete under admin RLS) | BYPASS-01 |
| Category delete | admin RLS | A/C same | ✔ | ✔ | ✔ | YES | BYPASS-02 |
| Gallery album delete | admin RLS | A/C same | ✔ | ✔ | ✔ | YES | BYPASS-03 |
| Custom-build delete | admin RLS | A/C same | ✔ | ✔ | ✔ | YES | BYPASS-04 |
| Cloudinary delete | Edge Fn (JWT→is_admin) | Edge Fn + AAL2 + recent-auth verification added | ✔ | ✔ add | ✔ add | partial (no AAL/recency today) | BYPASS-05 |
| Role change | set_admin_role SECURITY DEFINER | A: RPC adds assurance verification | ✔ | ✔ add | ✔ add | YES (RPC callable w/o AAL2) | BYPASS-06 |
| Admin removal | remove_admin SECURITY DEFINER | A same | ✔ | ✔ add | ✔ add | YES | BYPASS-07 |
| Notification broadcast | superadmin RPC (broadcast_id) | A: RPC adds assurance verification | ✔ | ✔ add | ✔ add | YES | BYPASS-08 |
| Bulk destructive (batch delete) | Edge Fn batch cap / RLS | C: handler-or-EdgeFn wrap w/ full verification | ✔ | ✔ | ✔ | YES | BYPASS-09 |

BYPASS tests are blocking (QG-P6): call each operation directly (raw RPC/PostgREST/Edge Fn, no UI) as (a) non-admin, (b) AAL1 admin, (c) AAL2 admin w/o recent auth, (d) AAL2 + recent auth — only (d) succeeds. Design note for SEC-016: Supabase exposes AAL + auth_time-equivalent in JWT claims; RPCs can inspect `auth.jwt()`; where claims are insufficient for recency, option C applies. Chosen mechanism per row is finalized in the SEC-018 design (⛔ approved), migrated by DBMIG-010, implemented in application code by SEC-016, and UX-integrated + end-to-end verified by ADMIN-003 — an acyclic chain; then locked here.

## Layout gates ≠ complete admin security (language correction pack-wide)
Rules now binding: protected data access verifies permission close to the data source; every mutation re-authorizes independently; direct DB calls rely on tested RLS/RPC (CT-RLS/CT-RPC); AAL/recent-auth-sensitive operations enforce at their trusted boundary per the matrix. Any pack text implying "admin layout gate = admin security" is superseded.

## Rate-limit state store (ADR-18 — OPEN until SEC-014)
Process-local memory counters are prohibited on serverless. Until ADR-18 closes: no app-level auth/public-form rate-limit implementation may start (AUTH-012/013, SEC-015 blocked). The evaluation must fix: trusted client-IP source on Vercel, HMAC/pseudonymized identifier keys, retention + cleanup, atomic increments under concurrency, DB amplification bounds, cost.

## Cloudinary enforcement correction (ADR-21)
`max_file_size`/`allowed_formats` enforcement uses a **signed upload preset** (server-enforced by Cloudinary); the Edge Fn authorizes preset + folder, never free-form params assumed to be enforced. Negative test UPL-NEG blocking.

## CSP hardening path (SEC-017)
`'unsafe-inline'` is transitional, not permanent: maintain a violation inventory from report-only (P1→P7); audit inline scripts/styles (Next runtime, JSON-LD blocks, theme snippets); assess nonce/hash feasibility with Next 16; at P7 make the explicit ⛔ decision to remove `'unsafe-inline'` where practical or document the exception with reasons. Do not break Next/Turnstile/fonts for theoretical purity.
