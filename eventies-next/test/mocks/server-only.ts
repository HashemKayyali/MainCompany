// Vitest shim: the real 'server-only' package throws when imported outside a
// React Server context. The gate that MATTERS (every src/server file carries
// the marker) is enforced by scripts/check-arch-gates.mjs, not by this shim.
export {}
