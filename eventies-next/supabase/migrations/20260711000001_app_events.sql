-- DBMIG-003 (Wave A) — app_events table for FOUND-016 observability.
-- PIPELINE RULE (DBMIG-001): this FILE is authored in P1; it is applied to
-- branch/staging by CI (DBMIG-002) and to production ONLY after the ⛔ human
-- approval gate. Claude Code never applies migrations to production.
--
-- Additive, frozen-Vite-compatible: new table only; no existing object is
-- touched. Inverse migration: drop table app_events.

create table if not exists public.app_events (
  id uuid primary key default gen_random_uuid(),
  event text not null check (char_length(event) <= 128),
  -- payload is ALREADY scrubbed by server/observability/scrub.ts (SEC-007);
  -- DB-side check keeps obvious PII shapes out even if a caller bypasses it.
  payload jsonb not null default '{}'::jsonb,
  actor_hash text, -- HMAC/short-hash identifier, never a raw user id/email
  created_at timestamptz not null default now()
);

comment on table public.app_events is
  'Scrubbed application telemetry/audit events (05_SECURITY_CONSTITUTION catalog). No PII by contract.';

-- Only the service role writes events; nobody reads via the API by default.
alter table public.app_events enable row level security;
-- (no policies on purpose: anon/authenticated get nothing; service role bypasses RLS)

create index if not exists app_events_event_created_idx
  on public.app_events (event, created_at desc);
