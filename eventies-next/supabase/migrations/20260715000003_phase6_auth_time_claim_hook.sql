-- SEC-018 staging correction: Supabase AAL2 tokens expose authentication
-- method timestamps through the signed `amr` array but do not natively emit
-- the `auth_time` claim required by public.assert_admin_assurance.
--
-- Derive auth_time only at token-issuance time from Auth-owned AMR evidence.
-- Never accept a client-supplied timestamp and never substitute token `iat`,
-- because refresh issuance time is not evidence of recent authentication.

begin;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
set search_path = pg_catalog
as $$
declare
  v_claims jsonb;
  v_auth_time numeric;
begin
  if pg_catalog.jsonb_typeof(event) <> 'object'
     or pg_catalog.jsonb_typeof(event -> 'claims') <> 'object' then
    raise exception 'Invalid custom access token hook event' using errcode = '22023';
  end if;

  v_claims := event -> 'claims';

  select max((entry ->> 'timestamp')::numeric)
    into v_auth_time
  from pg_catalog.jsonb_array_elements(
    case
      when pg_catalog.jsonb_typeof(v_claims -> 'amr') = 'array' then v_claims -> 'amr'
      else '[]'::jsonb
    end
  ) as entry
  where pg_catalog.jsonb_typeof(entry) = 'object'
    and entry ->> 'timestamp' ~ '^[0-9]+([.][0-9]+)?$'
    and entry ->> 'method' in (
      'password',
      'totp',
      'otp',
      'recovery',
      'invite',
      'magiclink',
      'oauth',
      'sso/saml',
      'email/signup'
    );

  -- Remove any incoming auth_time first. It is re-added only when signed AMR
  -- evidence contains a valid authentication timestamp.
  v_claims := v_claims - 'auth_time';
  if v_auth_time is not null then
    v_claims := pg_catalog.jsonb_set(
      v_claims,
      '{auth_time}',
      pg_catalog.to_jsonb(v_auth_time),
      true
    );
  end if;

  return pg_catalog.jsonb_build_object('claims', v_claims);
end;
$$;

alter function public.custom_access_token_hook(jsonb) owner to postgres;
grant usage on schema public to supabase_auth_admin;
revoke all on function public.custom_access_token_hook(jsonb) from public, anon, authenticated;
grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin;

commit;
