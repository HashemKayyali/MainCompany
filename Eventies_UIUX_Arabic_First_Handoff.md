# Eventies — UI/UX Parity, Arabic-First, Performance & Code Quality Handoff

**Updated:** 2026-07-15  
**Repository:** `C:\Users\PC\Desktop\Eventies-Next-Reconstruction`  
**Target Next.js app:** `C:\Users\PC\Desktop\Eventies-Next-Reconstruction\eventies-next`  
**Branch:** `eventies-next-reconstruction`  
**Latest authoritative commit at handoff:** `9af3bcc7`  
**Phase 7:** `NOT_STARTED` and remains out of scope.

---

## 1. Mission

Reconstruct the Next.js version so it matches the currently published Eventies website as closely as possible in:

- visual design;
- spacing and layout;
- typography;
- colors, borders, radii, shadows, and gradients;
- responsive behavior;
- animations and interactions;
- Arabic and English presentation;
- page hierarchy and component behavior.

The current published Eventies website is the **visual source of truth** unless a clearly documented improvement is required to fix an existing bug, accessibility problem, performance problem, or poor responsive behavior.

This is **not a free redesign**. First reach design and behavior parity. Then improve code quality and performance without changing the approved look.

---

## 2. Source and Target

### Legacy visual reference

The legacy Vite/React implementation is located mainly under:

```text
C:\Users\PC\Desktop\Eventies-Next-Reconstruction\src
C:\Users\PC\Desktop\Eventies-Next-Reconstruction\public
```

Important legacy areas include:

```text
src/components
src/pages
src/styles
src/contexts
src/hooks
src/services
src/data
src/config
src/lib
src/utils
```

The published production website should also be inspected directly:

```text
https://eventies.com
```

### Next.js target

The Next.js implementation is located under:

```text
C:\Users\PC\Desktop\Eventies-Next-Reconstruction\eventies-next
```

Important target areas include:

```text
eventies-next/src/app
eventies-next/src/components
eventies-next/src/features
eventies-next/src/messages
eventies-next/src/i18n
eventies-next/src/hooks
eventies-next/src/lib
eventies-next/src/server
eventies-next/src/shared
eventies-next/public
```

Before beginning UI work, deploy a fresh Preview from the latest Git commit and use that deployment as the Next.js comparison target.

---

## 3. Current Formal Project Status

The security, authorization, admin-assurance, media boundary, and cache work for Phase 6 is complete.

```text
QG_P6_STATUS=PASS
PHASE6_IMPLEMENTATION_STATUS=CLOSED
LIVE_CACHE_PROBE_EXIT_CODE=0
QG_P4_SHARED_CACHE_ITEM=PASS
QG_P4_OVERALL_STATUS=STILL_PENDING_OTHER_ITEMS
PHASE7_STATUS=NOT_STARTED
```

Relevant commits:

```text
9af3bcc7 docs(QG-P6): record final live cache pass
4e33e2cd fix(cache): invalidate public routes after admin mutations
6f34510f docs(phase6): close staging security implementation
88592a60 test(edge): preserve canonical folder contract literal
3a70eaaa fix(edge): accept canonical Cloudinary folder paths
```

Authoritative reports:

```text
reports/PHASE_04_REPORT.md
reports/PHASE_06_REPORT.md
reports/STAGING_LIVE_VALIDATION_REPORT.md
reports/UI_UX_VISUAL_AUDIT_BACKLOG.md
reports/evidence/PHASE6_LIVE_CACHE_20260715.txt
```

Do not reopen completed Phase 6 work unless a UI change creates a verified regression.

---

## 4. Safety and Environment Rules

Authorized Supabase Staging project:

```text
ogfgaupebcabuoczoqcy
```

Forbidden Production project:

```text
dqizzlcsioqykfeldtsj
```

Rules:

1. Never modify, migrate, seed, reset, or test against Production.
2. Keep Preview isolated from Production.
3. Keep destructive Next.js rollout disabled:
   ```text
   ADMIN_DESTRUCTIVE_ENABLED=EMPTY
   NEXT_PUBLIC_ADMIN_DESTRUCTIVE_ENABLED=EMPTY
   ```
4. Do not include `.env`, `.env.local`, tokens, JWTs, cookies, passwords, TOTP secrets, service-role keys, private keys, or protected credential files in commits, reports, screenshots, or ZIP bundles.
5. Do not start Phase 7.
6. Do not weaken auth, MFA, RLS, cache authorization, audit logging, or admin invariants for UI convenience.
7. Use a new UI branch before editing:
   ```text
   uiux-parity-arabic-first
   ```

---

## 5. Highest Priority: Arabic Visual Quality

Arabic is **P0** and must be handled before general visual approval.

Current reported problems:

- the Arabic font looks weak and unofficial;
- lines overlap;
- line-height is too compressed;
- Arabic glyphs can appear clipped;
- RTL alignment is inconsistent;
- mixed Arabic/English content can break direction;
- some icons and controls may mirror incorrectly;
- mobile Arabic layouts are especially weak.

### Arabic acceptance requirements

- Select one formal, elegant, readable Arabic family and use it consistently.
- Strong candidates to evaluate:
  - `IBM Plex Sans Arabic`;
  - `Noto Kufi Arabic`;
  - another licensed project-approved Arabic family already available through a safe web-font or package source.
- Do not ship font files manually or commit private font files.
- Define explicit Arabic typography tokens:
  - body line-height;
  - heading line-height;
  - weights;
  - responsive font sizes;
  - paragraph measure;
  - button and label sizes.
- Ensure no overlap at 200% browser zoom.
- Ensure no clipped ascenders or descenders.
- Validate Arabic numerals, English numerals, currency, product codes, emails, phone numbers, dates, and mixed-language labels.
- Use `dir`, `bdi`, `bdo`, `unicode-bidi`, logical CSS properties, and text alignment deliberately.
- Do not flip icons that should keep a universal physical direction.
- Do flip directional icons where the action direction depends on RTL.
- Validate every Arabic page independently; do not assume English CSS automatically works in RTL.

CAT-024 must remain unapproved until Arabic typography and RTL behavior are visually accepted.

---

## 6. UI/UX Work Plan

Work in controlled batches. Do not make hundreds of unrelated edits in one commit.

### Batch A — Baseline, inventory, and visual source of truth

1. Create a fresh Preview from the latest commit.
2. Build a route inventory for both EN and AR.
3. Map each legacy page/component to the equivalent Next.js page/component.
4. Capture desktop, tablet, and mobile screenshots for both production and Next.
5. Create a difference matrix:
   - critical;
   - major;
   - minor;
   - preference;
   - intentional improvement.
6. Record missing pages, missing sections, missing states, and different interaction behavior.
7. Record console errors, hydration warnings, failed images, network errors, and layout shifts.

Deliverable:

```text
reports/UI_UX_PARITY_AUDIT.md
```

### Batch B — Design tokens and typography foundation

Audit and unify:

- English and Arabic font families;
- font weights;
- type scale;
- line-height;
- container widths;
- section spacing;
- grid gaps;
- colors;
- gradients;
- border colors;
- radii;
- shadows;
- motion duration and easing;
- focus rings;
- z-index layers;
- breakpoints.

Do not scatter one-off values across components when a stable design token can represent the approved design.

Deliverable:

```text
src/app/globals.css
tailwind.config.ts
shared design-token utilities
typography regression checks
```

### Batch C — Global shell parity

Compare and repair:

- navbar;
- desktop navigation;
- mobile navigation;
- language switcher;
- user/account controls;
- header over hero behavior;
- sticky/fixed behavior;
- footer;
- global background;
- page containers;
- route transitions;
- scroll restoration;
- loading indicators;
- global error and not-found screens.

Test EN and AR on every target width.

### Batch D — Public page parity

Audit page by page:

1. Home
2. Products
3. Product details
4. Categories
5. Category details
6. Gallery
7. Customers
8. Custom builds
9. About
10. Contact
11. Legal pages
12. Search/filter states
13. Empty states
14. Loading and error states

For each page compare:

- section order;
- text widths;
- media ratio;
- card height;
- grid columns;
- spacing;
- background;
- animation;
- hover;
- swipe/drag;
- RTL behavior;
- mobile stacking;
- tablet behavior.

### Batch E — Commerce, forms, account, and realtime

Audit:

- login;
- registration;
- password reset/update;
- profile;
- cart;
- checkout;
- purchase quote;
- request history;
- request details;
- notifications;
- chat;
- contact/support/custom-build forms;
- validation errors;
- success states;
- disabled states;
- loading states;
- keyboard behavior;
- responsive dialogs and sheets.

Do not alter security behavior while changing visuals.

### Batch F — Admin Panel first complete walkthrough

The user has not yet completed a full Admin Panel walkthrough.

Audit every admin section:

- dashboard;
- products;
- categories;
- gallery;
- customers;
- builds;
- parts;
- requests;
- chat;
- notifications;
- broadcasts;
- users/admins;
- roles;
- audit history;
- MFA screens;
- media upload workflows;
- empty/loading/error states;
- destructive confirmation UI while rollout remains disabled.

Check:

- table density;
- mobile table strategy;
- horizontal overflow;
- sticky headers;
- filters;
- search;
- pagination;
- forms;
- modals;
- drawers;
- validation;
- RTL;
- mixed-language values;
- long text;
- long emails;
- long IDs;
- touch targets;
- keyboard navigation.

### Batch G — Responsive matrix

Required widths:

```text
360x800   small Android
375x812   compact iPhone
390x844   modern phone
430x932   large phone
768x1024  iPad portrait
820x1180  modern iPad portrait
1024x768  iPad landscape / small laptop
1280x800  laptop
1440x900  desktop
1920x1080 large desktop
```

Required browsers through Playwright where supported:

```text
Chromium
Firefox
WebKit
```

Check orientation changes, browser zoom, reduced motion, touch, mouse, and keyboard.

### Batch H — Performance and code quality

Performance goals for the final audited Preview:

```text
LCP target: 2.5s or better on representative mobile testing
CLS target: 0.10 or lower
INP target: 200ms or better
No avoidable layout jumps
No oversized images
No unnecessary client-side JavaScript
No duplicate network requests
No repeated Supabase reads caused by component structure
No unbounded observers, timers, listeners, or realtime subscriptions
```

Audit and improve:

- Server Component vs Client Component boundaries;
- route-level data loading;
- duplicated queries;
- image sizing and priority;
- Cloudinary transformations;
- font loading;
- bundle size;
- dynamic imports;
- third-party scripts;
- animation cost;
- scroll performance;
- listener cleanup;
- memoization only where measured;
- duplicated CSS;
- dead code;
- duplicate components;
- weak naming;
- oversized components;
- unsafe casts;
- missing error handling;
- accessibility.

Do not rewrite stable working code merely to make it look “cleaner.” Every refactor must improve readability, reliability, performance, testability, or parity.

---

## 7. Engineering Rules

1. Fix root causes, not screenshots only.
2. Preserve existing security and data behavior.
3. Use logical CSS properties for bidirectional layouts.
4. Avoid CSS overrides that fight each other.
5. Avoid global selectors that unintentionally affect unrelated pages.
6. Avoid hardcoded heights for dynamic Arabic text.
7. Avoid `overflow: hidden` as a way to hide layout bugs.
8. Avoid loading all gallery media eagerly.
9. Avoid turning large route trees into Client Components.
10. Avoid adding libraries when existing project capabilities are sufficient.
11. Prefer reusable, tested primitives after visual requirements are understood.
12. Keep public pages indexable and preserve SEO behavior.
13. Keep images stable with explicit dimensions/aspect ratios.
14. Keep animations optional under `prefers-reduced-motion`.
15. Do not claim parity without screenshots and route-by-route evidence.

---

## 8. Required Quality Gates After Every Batch

Run:

```powershell
cd C:\Users\PC\Desktop\Eventies-Next-Reconstruction\eventies-next

npx tsc --noEmit
npm run build
npx vitest run
npx playwright test
```

Also verify:

- no console errors;
- no hydration warnings;
- no unhandled promise rejections;
- no failed image requests;
- no accidental Production references;
- no secrets in Git;
- no unexpected route or API behavior changes;
- no English regression after Arabic changes;
- no Arabic regression after English changes.

Before commit:

```powershell
cd C:\Users\PC\Desktop\Eventies-Next-Reconstruction

git diff --check
git status --short
```

Commits should be scoped and understandable, for example:

```text
style(ar): establish Arabic typography system
fix(nav): match legacy responsive navigation
fix(home): restore published hero and section parity
fix(admin): repair responsive tables and RTL forms
perf(images): reduce catalog image transfer and layout shift
refactor(ui): consolidate approved card primitives
```

---

## 9. Required Deliverables

The UI/UX work is not complete until the new chat produces:

1. `reports/UI_UX_PARITY_AUDIT.md`
2. route-by-route issue matrix;
3. screenshot evidence for production vs Next;
4. Arabic typography decision and implementation notes;
5. responsive test matrix;
6. Admin Panel walkthrough report;
7. accessibility findings;
8. performance before/after report;
9. list of changed files;
10. explanation of each major refactor;
11. test/build results;
12. fresh Preview URL;
13. clean Git state;
14. CAT-024 approval request only after visual acceptance.

---

## 10. Files Needed in the New Chat

Upload the ZIP generated by the accompanying PowerShell script.

The ZIP should include:

- legacy Vite `src`, `public`, relevant configs, tests, and scripts;
- Next.js `src`, `public`, configs, tests, scripts, and docs;
- Supabase migrations/functions without secrets;
- reports and UI backlog;
- Git summary and file manifests.

Also provide:

- production URL: `https://eventies.com`;
- the newest clean Next Preview URL created from the latest commit;
- screenshots of the worst Arabic issues on desktop and mobile;
- screenshots of any page where production and Next differ significantly;
- Admin Panel screenshots after logging in manually.

Do **not** upload:

- `.env`;
- `.env.local`;
- Supabase service-role keys;
- passwords;
- DPAPI credential files;
- cookies;
- JWTs;
- TOTP secrets or codes;
- private font files.

The user should log into Admin manually. Credentials must not be added to the ZIP or handoff.

---

## 11. First Instruction for the New Chat

Begin by reading this handoff and the generated bundle. Do not edit immediately.

First:

1. verify the repository map;
2. identify the legacy visual source and Next target;
3. verify the current Git status and branch;
4. create a fresh UI branch;
5. deploy or identify a fresh isolated Preview;
6. produce the complete parity audit and phased implementation plan;
7. start with Arabic typography and global RTL foundations;
8. then compare and fix the home page and global shell;
9. then complete the Admin Panel walkthrough;
10. keep Phase 7 closed.

The expected behavior is senior-level product design, frontend architecture, accessibility, responsive QA, performance engineering, and careful regression control.
