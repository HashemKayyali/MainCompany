# CAT-024 UI/UX validation evidence

Validated: 2026-07-15  
Branch: `uiux-arabic-first-parity`  
Production reference: `https://www.eventiesjo.com/`

## Automated validation

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 707 packages installed from lockfile in 8 minutes |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run gate:arch` | PASS |
| `npm run gate:i18n` | PASS; EN/AR synchronized across 10 domains |
| `npm run gate:cycles` | PASS; 253 files, no circular dependency (95 Madge resolution warnings) |
| `npm test` | PASS; 48 files, 251 passed, 44 skipped |
| Staging Preview environment `npm run build` | PASS; Next.js 16.2.10, 77/77 pages, sitemap generated |
| Next Playwright suite | PASS; 84/84 across EN/AR desktop/mobile |
| Axe gate | PASS; no critical violations on Home in all four Playwright projects |

`npm ci` reported two moderate dependency vulnerabilities. They were not auto-fixed because
the phase explicitly forbids `npm audit fix --force`; no lockfile mutation was made.

## Browser interaction verification

The current local production build was run with branch-scoped Supabase Staging variables and
inspected in the in-app Chromium browser at `390x844`:

- Arabic returned `lang=ar`, `dir=rtl` and localized content.
- Document metrics were `clientWidth=381`, `scrollWidth=381`: no horizontal overflow.
- The mobile drawer moved focus to its first interactive control.
- Opening the drawer set `body.style.overflow=hidden`.
- Request Draft and Account links were present and localized.
- Escape restored focus to the Menu button, restored body scrolling, and removed the dialog
  after its exit transition.
- Local public WebP cards no longer emit the custom-loader width warnings after SmartImage
  bypasses the remote loader for `/public` assets.

## Regression preservation

The 84 passing E2E cases cover the existing Phase 3–6 security and workflow contracts,
including auth redirects, real 404s, contact security, rental controls, realtime/chat,
admin gating, destructive confirmation focus trapping, MFA, locale direction, headers, and
critical accessibility checks.

## Open acceptance items

- Vercel Preview deployment remains blocked by the two platform failures documented in
  `PREVIEW_DEPLOYMENT_STATE.md`; Production-target retries are forbidden.
- Staging lacks equivalent Production catalog/gallery/customer/custom-build data, so current
  category and product visual diffs cannot use equivalent content.
- Final visual captures at `360x800`, `768x1024`, and `1024x768` require a safe deployment of
  the current commit.
- Authenticated account/admin manual walkthroughs require supplied test credentials.
- Public About, Contact, Custom Builds, and Home retain P1 section-depth differences recorded
  in `BASELINE_MATRIX.md`.
- Phase 7 was not started.
