-- DBMIG-010 / SEC-016 — Phase 6 privileged-operation assurance boundaries.
-- APPROVED 2026-07-13. STAGING FIRST. NEVER apply directly to production.
-- Frozen-Vite compatibility: existing RPC signatures are preserved and direct
-- table DELETE grants remain unchanged until the atomic Group E cutover.

begin;

alter table public.profiles
  add column if not exists is_active boolean not null default true;

alter table public.admin_logs
  add column if not exists actor_role text,
  add column if not exists result text,
  add column if not exists correlation_id uuid,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists public.admin_media_operations (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id),
  idempotency_key uuid not null,
  operation text not null check (operation in ('cloudinary.delete')),
  target_ids text[] not null check (cardinality(target_ids) between 1 and 25),
  status text not null check (status in ('pending', 'succeeded', 'failed', 'orphaned')),
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  unique (actor_id, idempotency_key)
);
alter table public.admin_media_operations enable row level security;

create table if not exists public.admin_rpc_idempotency (
  actor_id uuid not null references public.profiles(id),
  idempotency_key uuid not null,
  operation text not null,
  result jsonb,
  created_at timestamptz not null default clock_timestamp(),
  primary key (actor_id, idempotency_key)
);
alter table public.admin_rpc_idempotency enable row level security;

create table if not exists public.admin_upload_signing_windows (
  actor_id uuid not null references public.profiles(id),
  period text not null check (period in ('hour','day')),
  window_start timestamptz not null,
  request_count integer not null check (request_count >= 0),
  primary key (actor_id, period, window_start)
);
alter table public.admin_upload_signing_windows enable row level security;

create or replace function public.assert_admin_assurance(
  required_role text default 'admin',
  max_age_seconds integer default 900
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_actor uuid := auth.uid();
  v_claims jsonb := auth.jwt();
  v_role text;
  v_active boolean;
  v_deleted_at timestamptz;
  v_banned_until timestamptz;
  v_auth_raw text;
  v_auth_time numeric;
  v_now numeric := pg_catalog.extract(epoch from pg_catalog.statement_timestamp());
begin
  if v_actor is null then
    raise exception 'Admin assurance required' using errcode = '42501';
  end if;
  if required_role not in ('admin', 'superadmin') or max_age_seconds < 1 or max_age_seconds > 3600 then
    raise exception 'Invalid assurance policy' using errcode = '22023';
  end if;
  if pg_catalog.coalesce(v_claims ->> 'aal', '') <> 'aal2' then
    raise exception 'AAL2 required' using errcode = '42501';
  end if;

  v_auth_raw := v_claims ->> 'auth_time';
  if v_auth_raw is null or v_auth_raw !~ '^[0-9]+([.][0-9]+)?$' then
    raise exception 'Valid auth_time required' using errcode = '42501';
  end if;
  begin
    v_auth_time := v_auth_raw::numeric;
  exception when others then
    raise exception 'Valid auth_time required' using errcode = '42501';
  end;
  if v_auth_time > v_now or v_auth_time < v_now - max_age_seconds then
    raise exception 'Recent authentication required' using errcode = '42501';
  end if;

  select p.role, p.is_active, u.deleted_at, u.banned_until
    into v_role, v_active, v_deleted_at, v_banned_until
  from public.profiles as p
  join auth.users as u on u.id = p.id
  where p.id = v_actor;

  if not found or not pg_catalog.coalesce(v_active, false) or v_deleted_at is not null
     or (v_banned_until is not null and v_banned_until > pg_catalog.statement_timestamp()) then
    raise exception 'Active admin profile required' using errcode = '42501';
  end if;
  if required_role = 'superadmin' and v_role <> 'superadmin' then
    raise exception 'Superadmin assurance required' using errcode = '42501';
  end if;
  if required_role = 'admin' and v_role not in ('admin', 'superadmin') then
    raise exception 'Admin assurance required' using errcode = '42501';
  end if;
  return v_actor;
end;
$$;
alter function public.assert_admin_assurance(text, integer) owner to postgres;
revoke all on function public.assert_admin_assurance(text, integer) from public, anon, authenticated;

create or replace function public.write_admin_audit(
  p_actor uuid,
  p_actor_role text,
  p_operation text,
  p_target_type text,
  p_target_id text,
  p_result text,
  p_correlation_id uuid,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_id uuid;
  v_name text;
  v_email text;
begin
  select coalesce(p.name, 'Admin'), coalesce(p.email, '') into v_name, v_email
  from public.profiles as p where p.id = p_actor;
  if not found then raise exception 'Audit actor missing' using errcode = '23503'; end if;
  insert into public.admin_logs (
    admin_id, admin_name, admin_email, action, entity_type, entity_id,
    entity_name, details, actor_role, result, correlation_id, metadata
  ) values (
    p_actor, v_name, v_email, left(p_operation, 120), left(p_target_type, 80),
    left(p_target_id, 128), left(p_target_type || ':' || p_target_id, 180),
    '', p_actor_role, p_result, p_correlation_id, coalesce(p_metadata, '{}'::jsonb)
  ) returning id into v_id;
  return v_id;
end;
$$;
alter function public.write_admin_audit(uuid,text,text,text,text,text,uuid,jsonb) owner to postgres;
revoke all on function public.write_admin_audit(uuid,text,text,text,text,text,uuid,jsonb) from public, anon, authenticated;

create or replace function public.delete_admin_product(target_id uuid, confirmation text)
returns table(ok boolean, deleted_id uuid, deleted_slug text)
language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_role text; v_slug text; v_correlation uuid := gen_random_uuid();
begin
  v_actor := public.assert_admin_assurance('admin', 900);
  if confirmation <> 'DELETE' then raise exception 'Confirmation required' using errcode='22023'; end if;
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  delete from public.products p where p.id=target_id returning p.slug into v_slug;
  if not found then raise exception 'Product not found' using errcode='P0002'; end if;
  perform public.write_admin_audit(v_actor,v_role,'delete','product',target_id::text,'succeeded',v_correlation,jsonb_build_object('slug',v_slug));
  return query select true,target_id,v_slug;
end; $$;

create or replace function public.delete_admin_category(target_id uuid, confirmation text)
returns table(ok boolean, deleted_id uuid, deleted_slug text)
language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_role text; v_slug text; v_correlation uuid := gen_random_uuid();
begin
  v_actor := public.assert_admin_assurance('admin',900);
  if confirmation <> 'DELETE' then raise exception 'Confirmation required' using errcode='22023'; end if;
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  delete from public.categories c where c.id=target_id returning c.slug into v_slug;
  if not found then raise exception 'Category not found' using errcode='P0002'; end if;
  perform public.write_admin_audit(v_actor,v_role,'delete','category',target_id::text,'succeeded',v_correlation,jsonb_build_object('slug',v_slug));
  return query select true,target_id,v_slug;
end; $$;

create or replace function public.delete_admin_gallery_album(target_id uuid, confirmation text)
returns table(ok boolean, deleted_id uuid, deleted_slug text)
language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_role text; v_slug text; v_correlation uuid := gen_random_uuid();
begin
  v_actor := public.assert_admin_assurance('admin',900);
  if confirmation <> 'DELETE' then raise exception 'Confirmation required' using errcode='22023'; end if;
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  delete from public.gallery_albums g where g.id=target_id returning g.slug into v_slug;
  if not found then raise exception 'Gallery album not found' using errcode='P0002'; end if;
  perform public.write_admin_audit(v_actor,v_role,'delete','gallery',target_id::text,'succeeded',v_correlation,jsonb_build_object('slug',v_slug));
  return query select true,target_id,v_slug;
end; $$;

create or replace function public.delete_admin_custom_build(target_id uuid, confirmation text)
returns table(ok boolean, deleted_id uuid, deleted_title text)
language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_role text; v_title text; v_correlation uuid := gen_random_uuid();
begin
  v_actor := public.assert_admin_assurance('admin',900);
  if confirmation <> 'DELETE' then raise exception 'Confirmation required' using errcode='22023'; end if;
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  delete from public.custom_builds b where b.id=target_id returning b.title into v_title;
  if not found then raise exception 'Custom build not found' using errcode='P0002'; end if;
  perform public.write_admin_audit(v_actor,v_role,'delete','custom_build',target_id::text,'succeeded',v_correlation,jsonb_build_object('title_length',char_length(v_title)));
  return query select true,target_id,v_title;
end; $$;

create or replace function public.bulk_delete_admin_entities(entity_type text, target_ids uuid[], confirmation text)
returns table(ok boolean, deleted_count integer, unique_count integer)
language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_role text; v_ids uuid[]; v_deleted integer; v_correlation uuid := gen_random_uuid();
begin
  v_actor := public.assert_admin_assurance('admin',900);
  if confirmation <> 'DELETE' then raise exception 'Confirmation required' using errcode='22023'; end if;
  if target_ids is null or cardinality(target_ids)=0 or cardinality(target_ids)>25 then
    raise exception 'Bulk delete requires 1 to 25 IDs' using errcode='22023';
  end if;
  select array_agg(distinct x order by x) into v_ids from unnest(target_ids) x;
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  if entity_type='product' then delete from public.products p where p.id=any(v_ids);
  elsif entity_type='category' then delete from public.categories c where c.id=any(v_ids);
  elsif entity_type='gallery' then delete from public.gallery_albums g where g.id=any(v_ids);
  elsif entity_type='custom_build' then delete from public.custom_builds b where b.id=any(v_ids);
  else raise exception 'Unsupported bulk entity' using errcode='22023'; end if;
  get diagnostics v_deleted = row_count;
  if v_deleted <> cardinality(v_ids) then raise exception 'Bulk target set incomplete' using errcode='P0002'; end if;
  perform public.write_admin_audit(v_actor,v_role,'bulk_delete',entity_type,'batch','succeeded',v_correlation,jsonb_build_object('count',v_deleted));
  return query select true,v_deleted,cardinality(v_ids);
end; $$;

-- Preserve signatures used by frozen Vite; strengthen bodies in place.
create or replace function public.set_admin_role(target_id uuid, new_role text)
returns jsonb language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_actor_role text; v_target_role text; v_remaining integer; v_correlation uuid:=gen_random_uuid();
begin
  v_actor:=public.assert_admin_assurance('superadmin',900);
  if new_role not in ('admin','superadmin') then raise exception 'Invalid role' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtext('eventies:superadmin-invariant'));
  select p.role into strict v_target_role
  from public.profiles p
  join auth.users u on u.id=p.id
  where p.id=target_id and p.is_active and u.deleted_at is null
    and (u.banned_until is null or u.banned_until<=pg_catalog.statement_timestamp());
  if v_target_role='superadmin' and new_role<>'superadmin' then
    select count(*) into v_remaining
    from public.profiles p
    join auth.users u on u.id=p.id
    where p.role='superadmin' and p.is_active and p.id<>target_id
      and u.deleted_at is null
      and (u.banned_until is null or u.banned_until<=pg_catalog.statement_timestamp());
    if v_remaining=0 then raise exception 'Final active superadmin cannot be demoted' using errcode='23514'; end if;
  end if;
  select p.role into strict v_actor_role from public.profiles p where p.id=v_actor;
  update public.profiles p set role=new_role where p.id=target_id;
  perform public.write_admin_audit(v_actor,v_actor_role,'role_changed','profile',target_id::text,'succeeded',v_correlation,jsonb_build_object('from',v_target_role,'to',new_role,'self',target_id=v_actor));
  return jsonb_build_object('ok',true,'target_id',target_id,'role',new_role);
end; $$;

create or replace function public.remove_admin(target_id uuid)
returns jsonb language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_actor_role text; v_target_role text; v_remaining integer; v_correlation uuid:=gen_random_uuid();
begin
  v_actor:=public.assert_admin_assurance('superadmin',900);
  perform pg_advisory_xact_lock(hashtext('eventies:superadmin-invariant'));
  select p.role into strict v_target_role
  from public.profiles p
  join auth.users u on u.id=p.id
  where p.id=target_id and p.is_active and u.deleted_at is null
    and (u.banned_until is null or u.banned_until<=pg_catalog.statement_timestamp());
  if v_target_role='superadmin' then
    select count(*) into v_remaining
    from public.profiles p
    join auth.users u on u.id=p.id
    where p.role='superadmin' and p.is_active and p.id<>target_id
      and u.deleted_at is null
      and (u.banned_until is null or u.banned_until<=pg_catalog.statement_timestamp());
    if v_remaining=0 then raise exception 'Final active superadmin cannot be removed' using errcode='23514'; end if;
  end if;
  select p.role into strict v_actor_role from public.profiles p where p.id=v_actor;
  update public.profiles p set role='user' where p.id=target_id;
  perform public.write_admin_audit(v_actor,v_actor_role,'admin_removed','profile',target_id::text,'succeeded',v_correlation,jsonb_build_object('from',v_target_role,'self',target_id=v_actor));
  return jsonb_build_object('ok',true,'target_id',target_id);
end; $$;

create or replace function public.begin_admin_media_delete(p_idempotency_key uuid, p_public_ids text[])
returns table(operation_id uuid, should_execute boolean, prior_result jsonb)
language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_role text; v_id uuid; v_status text; v_result jsonb; v_ids text[]; v_existing_ids text[]; v_inserted integer; v_correlation uuid:=gen_random_uuid();
begin
  v_actor:=public.assert_admin_assurance('admin',900);
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  if p_idempotency_key is null or p_public_ids is null or cardinality(p_public_ids)=0 or cardinality(p_public_ids)>25 then
    raise exception 'Invalid media delete request' using errcode='22023'; end if;
  select array_agg(distinct x order by x) into v_ids from unnest(p_public_ids) x;
  -- Ownership is the configured Cloudinary tenant plus Eventies' reserved root/folders.
  -- The Edge boundary verifies the tenant; this predicate independently verifies
  -- the complete application-owned namespace before any external destroy call.
  if exists(select 1 from unnest(v_ids) x where x !~ '^eventies/(categories|customers|parts|gallery|custom-builds|products|general|uploads)/[A-Za-z0-9/_-]+$') then
    raise exception 'Invalid public ID' using errcode='22023'; end if;
  insert into public.admin_media_operations(actor_id,idempotency_key,operation,target_ids,status)
  values(v_actor,p_idempotency_key,'cloudinary.delete',v_ids,'pending')
  on conflict(actor_id,idempotency_key) do nothing returning id,status,result into v_id,v_status,v_result;
  get diagnostics v_inserted=row_count;
  if v_inserted=1 then
    perform public.write_admin_audit(v_actor,v_role,'cloudinary_delete_started','media',v_id::text,'pending',v_correlation,jsonb_build_object('count',cardinality(v_ids)));
    return query select v_id,true,v_result; return;
  end if;
  select o.id,o.status,o.result,o.target_ids into strict v_id,v_status,v_result,v_existing_ids
  from public.admin_media_operations o where o.actor_id=v_actor and o.idempotency_key=p_idempotency_key for update;
  if v_existing_ids is distinct from v_ids then raise exception 'Idempotency key target mismatch' using errcode='22023'; end if;
  if v_status in ('failed','orphaned') then
    update public.admin_media_operations o set status='pending',target_ids=v_ids,updated_at=clock_timestamp()
    where o.id=v_id;
    perform public.write_admin_audit(v_actor,v_role,'cloudinary_delete_retry','media',v_id::text,'pending',v_correlation,jsonb_build_object('count',cardinality(v_ids),'prior_status',v_status));
    return query select v_id,true,v_result; return;
  end if;
  return query select v_id,false,v_result || jsonb_build_object('status',v_status);
end; $$;

create or replace function public.consume_admin_upload_quota(
  p_hour_limit integer,
  p_day_limit integer
)
returns boolean language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_role text; v_hour integer; v_day integer; v_correlation uuid:=gen_random_uuid();
begin
  v_actor:=public.assert_admin_assurance('admin',900);
  if p_hour_limit not between 1 and 100 or p_day_limit not between 1 and 1000 then
    raise exception 'Invalid quota policy' using errcode='22023'; end if;
  insert into public.admin_upload_signing_windows(actor_id,period,window_start,request_count)
  values(v_actor,'hour',date_trunc('hour',statement_timestamp()),1)
  on conflict(actor_id,period,window_start) do update set request_count=public.admin_upload_signing_windows.request_count+1
  returning request_count into v_hour;
  insert into public.admin_upload_signing_windows(actor_id,period,window_start,request_count)
  values(v_actor,'day',date_trunc('day',statement_timestamp()),1)
  on conflict(actor_id,period,window_start) do update set request_count=public.admin_upload_signing_windows.request_count+1
  returning request_count into v_day;
  if v_hour>p_hour_limit or v_day>p_day_limit then
    select p.role into strict v_role from public.profiles p where p.id=v_actor;
    perform public.write_admin_audit(v_actor,v_role,'upload_quota','cloudinary','sign','denied',v_correlation,jsonb_build_object('hour_count',v_hour,'day_count',v_day));
    return false;
  end if;
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  perform public.write_admin_audit(v_actor,v_role,'upload_quota','cloudinary','sign','succeeded',v_correlation,jsonb_build_object('hour_count',v_hour,'day_count',v_day));
  return true;
end; $$;

create or replace function public.complete_admin_media_delete(p_operation_id uuid, p_status text, p_result jsonb)
returns boolean language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_role text; v_targets text[]; v_correlation uuid:=gen_random_uuid();
begin
  v_actor:=public.assert_admin_assurance('admin',900);
  if p_status not in ('succeeded','failed','orphaned') then raise exception 'Invalid media result' using errcode='22023'; end if;
  update public.admin_media_operations o set status=p_status,result=coalesce(p_result,'{}'::jsonb),updated_at=clock_timestamp()
  where o.id=p_operation_id and o.actor_id=v_actor returning target_ids into v_targets;
  if not found then raise exception 'Media operation not found' using errcode='P0002'; end if;
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  perform public.write_admin_audit(v_actor,v_role,'cloudinary_delete','media',p_operation_id::text,p_status,v_correlation,jsonb_build_object('count',cardinality(v_targets)));
  return true;
end; $$;

create or replace function public.send_custom_notification(
  p_title text,
  p_message text,
  p_clients boolean,
  p_admins boolean,
  p_superadmins boolean,
  p_target_url text default null,
  p_type text default 'custom'
)
returns jsonb language plpgsql security definer set search_path = pg_catalog
as $$
declare
  v_actor uuid;
  v_role text;
  v_broadcast_id uuid:=gen_random_uuid();
  v_count bigint;
  v_correlation uuid:=gen_random_uuid();
begin
  v_actor:=public.assert_admin_assurance('superadmin',900);
  if btrim(coalesce(p_title,''))='' or char_length(btrim(p_title))>180 then
    raise exception 'Invalid title' using errcode='22023'; end if;
  if btrim(coalesce(p_message,''))='' or char_length(btrim(p_message))>1000 then
    raise exception 'Invalid message' using errcode='22023'; end if;
  if not coalesce(p_clients,false) and not coalesce(p_admins,false) and not coalesce(p_superadmins,false) then
    raise exception 'Audience required' using errcode='22023'; end if;
  if not public.notification_target_is_safe(nullif(btrim(p_target_url),'')) then
    raise exception 'Unsafe target URL' using errcode='22023'; end if;

  insert into public.notifications(
    recipient_user_id,type,title,message,target_url,metadata,created_by,dedupe_key
  )
  select p.id,left(coalesce(nullif(btrim(p_type),''),'custom'),80),left(btrim(p_title),180),
    left(btrim(p_message),1000),nullif(btrim(p_target_url),''),
    jsonb_build_object('broadcast_id',v_broadcast_id,'audience',jsonb_build_object(
      'clients',p_clients,'admins',p_admins,'superadmins',p_superadmins)),
    v_actor,'broadcast:'||v_broadcast_id::text
  from public.profiles p
  where p.is_active and (
    (p_clients and coalesce(p.role,'user') not in ('admin','superadmin'))
    or (p_admins and p.role='admin')
    or (p_superadmins and p.role='superadmin')
  );
  get diagnostics v_count=row_count;
  select p.role into strict v_role from public.profiles p where p.id=v_actor;
  perform public.write_admin_audit(v_actor,v_role,'notification_broadcast','notification_broadcast',v_broadcast_id::text,'succeeded',v_correlation,jsonb_build_object('recipient_count',v_count));
  return jsonb_build_object('ok',true,'broadcast_id',v_broadcast_id,'recipient_count',v_count);
end; $$;

create or replace function public.send_custom_notification_idempotent(
  p_title text,
  p_message text,
  p_clients boolean,
  p_admins boolean,
  p_superadmins boolean,
  p_target_url text,
  p_type text,
  p_idempotency_key uuid
)
returns jsonb language plpgsql security definer set search_path = pg_catalog
as $$
declare v_actor uuid; v_inserted integer; v_result jsonb;
begin
  v_actor:=public.assert_admin_assurance('superadmin',900);
  if p_idempotency_key is null then raise exception 'Idempotency key required' using errcode='22023'; end if;
  insert into public.admin_rpc_idempotency(actor_id,idempotency_key,operation)
  values(v_actor,p_idempotency_key,'notification.broadcast') on conflict do nothing;
  get diagnostics v_inserted=row_count;
  if v_inserted=0 then
    select i.result into v_result from public.admin_rpc_idempotency i
    where i.actor_id=v_actor and i.idempotency_key=p_idempotency_key and i.operation='notification.broadcast';
    if v_result is null then raise exception 'Idempotency operation incomplete' using errcode='40001'; end if;
    return v_result || jsonb_build_object('replayed',true);
  end if;
  v_result:=public.send_custom_notification(p_title,p_message,p_clients,p_admins,p_superadmins,p_target_url,p_type);
  update public.admin_rpc_idempotency i set result=v_result
  where i.actor_id=v_actor and i.idempotency_key=p_idempotency_key;
  return v_result || jsonb_build_object('replayed',false);
end; $$;

-- API-callable functions. Helpers remain private. Direct DELETE is deliberately unchanged.
do $$ declare f regprocedure; begin
  for f in select unnest(array[
    'public.delete_admin_product(uuid,text)'::regprocedure,
    'public.delete_admin_category(uuid,text)'::regprocedure,
    'public.delete_admin_gallery_album(uuid,text)'::regprocedure,
    'public.delete_admin_custom_build(uuid,text)'::regprocedure,
    'public.bulk_delete_admin_entities(text,uuid[],text)'::regprocedure,
    'public.set_admin_role(uuid,text)'::regprocedure,
    'public.remove_admin(uuid)'::regprocedure,
    'public.begin_admin_media_delete(uuid,text[])'::regprocedure,
    'public.consume_admin_upload_quota(integer,integer)'::regprocedure,
    'public.complete_admin_media_delete(uuid,text,jsonb)'::regprocedure
    ,'public.send_custom_notification(text,text,boolean,boolean,boolean,text,text)'::regprocedure
    ,'public.send_custom_notification_idempotent(text,text,boolean,boolean,boolean,text,text,uuid)'::regprocedure
  ]) loop
    execute format('alter function %s owner to postgres',f);
    execute format('revoke all on function %s from public, anon',f);
    execute format('grant execute on function %s to authenticated, service_role',f);
  end loop;
end $$;

commit;
