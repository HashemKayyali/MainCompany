# BASE-014 / BASE-015 — BLOCKED: human-run captures (runbooks prepared)

Status: **BLOCKED — requires access only a human operator has.** Per the V2.3 evidence-hygiene rules, the raw artifacts these tasks produce must NEVER enter git; only sanitized summaries do. This file is the exact procedure so either task is a ~20-minute human session.

## BASE-014 — Prod auth behavior capture (BLOCKED: needs a real user login session)

**Why blocked:** capturing requires signing into production with real Google/password credentials. Credential entry is operator-only.

**What is needed:** one operator session on https://www.eventiesjo.com with a test Google account + a password account, screen recorder on, browser devtools open (Network + Application→Storage tabs).

Scenarios to record (raw recordings → private storage, e.g. the team drive — NOT git):
1. **OAuth happy path:** /login → Google button → consent → landing. Note: final landing path, whether `redirect` param survives, localStorage vs cookie storage keys created (`sb-*`), and total wall time.
2. **Refresh mid-callback:** start OAuth, and on the /auth/callback screen press F5 before it completes. Expected per `src/pages/AuthCallback.tsx`: used-code fallback path — record whether the user lands signed-in, sees a friendly error, or loops.
3. **Remember-me ON vs OFF:** password login twice. Record which storage the `sb-*` token lands in per mode (localStorage vs sessionStorage), then close/reopen the browser and record whether the session survives.

**Sanitized summary template (this is what gets committed):** per scenario — outcome, landing route, storage class used (no token values), timings, and any console errors (redact ids). Save as `reports/baseline/BASE-014-auth-behavior-summary.md`.

## BASE-015 — GSC / analytics baseline (BLOCKED: needs Search Console + analytics access)

**Why blocked:** GSC property for eventiesjo.com is bound to the owner's Google account; no API credentials are available to this session.

**What is needed:** 15 minutes in Search Console (+ Vercel Analytics if enabled).

Derived, non-sensitive metrics to transcribe (commit-safe; raw exports stay private):
1. **Coverage:** counts per state (indexed, crawled-not-indexed, excluded-by-noindex, 404, redirect) — numbers only.
2. **Top-query themes:** the top ~10 queries grouped into themes (brand / product-category / arabic queries present yes-no) — no user data.
3. **Page-level:** count of indexed /products/* pages vs the 30 in the sitemap; whether any legal-alias URL (e.g. /privacy) is indexed (feeds the CAT-018 redirect priority).
4. **Core Web Vitals report state:** pass/needs-improvement/poor URL counts per form factor.

Save as `reports/baseline/BASE-015-gsc-baseline.md`. These four items are the two-week post-cutover comparison basis required by the SEO parity gate (11 §3).
