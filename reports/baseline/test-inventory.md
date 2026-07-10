# BASE-007 — Existing-Test Inventory & Gap Notes vs 18_TEST_MASTER_MATRIX

Captured 2026-07-11. Suite state: **20 test files / 203 tests, all green** (BASE-001).
Ledger correction: BASE-001/FOUND-006 say "17 test files" — actual count is **20** (D-P0-01).

## Inventory → matrix mapping

| # | Test file | Covers | Nearest 18-matrix ID | Framework-free (portable per FOUND-006)? |
|---|---|---|---|---|
| 1 | `src/lib/__tests__/notification-state.test.ts` | notification reducer: ordering, dupes, read-state | **RD-01** (partial — notification cases only, no chat) | yes |
| 2 | `src/lib/__tests__/notification-migration-contract.test.ts` | notification payload/contract shapes | **CT-RPC** (notification subset) | yes |
| 3 | `src/services/__tests__/session-races.test.ts` | auth session race behavior | **AU-RS** neighborhood (not the modal-survival case itself) | yes |
| 4 | `src/services/__tests__/persistence-race.test.ts` | storage persistence races | supports AU-RS/MUT-SS domains | yes |
| 5 | `src/services/__tests__/storage-identity.test.ts` | storage identity keys | — (infra) | yes |
| 6 | `src/services/__tests__/asset-session.test.ts` | asset upload session | UPL-PF neighborhood | yes |
| 7 | `src/services/__tests__/cloudinary-identity.test.ts` | Cloudinary asset identity | IMG group | yes |
| 8 | `src/services/__tests__/cloudinary-service.test.ts` | Cloudinary service calls | IMG group | yes |
| 9 | `src/services/__tests__/image-variants.test.ts` | variant/srcset math | **IMG-001** (port suite named in ledger) | yes |
| 10 | `src/utils/__tests__/media-frame-delivery.test.ts` | media frame delivery | **IMG-001** (port suite named in ledger) | yes |
| 11 | `src/lib/__tests__/image-delivery.test.ts` | preset/transform URL builder | FOUND-022 loader parity | yes |
| 12 | `src/pages/admin/productForm/__tests__/media-invariants.test.ts` | product form media invariants | UPL-PF neighborhood | mostly (imports service layer) |
| 13–16 | `src/services/storage-gc/__tests__/{classifier,cleanup,enumerator,reference-index}.test.ts` | storage GC pipeline | IMG-007/008 (GC runbook) | yes |
| 17 | `src/components/notifications/__tests__/NotificationBell.test.tsx` | bell/badge component | NOTIF-004 | no (React component test) |
| 18 | `src/contexts/__tests__/DialogContext.route-lifecycle.test.tsx` | dialog vs route lifecycle | — (UX regression) | no (React) |
| 19 | `src/hooks/__tests__/useBodyScrollLock.test.tsx` | scroll lock hook | — (UX regression) | no (React hook) |
| 20 | `src/utils/__tests__/route-lifecycle.test.ts` | route lifecycle utils | — (infra) | yes |

## Gaps vs P0-required matrix rows (to be built in this phase)

| Matrix ID | Status today | P0 action |
|---|---|---|
| **SAN-01** | ❌ no tests exist for `src/lib/auth-routing.ts` sanitizer | BASE-009 writes them |
| **AU-RS** | ❌ session-races tests exist but do NOT encode TOKEN_REFRESHED reference-stability (modal survives) | BASE-010 writes it |
| **RD-01** | ⚠️ notification reducer cases exist; no reusable harness, no chat cases | BASE-011 extracts harness |
| **E2E skeleton** | ⚠️ `playwright.config.ts` exists with 4 mobile-device projects + 1 spec (`e2e/mobile-stability.spec.ts`, dev-server target, stubbed Supabase env). Missing: desktop project, en/ar dimension, auth helper, prod-build target, committed sample specs per skeleton spec | BASE-008 extends it |

## Later-phase gaps (no P0 action, recorded for planning)

- No CT-RLS (anon/user/admin probe matrix) — FOUND-027.
- No enumeration diff-test (AU-EN), no Turnstile form tests (FORM-TS) — P3.
- No idempotency/mutation tests (MUT-DC/TO/SS) — P4.
- No realtime reconnect/race/leak tests (RT-RC/RACE/LEAK) — P5 (RD-01 harness from BASE-011 is the foundation).
- No visual/RTL suites (RTL-V/G, AR-DL/SW) — P2.
