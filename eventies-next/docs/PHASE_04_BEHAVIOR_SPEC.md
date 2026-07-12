# Phase 4 behavioral specification (REQ-001..008)

Source traced on 2026-07-13: legacy `RentalCartContext`, `PurchaseQuoteContext`, checkout/quote pages, and the two preserved JSONB RPCs.

## Draft ownership and survival

- Rental draft storage key remains `bl-rental-cart`; quote draft key remains `bl-purchase-quote-draft`.
- Drafts are device-local and anonymous-capable. Login redirects never clear, rewrite, or transfer them.
- Rental mode is either one shared date range or per-item ranges. Switching mode does not discard items.
- Duplicate product additions merge quantities; quantities are clamped to 1..100.
- Drafts clear only after a confirmed RPC result. Validation, auth expiry, network failure, timeout, and retry leave them intact.

## Submission reliability

- Each logical submit owns a UUID idempotency key stored with its pending client operation.
- Double-clicks share the same in-flight promise and key.
- Timeout/unknown-result retry reuses the same key. A user edit starts a new logical operation/key.
- The preserved RPC signatures remain `(payload jsonb)`; `idempotency_key` is an optional payload member so frozen Vite callers remain compatible.
- A duplicate `(profile_id, idempotency_key)` returns the original request id/number.
- Session expiry returns an auth-required state with a sanitized login return path; the draft remains.

## Reads and navigation

- `/my-requests`, `/my-requests/[number]`, `/order-summary/[number]`, and `/profile` sit below a server session layout.
- Reads are per-request, session-bound, RLS-backed, and never cached.
- Rental and quote lists load in parallel. Empty, timeout, not-found, and retry states are explicit.
- User-authored fields render with bidi isolation; EN/AR labels and status journeys are dictionary-backed.

## Database constraint audit

Already present: quantity `> 0`, rental days `> 0`, rental end `>=` start, request status enums, non-negative product stock/minimum-day constraints, and non-negative rental `extra_fees` clamping in the latest RPC.

Missing before Wave C: request-level idempotency keys/unique ownership, quantity upper bounds, and length caps for customer/contact/request-note fields. The Wave C file adds only those missing protections; existing date/positive-quantity constraints are not duplicated.
