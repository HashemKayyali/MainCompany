# IMG-014 — Phase 2 client bundle report

Captured 2026-07-11 from the production build of `eventies-next/` (ADR-23 traditional model, full visual port).

| Metric | Value |
|---|---|
| Total client JS chunks (`.next/static/chunks`) | **1,176 KB raw / 18 files** |
| Vite baseline (BASE-004) | 2,847 KB raw JS |
| Ratio | **~41%** of the legacy total-JS baseline |

## Notes
- The WebGL shader (`@paper-design/shaders-react`) is loaded via `next/dynamic({ ssr: false })` from the hero island — it lives in its own on-demand chunk and is **verified absent from the server HTML and the shared bundle** (Constitution §2 / CAT-002).
- framer-motion (hero + Reveal) is client-island-scoped, not in the server render path.
- Public catalog routes are ● SSG / ○ static; detail routes are ●+ƒ (SSG warm-up + on-demand for unknown slugs → real 404).
- next/image via the custom Cloudinary loader bypasses the Vercel optimizer (no image billing); transforms verified (`c_limit,w_*,f_auto,q_auto`).

Per-template LCP/CLS field numbers vs the BASE-004 Lighthouse budgets are a deployed-preview measurement (the parity/perf gate's post-cutover step) — the local build confirms the JS floor is well under baseline.
