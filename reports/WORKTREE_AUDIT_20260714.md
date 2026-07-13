# Eventies uncommitted worktree audit — 2026-07-14

## Scope and safety

- Worktree: `C:\Users\PC\Desktop\Eventies-Next-Reconstruction`
- Branch: `eventies-next-reconstruction`
- Authorized remote database inspected read-only: Supabase Staging `ogfgaupebcabuoczoqcy`
- No Vercel deployment, user/fixture creation, SQL application, live-validation mutation, Production mutation, or Phase 7 work was performed.
- The required production build loaded the ignored `eventies-next/.env.local`, which targets the Production Supabase ref, and generated catalog pages through the public anonymous DAL. This constitutes read-only Production access and prevents the requested “Production was not accessed” confirmation. No authenticated, service-role, or mutation path was used.
- Initial index diff was empty. The worktree contained six modified and six untracked files.

## Original twelve-file classification

| File | Classification | Audit decision |
| --- | --- | --- |
| `eventies-next/src/__tests__/proxy-int.test.ts` | report or test evidence | Keep; AUTH-007 refresh coverage. Extended to preserve deletion-cookie semantics. |
| `eventies-next/src/app/api/auth/login/route.ts` | valid application correction | Keep; passes the validated remember-me choice to the server cookie boundary without sending it to Supabase Auth. |
| `eventies-next/src/app/api/auth/signup/route.ts` | valid application correction | Keep; applies the same persistence contract to signup. |
| `eventies-next/src/lib/supabase-browser.ts` | valid application correction | Keep after repair; browser SDK writes now pass through a dynamic cookie-policy adapter instead of relying on `cookieOptions.maxAge`, which the installed SDK overrides. |
| `eventies-next/src/proxy.ts` | valid application correction | Keep; refresh rotation preserves the selected persistence mode and HTTPS security. |
| `eventies-next/src/server/supabase/server-client.ts` | valid application correction | Keep; server Auth writes and rotations share the persistence policy. |
| `eventies-next/src/__tests__/auth-cookie-policy.test.ts` | report or test evidence | Keep; covers persistent, session, compatibility-default, marker, and deletion behavior. |
| `eventies-next/src/__tests__/contract/phase6-admin-audit-actions.test.ts` | report or test evidence | Keep; static contract evidence for the applied `20260715000004` migration. |
| `eventies-next/src/__tests__/contract/phase6-auth-time-hook.test.ts` | report or test evidence | Keep; static contract evidence for the applied `20260715000003` migration. |
| `eventies-next/src/shared/auth-cookie-policy.ts` | valid application correction | Keep after repair; centralizes persistence and preserves explicit deletion cookies. |
| `eventies-next/supabase/migrations/20260715000003_phase6_auth_time_claim_hook.sql` | required forward migration correction | Commit unchanged at the already-applied version. SHA-256: `214D914EF59AFDF15F73F6548C7FC3249C8F1BE7EE5CE4364AA008DE2AD24F52`. |
| `eventies-next/supabase/migrations/20260715000004_phase6_admin_audit_actions.sql` | required forward migration correction | Commit unchanged at the already-applied version. SHA-256: `C8DDBC78BAB0D7C1EF9E8F0D37F7B7947DC6E5D43F1290D9376BF209FBD36976`. |

No original file was classified as generated/local-only, accidental, or unsafe.

## Audit-driven corrections

- Added a direct `cookie` dependency because the browser adapter must parse and serialize cookies through a supported package boundary.
- The browser client keeps one application singleton, but its cookie writer reads the persistence marker at every write. This prevents a module-load-time client from retaining stale persistence state.
- BRIDGE-01 passes its authoritative legacy persistence inference before `setSession`, including session-scoped adoption.
- Explicit `Max-Age=0` or already-expired cookies retain deletion semantics in session mode.
- Added browser-boundary and bridge regression evidence.
- Added tracked ignore rules for `eventies-next/supabase/.temp/` and `eventies-next/.secure-schema-capture/`; the previous protection existed only in shared local Git metadata and was not portable to a fresh clone.

## Migration-history decision

Read-only `supabase migration list` confirmed local/remote version parity for eleven migrations through `20260715000004`. Versions `20260715000003` and `20260715000004` were already applied to Staging but absent from Git, rather than modifications to committed migration files. They are therefore committed with their existing filenames and bytes. No applied migration is renamed, amended, repaired, reset, or reapplied. Any later SQL correction must use a new forward-only version.

The `20260715000003` migration creates and grants the custom access-token hook function; activating that hook remains a separate Staging Auth configuration gate for live validation.

## Sensitive-data and local-artifact audit

- No database URL, connection string, password, API key, service-role value, JWT, Cloudinary secret, Turnstile secret, real customer identity, or customer record was found in the reviewed changes.
- Synthetic test token strings, cookie names, and PostgreSQL role names are not credentials.
- `eventies-next/.secure-schema-capture/production-db-url.txt` is absent.
- `eventies-next/supabase/.temp/` and `eventies-next/.secure-schema-capture/` are ignored and contain no tracked files.
- No secret or local schema-capture artifact is included in a commit.

## Validation

- Clean dependency install: PASS — `npm ci --no-audit --no-fund`, 707 packages.
- Format: PASS — all `src` and `scripts` files match Prettier.
- Typecheck: PASS — `tsc --noEmit`.
- Lint: PASS — ESLint exit 0.
- Architecture gates: PASS — server-only, cache boundary, service-role, and environment-prefix checks.
- I18N coverage: PASS — 10 EN/AR domains synchronized.
- Circular dependency gate: PASS — 238 files, no cycle.
- Focused AUTH-007, BRIDGE-01, canonical-baseline, and Phase 6 migration contracts: PASS — 70/70.
- Complete unit and contract suite: PASS — 38 files; 228 passed, 41 staging-gated skips, 2 existing TODOs.
- Production build: PASS — Next.js 16.2.10 compiled, typechecked, and generated 115 static pages. The environment-target issue above remains an audit blocker even though the build itself passed.
