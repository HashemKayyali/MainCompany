# BASE-019 / DEL-13 — hero-bg-event.png deletion proof

Date: 2026-07-11 · Evidence gate per PHASE_00 prompt §Required-analysis-3.

## Grep proof (whole repo, node_modules excluded)

`hero-bg-event` matches:
- `src/components/home/Hero.tsx:12` → `'/images/hero-bg-event.webp'` (**.webp**, kept)
- `src/pages/AuthPage.tsx:21` → `'/images/hero-bg-event.webp'` (**.webp**, kept)
- Documentation/ledger mentions only (IMAGE_PERFORMANCE_REPORT.md, Control Pack files)
- **Zero references to `hero-bg-event.png` in any code, HTML, CSS, or config**

## Runtime/OG proof

- BASE-003 SEO baseline (53 prod routes, full head extraction incl. og:image): **0 occurrences** of the .png
- Prod serves the file today (HTTP 200, ~1.13 MB) — pure dead weight next deploy removes

## Action

`public/images/hero-bg-event.png` (1,127 KB) **deleted**; `hero-bg-event.webp` (39 KB) retained.
Post-deploy follow-up per DEL-13 acceptance: watch the 404 monitor for `/images/hero-bg-event.png` for one release cycle (external hotlinks would show up there; none are known).
