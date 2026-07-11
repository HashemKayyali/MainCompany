# 16 — TEMPORARY BRIDGE LEDGER
Default = zero bridges. One sanctioned.

**BRIDGE-01 — Auth session adoption (localStorage → cookies)**
Purpose: logged-in Vite users entering Next routes adopt a cookie session without re-login. · Creation: P1B prototype → production form in P3. · Owner: auth workstream. · Mechanism: first Next page load runs a one-time client snippet: read legacy `sb-{ref}-auth-token` (localStorage OR sessionStorage per legacy mode) → `supabase.auth.setSession` on the ssr browser client → verify `getUser()` → mark adopted (cookie flag). Legacy keys are NOT cleared while any Vite route remains live (P1B Q3/Q7). · Dependencies: P1B pass, esp. Q5 rotation measurement. · Risk: R-01. · Monitoring: `auth.bridge_adopted` / `auth.bridge_failed` events; forced-re-login rate <2% gate (QG-P3). · Fallback: bridge failure → normal signed-out state + login CTA (never a loop). · Removal trigger: all session-dependent route groups cut over + 2 release cycles + bridge_adopted rate <1%/wk. · Removal phase: P7 (with DEL-06 legacy-key hygiene at the same moment). · Test: P1B suite + P3 E2E (Vite-login → Next route → authenticated; rollback → Vite still authenticated).

Any additional bridge requires a Decision Log entry BEFORE code exists.
