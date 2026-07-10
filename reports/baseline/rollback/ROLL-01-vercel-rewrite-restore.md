# BASE-022 / ROLL-01 prep — vercel.json restorable artifact

- **Captured:** 2026-07-11, Phase 0, from `eventies-next-reconstruction` @ `f1d441a4`
- **Snapshot file:** `reports/baseline/rollback/vercel.json.P0-snapshot.json` (byte-identical copy of repo-root `vercel.json`)
- **SHA-256:** `34121110A7882F6FC69DAFD799ECAFA8DD07D34DBDD00E313D38710E2B058036`

## What this restores

The full production Vite routing/header state on Vercel:

1. **Rewrites** (order matters): `/sitemap.xml → /api/sitemap`, then explicit `/reset-password`, `/update-password`, `/auth/callback` → `/`, then the SPA catch-all `/((?!api/).*) → /` which, combined with `cleanUrls: true`, lets Vercel serve the prerendered `route.html` files where they exist.
2. **Headers**: global XFO/nosniff/referrer set; immutable caching for `/assets`; day-cache+SWR for `/images` and `/brand`; the 16-entry `X-Robots-Tag: noindex, nofollow` list for private/auth routes.

## Restore procedure (any cutover rollback)

1. `git checkout <this-commit> -- reports/baseline/rollback/vercel.json.P0-snapshot.json`
2. Copy it over the deployed project's `vercel.json` (or revert the strangler rewrite commit).
3. Verify the SHA-256 above matches, redeploy, then re-run the BASE-005 header baseline script and diff — it must be clean.

Any strangler-phase edit to `vercel.json` (per-route-group rewrites to the Next app) must keep this artifact untouched; the snapshot is the ground truth for "Vite serves everything" state.
