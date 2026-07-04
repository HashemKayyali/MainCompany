# Admin i18n / RTL / Bidi Audit Report (Phase 7.5)

Branch: `admin-panel-redesign-mobile-first` · Uncommitted · Date: 2026-07-04

## 1. Localization architecture (as found)

Three layers in `src/lib/i18n.ts` + `src/contexts/LanguageContext.tsx`:

1. **`t(key)`** — dictionary lookup (`en`/`ar` `Messages`). Fallback chain: locale dict → arPhraseMap → en dict → **raw key** (failure mode).
2. **`translateText(phrase)`** — source-English phrase lookup in `arPhraseMap` (~929 keys pre-audit). Fallback: readable English source (safe).
3. **`DocumentI18nBridge`** — a MutationObserver DOM walker that auto-translates **every visible text node** plus `placeholder`/`aria-label`/`title`/`alt` attributes via `translateVisibleText` when locale is `ar`. Opt-out: `data-i18n-skip`. Dynamic patterns (`Label (n)`) via `translateDynamicPhrase`.

Because of layer 3, hardcoded English JSX in admin **is** translatable — coverage lives in `arPhraseMap`, not in per-component wiring.

## 2. Root causes of partial translation

1. **`arPhraseMap` coverage gap**: 495 admin-scope UI phrases had no Arabic entry (measured by the new audit script). The bridge safely left them English.
2. **Raw-key leak**: `DialogContext` fallback buttons used `t('admin.dialog.ok'/'delete'/'cancel')` — keys that existed in **no** dictionary → literal `admin.dialog.cancel` rendered on every confirm/alert without explicit labels, in both languages.
3. **No content-direction strategy**: DB content (product names/descriptions) inherited page RTL, and was theoretically at risk of machine-translation by the DOM bridge if a value coincided with a UI phrase (e.g. a product named "Gallery").

## 3. Fixes applied

### Missing dictionary keys (Case C/D)
- Added `admin.dialog.ok` / `admin.dialog.delete` / `admin.dialog.cancel` to both `en` and `ar` dictionaries. **Zero raw `t()` keys remain** — all other `t()` call sites (`contact.*`, `language.*`, `validation.*`) verified against dictionaries.

### Phrase coverage (Cases A/F/J/N/Q/R/S/T/U/W/X/Z)
- Added **~490 Arabic phrase entries** to `arPhraseMap` covering all 12 admin pages, the shell (Sidebar, BottomBar, UserMenu, Layout), all shared primitives (KebabMenu, ConfirmDialog, FormModal, DetailModal, ViewToggle, Pagination, EmptyState), all 5 product form tabs, MediaPlacementModal, Image/VideoUploader, dialogs, toasts, empty/loading/error states, aria-labels, placeholders, sort/filter options, and case variants (`Adjust frame`/`Adjust Frame`, `Short description`/`Short Description`, …).
- Coverage measured by script: **495 missing → 6 intentional exclusions** (`JOD`, `Supabase`, `user@example.com`, `Promise` regex false-positive, and two `&amp;` source-encoding false-negatives that are covered at runtime as `Pricing & visibility` / `Rental & inventory`).

### Memoization / reactivity (Cases K/L/M)
- Audited: `AdminLayout` crumbs/title `useMemo` depend on `translateText` (context identity changes with locale → recompute ✓); Sidebar/BottomBar module constants store **English labels** and translate at render ✓; the DOM bridge re-translates on locale flip for everything else. **No stale-language bug found** — verified live: AR→EN and EN→AR switch instantly with zero leftovers, no reload.

### Status/role/options (Cases H/I/J)
- Roles already map through `roleLabel()` → `translateText` (Sidebar/Admins pages). Request statuses render through label maps translated by the bridge. Select options keep stable values with localized labels (bridge translates option text; values untouched).

## 4. Content-direction strategy (Sections 4–7)

- **New `src/components/admin/BidiText.tsx`**: `<bdi dir="auto" data-i18n-skip>` — one component gives (a) content-driven direction, (b) bidi isolation for mixed strings, (c) **hard opt-out from the DOM translation bridge so DB content is never machine-translated**.
- Applied to: `AdminEntityCard` title/subtitle (covers Categories/Parts/Gallery/Builds/Customers cards), `ProductAdminCard` name/description, Products table name/description cells.
- **Forced LTR** (`dir="ltr" data-i18n-skip`): product slug in details modal; slug + currency inputs (`!text-start` to override the global `html[dir=rtl] input { text-align:right }` rule).
- **`dir="auto"` inputs**: product name, short/full description, internal notes (typing English in Arabic UI starts LTR; Arabic renders RTL).

Verified live: `Bike Blender` inside Arabic RTL page → computed `direction: ltr` via `<bdi>`; descriptions stay LTR; UI chrome around them RTL.

## 5. Audit tooling

- **`scripts/audit-admin-i18n.mjs`** (read-only, dev-only): extracts `arPhraseMap` keys, scans 49 admin-scope files for JSX text / label-attribute / `translateText()` strings, reports uncovered phrases. Re-runnable as a regression gate for future phases.

## 6. Live test results

| Check | Result |
|---|---|
| /admin/products AR, desktop | ✅ chrome Arabic, RTL layout, DB content English LTR, no raw keys |
| AR → EN switch (no reload) | ✅ instant, zero Arabic leftovers, `dir` flips |
| EN → AR switch (no reload) | ✅ (bridge re-walks DOM) |
| Confirm dialog buttons | ✅ "Cancel"/"Delete" (was raw `admin.dialog.*`) |
| 375px AR | ✅ RTL, bottom bar fully Arabic, no horizontal overflow, no raw keys |
| Kebab/bottom-sheet menus AR | ✅ items translated via bridge |
| Document title | ✅ "Admin Panel | Eventies" via translateText (fixed in Phase 1) |

## 7. TypeScript / build

- `npx tsc --noEmit` — ✅ pass (after removing 3 duplicate keys the batch initially collided with)
- `npm run build` — ✅ pass (`✓ built in 10.24s`)

## 8. Remaining known risks

1. **BidiText coverage is targeted, not exhaustive**: applied to the shared card primitives + product flows. Detail-modal fact *values*, request-details customer fields (email/phone should get `dir="ltr"`), and log JSON blocks would benefit from the same treatment — mechanical follow-up now that the component exists.
2. The DOM bridge translates by exact phrase — DB content that exactly equals a UI phrase is still translated **outside** `BidiText`-wrapped regions (e.g. inside `Modal` titles). Low probability; extend `BidiText`/`data-i18n-skip` where entity names render raw.
3. Arabic copy was authored in this pass and is dialect-neutral MSA; a native review pass is recommended before launch.
4. A handful of literals in plain string assignments (not JSX/attributes) evade the audit regex — `Grid`/`List`/`On request` were caught live and fixed; others may surface during Phase 8 QA.
5. Products table in RTL overflows horizontally inside its scroll wrapper (by design, `admin-table-wrap` scrolls) — worth a glance in Phase 8 on narrow desktop.
