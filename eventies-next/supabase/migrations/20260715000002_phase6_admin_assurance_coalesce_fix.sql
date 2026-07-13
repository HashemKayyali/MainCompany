-- Forward-only correction for staging environments that applied DBMIG-010 before
-- database lint exposed invalid schema qualification of SQL's COALESCE syntax.
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
  v_now numeric := extract(epoch from pg_catalog.statement_timestamp());
begin
  if v_actor is null then
    raise exception 'Admin assurance required' using errcode = '42501';
  end if;
  if required_role not in ('admin', 'superadmin') or max_age_seconds < 1 or max_age_seconds > 3600 then
    raise exception 'Invalid assurance policy' using errcode = '22023';
  end if;
  if coalesce(v_claims ->> 'aal', '') <> 'aal2' then
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

  if not found or not coalesce(v_active, false) or v_deleted_at is not null
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
