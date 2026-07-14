# Eventies Staging live validation report

**Attempt date:** 2026-07-14

**Supabase target:** Staging `ogfgaupebcabuoczoqcy`

**Vercel target:** Preview project `eventies-next-preview`

**Verdict:** `BLOCKED_WITH_EXACT_REASON`

## Precheck evidence

- Worktree and branch were correct, clean, and synchronized.
- Supabase CLI was linked to `ogfgaupebcabuoczoqcy`, never to the forbidden Production ref.
- Vercel was linked to `eventies-next-preview`.
- Local and remote migration history matched for all eleven versions from `20260710000000` through `20260715000004`.
- No secret value, cookie, JWT, password, database connection string, or complete application URL was printed.

## Environment guard evidence

`eventies-next/scripts/assert-staging-environment.mjs` was added before any network-capable build or validation command. It:

- requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY`;
- requires the authorized Staging project ref in the public URL;
- rejects the Production project ref;
- checks every configured Supabase URL without printing its value;
- emits only the confirmation token, safe project ref, or rejected variable names.

The mandated `npx vercel env run -e preview -- node scripts/assert-staging-environment.mjs` execution failed closed. With the ignored `.env.local` present, Vercel CLI loaded that file and the guard rejected its Production-targeted public URL. The file was then temporarily isolated and restored unchanged, but a second official `env run` execution injected none of the required Preview variables.

A read-only `vercel env pull` to an ignored temporary file confirmed these Preview entries were unavailable as empty values to local execution:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `TURNSTILE_SECRET_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `ADMIN_DESTRUCTIVE_ENABLED`
- `NEXT_PUBLIC_ADMIN_DESTRUCTIVE_ENABLED`
- `ADMIN_MFA_ROLLOUT`

These required names were absent from the pulled Preview configuration:

- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (the automatic `VERCEL_URL` name exists, but no explicit application URL variable is configured)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_ADMIN_UPLOAD_PRESET`

The temporary Preview file was deleted after the name/state audit and was never tracked. Supabase Edge Function secrets were not queried because the task required an immediate stop when the guard failed.

Local non-network validation of the guard passed both directions: a synthetic Staging environment emitted `STAGING_ENV_CONFIRMED` with the safe ref, while a synthetic Production URL was rejected using only the variable name. Repository format and lint checks also passed after the guard/report changes.

## Live-validation result

The guard never returned `STAGING_ENV_CONFIRMED`. Therefore no safe build, integration test, Playwright run, Preview deployment, disposable user/record creation, Auth flow, RLS/RPC persona test, MFA flow, Realtime subscription, Cloudinary operation, fixture cleanup, or live Phase 3–6 mutation was executed.

- `QG-P3`: **BLOCKED** — no new mandatory live Auth/security evidence.
- `QG-P4`: **BLOCKED** — no live customer transactional evidence.
- `QG-P5`: **BLOCKED** — no live Realtime/chat/notification evidence.
- `QG-P6`: **BLOCKED** — no live MFA/authorization/audit/media evidence.

## Safety and owner action

- Production was not accessed again and was not mutated.
- Staging was not mutated during this attempt.
- No Vercel deployment or Edge Function deployment occurred.
- No customer data or disposable fixture was created.
- Phase 7 was not started.

Owner action is required to make the exact Preview variables above available to `vercel env run -e preview` with non-empty Staging values and to configure/verify the separately scoped Cloudinary Edge Function secrets. After that, rerun the guard and proceed only if it returns `STAGING_ENV_CONFIRMED` with `ogfgaupebcabuoczoqcy`.
