-- DBMIG-010 staging bootstrap escape hatch for the first superadmin only.
--
-- Safety properties:
--   * service_role-only RPC
--   * exact target UUID
--   * advisory-lock serialized
--   * works only while zero active/non-banned superadmins exist
--   * audits the bootstrap in the same transaction
--   * bootstrap function is removed by retire_first_superadmin_bootstrap()
--
-- Apply to Staging first. Invoke through scripts/bootstrap-staging-superadmin.mjs,
-- which retires the bootstrap immediately after the first successful seed.

begin;

create or replace function public.lock_profile_role()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_bootstrap_target text := pg_catalog.current_setting(
    'eventies.bootstrap_first_superadmin_target',
    true
  );
  v_request_role text := coalesce(auth.jwt() ->> 'role', '');
begin
  if new.role is distinct from old.role then
    if v_request_role = 'service_role'
       and v_bootstrap_target = new.id::text
       and old.role = 'user'
       and new.role = 'superadmin'
       and not exists (
         select 1
         from public.profiles p
         join auth.users u on u.id = p.id
         where p.role = 'superadmin'
           and p.is_active
           and u.deleted_at is null
           and (u.banned_until is null or u.banned_until <= pg_catalog.statement_timestamp())
       ) then
      return new;
    end if;

    if not public.is_superadmin() then
      raise exception 'Only superadmins can change roles' using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

alter function public.lock_profile_role() owner to postgres;
revoke all on function public.lock_profile_role() from public, anon, authenticated;

create or replace function public.bootstrap_first_superadmin(p_target_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_request_role text := coalesce(auth.jwt() ->> 'role', '');
  v_target_email text;
  v_correlation_id uuid := gen_random_uuid();
begin
  if v_request_role <> 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtext('eventies:first-superadmin-bootstrap')
  );

  if exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role = 'superadmin'
      and p.is_active
      and u.deleted_at is null
      and (u.banned_until is null or u.banned_until <= pg_catalog.statement_timestamp())
  ) then
    raise exception 'An active superadmin already exists' using errcode = '23514';
  end if;

  select u.email
  into strict v_target_email
  from auth.users u
  join public.profiles p on p.id = u.id
  where u.id = p_target_id
    and u.deleted_at is null
    and (u.banned_until is null or u.banned_until <= pg_catalog.statement_timestamp())
    and p.role = 'user';

  perform pg_catalog.set_config(
    'eventies.bootstrap_first_superadmin_target',
    p_target_id::text,
    true
  );

  update public.profiles
  set role = 'superadmin', is_active = true
  where id = p_target_id;

  if not found then
    raise exception 'Bootstrap target profile was not updated' using errcode = 'P0002';
  end if;

  perform public.write_admin_audit(
    p_target_id,
    'service_role_bootstrap',
    'role_changed',
    'profile',
    p_target_id::text,
    'succeeded',
    v_correlation_id,
    pg_catalog.jsonb_build_object(
      'bootstrap', true,
      'email_hash', pg_catalog.md5(pg_catalog.lower(coalesce(v_target_email, '')))
    )
  );

  return pg_catalog.jsonb_build_object(
    'ok', true,
    'target_id', p_target_id,
    'correlation_id', v_correlation_id
  );
end;
$$;

alter function public.bootstrap_first_superadmin(uuid) owner to postgres;
revoke all on function public.bootstrap_first_superadmin(uuid)
  from public, anon, authenticated;
grant execute on function public.bootstrap_first_superadmin(uuid) to service_role;

create or replace function public.retire_first_superadmin_bootstrap()
returns boolean
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_request_role text := coalesce(auth.jwt() ->> 'role', '');
begin
  if v_request_role <> 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    where p.role = 'superadmin'
      and p.is_active
      and u.deleted_at is null
      and (u.banned_until is null or u.banned_until <= pg_catalog.statement_timestamp())
  ) then
    raise exception 'Cannot retire bootstrap before a superadmin exists' using errcode = '23514';
  end if;

  execute 'drop function if exists public.bootstrap_first_superadmin(uuid)';

  execute $ddl$
    create or replace function public.lock_profile_role()
    returns trigger
    language plpgsql
    security definer
    set search_path = pg_catalog
    as $function$
    begin
      if new.role is distinct from old.role and not public.is_superadmin() then
        raise exception 'Only superadmins can change roles' using errcode = '42501';
      end if;
      return new;
    end;
    $function$
  $ddl$;

  execute 'alter function public.lock_profile_role() owner to postgres';
  execute 'revoke all on function public.lock_profile_role() from public, anon, authenticated';

  return true;
end;
$$;

alter function public.retire_first_superadmin_bootstrap() owner to postgres;
revoke all on function public.retire_first_superadmin_bootstrap()
  from public, anon, authenticated;
grant execute on function public.retire_first_superadmin_bootstrap() to service_role;

commit;
