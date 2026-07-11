# SEC-014 — ADR-18 closure: rate-limit state store

Status: **CLOSED — decision: Supabase Postgres atomic counters (RPC), behind the FOUND-033 interface.** Implementation lands P3 (SEC-015).

## Options evaluated

| Criterion | A: Supabase RPC counters | B: Vercel KV / Upstash Redis | C: Cloudflare WAF-only |
|---|---|---|---|
| Atomicity under concurrency | ✔ single `insert … on conflict do update … returning` — one round trip, serializable enough for counters | ✔ INCR native | ✖ no app-level identifier dimension |
| Latency from fn (iad1 today / dub1 target) | ~same as every other DB call the request already makes (co-located after D-P0-07 fix) | +1 external service hop; new vendor | n/a |
| Identifier privacy | HMAC-SHA256(identifier, server secret) as key — raw identifiers never stored (05 requirement) | same technique possible | ✖ IP-only |
| Trusted client IP | `x-vercel-forwarded-for` first hop (Vercel-set, spoof-resistant) — SAME source for any option | same | CF would need to front Vercel (not current) |
| Retention/cleanup | `expires_at` column + periodic delete via existing scheduled-job pattern (storage-GC precedent) | TTL native | n/a |
| DB amplification bound | one UPSERT per guarded attempt, only on auth/forms/chat-send paths — bounded by Turnstile upstream; worst-case abuse ≈ the write load the DB rate-limit backstops already absorb today | none | n/a |
| Cost | $0 marginal (existing Supabase) | new paid dependency | new architecture |
| Ops surface | none new | new vendor, new envs, new failure mode | major |

## Decision rationale

The identifier dimension DOMINATES per 05 (Jordan CGNAT makes IP thresholds loose), so WAF-only (C) can't express the policy. Between A and B, A wins on zero new vendors, zero new secrets, co-located latency once the region decision (D-P0-07) lands, and the fact that the DB already holds the authoritative rate-limit backstops (contact_rate_limit functions — PRESERVED). Redis (B) is the documented fallback if P3 load tests show UPSERT contention (revisit condition: p95 counter round-trip > 30 ms or measurable connection pressure).

## Fixed by this ADR (SEC-015 implements)

1. Trusted IP source: first entry of `x-vercel-forwarded-for` (never client-supplied `x-forwarded-for` tail).
2. Keys: `hmac_sha256(RATE_LIMIT_KEY_SECRET, lowercase(identifier))` — new server-only env, added to `server/env.ts` schema at SEC-015.
3. Table: `rate_limit_counters(key text pk, window_start timestamptz, count int, expires_at timestamptz)` + atomic UPSERT RPC — migration FILE via the DBMIG pipeline (Wave C alongside REQ keys or its own file).
4. Cleanup: scheduled delete of expired rows (runbook pattern from storage-GC).
5. All thresholds remain SOLELY in `server/security/rate-limit.ts` (ADR-11 calibration).
