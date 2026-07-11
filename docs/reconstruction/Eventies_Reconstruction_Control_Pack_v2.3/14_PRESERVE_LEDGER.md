# 14 — PRESERVE LEDGER
Systems proven sound. Rewriting any of these without a Decision Log amendment is a violation. "Behaviorally compatible" = existing tests + contract tests must keep passing.

| Item | Path(s) | Why it is good | Sanctioned hardening | Must remain compatible |
|---|---|---|---|---|
| Supabase RLS estate | supabase/migrations (14 RLS tables) | anon surface minimal; user-scoping verified | RLS probe test suite added | all policies |
| Forced RPC contracts | 20260515_force_request_rpcs.sql + request RPCs | mutation authz at the correct layer; Expo contract | idempotency-key params; recent-auth assertion on destructive | signatures + semantics |
| Role-lock trigger | 20260515_lock_profile_role.sql | blocks client role escalation | — | exact behavior |
| Advisory-lock approval | 20260610_approve_rental_lock.sql | double-booking prevention | — | lock semantics |
| DB rate limits (contact) | 20260515/0610/0702 hardening migrations | abuse control where it can't be bypassed | chat msg-rate twin added (same pattern) | thresholds reviewed, not removed |
| Cloudinary Edge Fn | supabase/functions/cloudinary-assets | JWT→is_admin→folder whitelist→HMAC; batch caps; correct retry posture | quota + approved signed upload preset (ADR-21: preset carries allowed_formats/max_file_size; no client-supplied security params signed) | request/response shape |
| Image transform utils + presets | src/lib/image-delivery.ts | mature preset system, c_limit anti-upscale, f_auto/q_auto | reborn as lib/image-loader.ts | URL output format |
| Notification reducer + contract test | src/lib/notification-state* + contract test | tested, idempotent — the template for 09 | extended to chat pattern | reducer semantics |
| storage-gc tooling + reports | scripts/storage-gc/*, storage-gc-reports/ | tested, report-generating, integrity-hashed | scheduled (monthly) | report format |
| logs.service + entity-diff | src/services/logs.service.ts, src/utils/entity-diff.ts | real audit trail with human-readable diffs | + security events (05) | log shape |
| Redirect sanitizer | src/lib/auth-routing.ts (+ AUTH_PATHS logic in AuthCallback) | path-only, loop-guarded | unit tests added; ported to lib/ | exact accept/reject behavior |
| Sitemap implementation | api/sitemap.ts | paginated, anon-first, fail-safe 503, SWR cache | +/custom-builds, alternates, visibility check | URL set ⊇ current |
| Existing tests (17 files) | src/**/__tests__ | race/contract/identity coverage | ported into new repo test tree | keep green |
| Admin page interiors | src/pages/admin/* | dense working UIs; rebuild = pure cost (ADR-04) | shell replaced; revalidation hooks added | user-visible behavior |
| Services layer signatures | src/services/*.service.ts | isomorphic-friendly domain contract | client injection (param), not rewrite | signatures + return types |
| OAuth used-code fallback | AuthCallback.tsx guard | covers refresh-mid-callback + double-run | ported into callback Route Handler | behavior |
| vercel.json noindex discipline + robots.txt | vercel.json, public/robots.txt | correct private-route hygiene | expressed as metadata robots in Next (parity-checked) | route set |
