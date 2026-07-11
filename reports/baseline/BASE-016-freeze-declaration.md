# BASE-016 — Vite Freeze Declaration

Effective 2026-07-11 (Phase 0), per Architecture Constitution §7:

**The Vite application is bugfix-only from now until decommission (P7).**

## Sanctioned Vite-side changes — exhaustive list

1. **BASE-017** (P0 exception): compress `public/images/og-default.png` to ≤100 KB 1200×630.
2. **BASE-018** (P0 exception): align `index.html` meta copy with the prerender STATIC_PAGES copy.
3. **BASE-019** (evidence-gated DEL-13): delete unreferenced `public/images/hero-bg-event.png` — executed, proof in `reports/baseline/BASE-019-del13-proof.md`.
4. **Genuine production bugfixes** — each one logged in the phase report of the phase it lands in, with a task ID.
5. **Test/safety-net additions** (Phase 0 scope): new test files, E2E skeleton, baseline scripts — these add no production behavior.

Anything else touching `src/`, `api/`, `index.html`, `vercel.json`, or `public/` is a **stop condition** and needs a Decision Log entry first.

## Branch-protection notes (for the repo owner to apply on GitHub)

- Protect `main`: require PR review; no direct pushes; require the test suite green.
- Reconstruction work stays on `eventies-next-reconstruction` (this worktree branch) and its children.
- Vite bugfix PRs: branch from `main`, label `vite-freeze-exception`, reference a task ID, and land with a phase-report log line.
- The two P0 exception commits (BASE-017/018) are each their own PR per the phase prompt.

## Discovered-but-frozen items (recorded, deliberately NOT fixed)

- D-P0-04: `/notifications` missing from the vercel.json noindex list (candidate freeze-exception bugfix — needs human approval; one-line header addition).
- D-P0-08 / D-P0-09: redirect-sanitizer gaps (`/\` form, /login loop) — hardened at AUTH-004 in the Next app, encoded as behavior tests today.
- Mobile Lighthouse 0.28–0.34 and 2.8 MB JS baseline — the reconstruction's job, not a Vite patch.
