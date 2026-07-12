-- SEC-015 / FORM-004 — durable serverless rate limits and public-form dedup.
-- Additive and frozen-Vite compatible. Apply to branch/staging only through
-- the DBMIG pipeline; production execution is human-controlled.

create table if not exists public.app_rate_limits (
  bucket_key text primary key check (char_length(bucket_key) between 16 and 256),
  event_count integer not null check (event_count > 0),
  window_expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.app_rate_limits enable row level security;
revoke all on public.app_rate_limits from anon, authenticated;

create or replace function public.consume_app_rate_limit(
  p_bucket_key text,
  p_window_seconds integer
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  if char_length(p_bucket_key) < 16 or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate-limit arguments';
  end if;

  insert into public.app_rate_limits (bucket_key, event_count, window_expires_at)
  values (p_bucket_key, 1, now() + make_interval(secs => p_window_seconds))
  on conflict (bucket_key) do update set
    event_count = case
      when app_rate_limits.window_expires_at <= now() then 1
      else app_rate_limits.event_count + 1
    end,
    window_expires_at = case
      when app_rate_limits.window_expires_at <= now()
        then now() + make_interval(secs => p_window_seconds)
      else app_rate_limits.window_expires_at
    end,
    updated_at = now()
  returning event_count into v_count;

  return v_count;
end;
$$;

revoke all on function public.consume_app_rate_limit(text, integer) from public;
grant execute on function public.consume_app_rate_limit(text, integer) to anon, authenticated;

create table if not exists public.public_form_dedup (
  dedup_key text primary key check (char_length(dedup_key) between 16 and 256),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.public_form_dedup enable row level security;
revoke all on public.public_form_dedup from anon, authenticated;

create or replace function public.claim_public_form_dedup(p_dedup_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer := 0;
begin
  delete from public.public_form_dedup
    where dedup_key = p_dedup_key and expires_at <= now();

  insert into public.public_form_dedup (dedup_key, expires_at)
  values (p_dedup_key, now() + interval '10 minutes')
  on conflict do nothing;
  get diagnostics v_rows = row_count;
  return v_rows = 1;
end;
$$;

revoke all on function public.claim_public_form_dedup(text) from public;
grant execute on function public.claim_public_form_dedup(text) to anon, authenticated;

-- Cleanup is safe to schedule daily; retaining expired pseudonymous buckets
-- is unnecessary. This function is service-role/ops only.
create or replace function public.cleanup_phase3_security_state()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rows integer;
begin
  delete from public.app_rate_limits where window_expires_at < now() - interval '1 day';
  delete from public.public_form_dedup where expires_at < now();
  get diagnostics v_rows = row_count;
  return v_rows;
end;
$$;

revoke all on function public.cleanup_phase3_security_state() from public, anon, authenticated;
