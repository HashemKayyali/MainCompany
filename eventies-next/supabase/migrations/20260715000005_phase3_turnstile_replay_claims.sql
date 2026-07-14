-- FORM-TS forward correction: durable, cross-instance Turnstile replay claims.
-- Apply to staging before deploying the matching application code. This is
-- additive and does not alter any frozen Vite RPC signature.

begin;

create table if not exists public.turnstile_token_claims (
  token_hash text primary key check (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.turnstile_token_claims enable row level security;
revoke all on public.turnstile_token_claims from public, anon, authenticated;

drop function if exists public.claim_turnstile_token(text, integer);
create function public.claim_turnstile_token(
  p_token_hash text,
  p_ttl_seconds integer default 600
)
returns boolean
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_inserted integer := 0;
begin
  if p_token_hash !~ '^[0-9a-f]{64}$'
     or p_ttl_seconds < 60
     or p_ttl_seconds > 900 then
    raise exception 'invalid Turnstile replay-claim arguments' using errcode = '22023';
  end if;

  delete from public.turnstile_token_claims
  where token_hash = p_token_hash
    and expires_at <= pg_catalog.statement_timestamp();

  insert into public.turnstile_token_claims (token_hash, expires_at)
  values (
    p_token_hash,
    pg_catalog.statement_timestamp() + pg_catalog.make_interval(secs => p_ttl_seconds)
  )
  on conflict do nothing;

  get diagnostics v_inserted = row_count;
  return v_inserted = 1;
end;
$$;

alter function public.claim_turnstile_token(text, integer) owner to postgres;
revoke all on function public.claim_turnstile_token(text, integer)
  from public, anon, authenticated;
grant execute on function public.claim_turnstile_token(text, integer) to service_role;

create or replace function public.cleanup_phase3_security_state()
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_rate_rows integer := 0;
  v_dedup_rows integer := 0;
  v_turnstile_rows integer := 0;
begin
  delete from public.app_rate_limits
  where window_expires_at < pg_catalog.statement_timestamp() - interval '1 day';
  get diagnostics v_rate_rows = row_count;

  delete from public.public_form_dedup
  where expires_at < pg_catalog.statement_timestamp();
  get diagnostics v_dedup_rows = row_count;

  delete from public.turnstile_token_claims
  where expires_at < pg_catalog.statement_timestamp();
  get diagnostics v_turnstile_rows = row_count;

  return v_rate_rows + v_dedup_rows + v_turnstile_rows;
end;
$$;

alter function public.cleanup_phase3_security_state() owner to postgres;
revoke all on function public.cleanup_phase3_security_state()
  from public, anon, authenticated;
grant execute on function public.cleanup_phase3_security_state() to service_role;

commit;
