-- DBMIG-009 / CHAT-009: durable per-user chat-message rate limit.
-- HUMAN GATE: apply to staging only after review. No service-role/browser path.

create table if not exists public.chat_message_rate_counters (
  sender_id uuid not null references public.profiles(id) on delete cascade,
  window_started_at timestamptz not null,
  message_count integer not null default 0 check (message_count between 0 and 30),
  primary key (sender_id, window_started_at)
);

alter table public.chat_message_rate_counters enable row level security;
revoke all on table public.chat_message_rate_counters from public, anon, authenticated;

create or replace function public.chat_enforce_message_rate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sender uuid := auth.uid();
  v_window timestamptz := date_trunc('minute', statement_timestamp());
  v_count integer;
begin
  if v_sender is null or new.sender_id <> v_sender then
    raise exception 'chat_auth_required' using errcode = '42501';
  end if;

  insert into public.chat_message_rate_counters(sender_id, window_started_at, message_count)
  values (v_sender, v_window, 1)
  on conflict (sender_id, window_started_at) do update
    set message_count = public.chat_message_rate_counters.message_count + 1
    where public.chat_message_rate_counters.message_count < 30
  returning message_count into v_count;

  if v_count is null then
    raise exception 'chat_rate_limited' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists chat_message_rate_before_insert on public.chat_messages;
create trigger chat_message_rate_before_insert
  before insert on public.chat_messages
  for each row execute function public.chat_enforce_message_rate();

revoke execute on function public.chat_enforce_message_rate() from public, anon, authenticated;

