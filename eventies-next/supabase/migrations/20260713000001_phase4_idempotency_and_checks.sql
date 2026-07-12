-- REQ-003/004/005 · DBMIG-006 Wave C.
-- ADDITIVE / FROZEN-VITE COMPATIBLE: nullable keys; preserved JSONB RPC
-- signatures; legacy callers without idempotency_key keep existing behavior.
-- RLS impact: none (existing tables/policies); wrapper derives auth.uid().
-- Inverse: drop added constraints/indexes/columns, revoke/drop wrappers, rename
-- *_v1 functions back, then restore their authenticated grants.
-- EXECUTION: staging only until human DBMIG approval. Never apply to production here.

alter table public.rental_requests add column if not exists idempotency_key uuid;
alter table public.purchase_quote_requests add column if not exists idempotency_key uuid;

create unique index if not exists rental_requests_profile_idempotency_uidx
  on public.rental_requests (profile_id, idempotency_key)
  where idempotency_key is not null;
create unique index if not exists purchase_quotes_profile_idempotency_uidx
  on public.purchase_quote_requests (profile_id, idempotency_key)
  where idempotency_key is not null;

alter table public.rental_request_items
  add constraint rental_request_items_quantity_cap check (quantity <= 100) not valid;
alter table public.purchase_quote_items
  add constraint purchase_quote_items_quantity_cap check (quantity <= 100) not valid;

alter table public.rental_requests
  add constraint rental_customer_name_len check (char_length(customer_name) between 1 and 120) not valid,
  add constraint rental_email_len check (char_length(email) between 3 and 254) not valid,
  add constraint rental_phone_len check (char_length(phone) between 7 and 20) not valid,
  add constraint rental_company_len check (company_name is null or char_length(company_name) <= 160) not valid,
  add constraint rental_city_len check (char_length(city) between 1 and 160) not valid,
  add constraint rental_address_len check (char_length(address) between 1 and 400) not valid,
  add constraint rental_event_name_len check (event_name is null or char_length(event_name) <= 200) not valid,
  add constraint rental_notes_len check (notes is null or char_length(notes) <= 4000) not valid;

alter table public.purchase_quote_requests
  add constraint quote_customer_name_len check (char_length(customer_name) between 1 and 120) not valid,
  add constraint quote_email_len check (char_length(email) between 3 and 254) not valid,
  add constraint quote_phone_len check (char_length(phone) between 7 and 20) not valid,
  add constraint quote_company_len check (company_name is null or char_length(company_name) <= 160) not valid,
  add constraint quote_city_len check (char_length(city) between 1 and 160) not valid,
  add constraint quote_address_len check (char_length(address) between 1 and 400) not valid,
  add constraint quote_notes_len check (notes is null or char_length(notes) <= 4000) not valid;

-- Keep the exact public signatures while retaining the audited legacy bodies.
do $$
begin
  if to_regprocedure('public.create_rental_request_v1(jsonb)') is null then
    alter function public.create_rental_request(jsonb) rename to create_rental_request_v1;
  end if;
  if to_regprocedure('public.create_purchase_quote_request_v1(jsonb)') is null then
    alter function public.create_purchase_quote_request(jsonb) rename to create_purchase_quote_request_v1;
  end if;
end $$;

revoke execute on function public.create_rental_request_v1(jsonb) from public, anon, authenticated;
revoke execute on function public.create_purchase_quote_request_v1(jsonb) from public, anon, authenticated;
grant execute on function public.create_rental_request_v1(jsonb) to service_role;
grant execute on function public.create_purchase_quote_request_v1(jsonb) to service_role;

create or replace function public.create_rental_request(payload jsonb)
returns table(id uuid, request_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := auth.uid();
  v_key uuid := nullif(payload->>'idempotency_key', '')::uuid;
  v_id uuid;
  v_number text;
begin
  if v_profile_id is null then raise exception 'Authentication required'; end if;
  if v_key is null then return query select * from public.create_rental_request_v1(payload); return; end if;

  select r.id, r.request_number into v_id, v_number
  from public.rental_requests r
  where r.profile_id = v_profile_id and r.idempotency_key = v_key;
  if v_id is not null then return query select v_id, v_number; return; end if;

  begin
    select x.id, x.request_number into v_id, v_number
    from public.create_rental_request_v1(payload) x;
    update public.rental_requests set idempotency_key = v_key where rental_requests.id = v_id;
  exception when unique_violation then
    select r.id, r.request_number into v_id, v_number
    from public.rental_requests r
    where r.profile_id = v_profile_id and r.idempotency_key = v_key;
  end;
  return query select v_id, v_number;
end;
$$;

create or replace function public.create_purchase_quote_request(payload jsonb)
returns table(id uuid, request_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := auth.uid();
  v_key uuid := nullif(payload->>'idempotency_key', '')::uuid;
  v_id uuid;
  v_number text;
begin
  if v_profile_id is null then raise exception 'Authentication required'; end if;
  if v_key is null then return query select * from public.create_purchase_quote_request_v1(payload); return; end if;

  select q.id, q.request_number into v_id, v_number
  from public.purchase_quote_requests q
  where q.profile_id = v_profile_id and q.idempotency_key = v_key;
  if v_id is not null then return query select v_id, v_number; return; end if;

  begin
    select x.id, x.request_number into v_id, v_number
    from public.create_purchase_quote_request_v1(payload) x;
    update public.purchase_quote_requests set idempotency_key = v_key where purchase_quote_requests.id = v_id;
  exception when unique_violation then
    select q.id, q.request_number into v_id, v_number
    from public.purchase_quote_requests q
    where q.profile_id = v_profile_id and q.idempotency_key = v_key;
  end;
  return query select v_id, v_number;
end;
$$;

revoke execute on function public.create_rental_request(jsonb) from public, anon;
revoke execute on function public.create_purchase_quote_request(jsonb) from public, anon;
grant execute on function public.create_rental_request(jsonb) to authenticated, service_role;
grant execute on function public.create_purchase_quote_request(jsonb) to authenticated, service_role;
