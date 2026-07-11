# P1 — Empty-app bundle report (the floor for later budgets)

Captured 2026-07-11 at the end of Phase 1 (no product pages; hello page + i18n + proxy + headers only).

| Metric | Value |
|---|---|
| Total client JS chunks (`.next/static/chunks`) | **693 KB raw across 12 files** (pre-gzip) |
| Routes | `/[locale]` (PPR: /en, /ar), `/_not-found`, `/api/revalidate`, proxy |
| Baseline comparison | Vite app ships 2,847 KB raw JS (BASE-004 bundle report) |

Reading: the framework+i18n floor is ~24% of the legacy total-JS baseline. P2 budgets
(`reports/baseline/performance-budgets.draft.json`: ≤300 KB JS per public route target)
are measured as DELTA over this floor; three.js/shader code must never enter shared
chunks (CAT-002 island rule) — the floor report is the tripwire.
