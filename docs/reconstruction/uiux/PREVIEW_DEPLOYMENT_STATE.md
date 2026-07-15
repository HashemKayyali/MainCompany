# UI/UX Preview deployment state

Updated: 2026-07-15  
Branch: `uiux-arabic-first-parity`  
Application: `eventies-next/`  
Production reference: `https://www.eventiesjo.com/`

## Current status

Preview deployment is externally blocked and no new deployment is being retained or
promoted. Production remains unchanged.

The last known ready Next.js Preview from before this phase is:

- URL: `https://eventies-next-preview-ayfdnvmwc-hashemkayyalis-projects.vercel.app`
- Project: `eventies-next-preview`
- Limitation: it predates the current UI/UX commits and its Staging catalog does not contain
  equivalent Production category/product records.

## Verified configuration and root cause

The existing isolated project `eventies-next-preview` has the intended Next.js framework,
`eventies-next` Root Directory, framework-default commands/output, and Preview variables that
resolve to Supabase Staging project ref `ogfgaupebcabuoczoqcy`. A remote-environment build
detects Next.js `16.2.10`, builds all 77 routes, and generates the sitemap successfully.

Two independent Vercel failures occur after or outside that successful application build:

1. Git Integration builds inside `/vercel/path0/eventies-next/.next`, then its packaging
   phase looks for `/vercel/path0/.next/package.json` and fails with `ENOENT`. This is a Vercel
   monorepo Root Directory packaging regression, not a Next build failure.
2. A clean isolated project (`eventies-next-uiux-preview`) was created with Next.js defaults
   and Staging-only variables. Both a normal CLI deployment and an explicit
   `--target=preview` deployment were recorded by Vercel as `target: production`. Each attempt
   was stopped and deleted immediately. The clean project now has zero deployments.

Because the phase explicitly forbids Production-target deployments, no further deploy is
permitted until Vercel stops overriding Preview requests or Vercel support confirms a safe
project-level correction.

## Safety evidence

- No command used `--prod`.
- Both incorrectly classified deployments ended incomplete/error and were deleted:
  `dpl_9h5BJDtzjjaowKmTKN3xRFonGKBD` and `dpl_CJqGzrC9FNCYMCgNyMoDGpJRh78e`.
- `eventies-next-uiux-preview` has no deployments and no custom/Production domain.
- Supabase Production ref `dqizzlcsioqykfeldtsj` was checked fail-closed and was not used.
- Repository-root Vercel metadata and the old Vite `.env.local` were restored after the
  isolated diagnostic session.

## Safe reproducibility checks

These non-deploying commands are green. The build was run with the ignored, locally pulled
Preview environment after a fail-closed Staging-ref check; the clean project's new Sensitive
variables are intentionally not downloadable from Vercel CLI.

```powershell
cd eventies-next
npm run build
npm run typecheck
npm run lint
npm run gate:arch
npm run gate:i18n
npm run gate:cycles
npm test
```

Do not retry deployment unless the returned Vercel deployment is proven to have
`target: preview` before build execution.
