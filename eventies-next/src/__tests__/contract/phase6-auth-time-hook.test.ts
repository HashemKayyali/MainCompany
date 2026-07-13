import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  join(process.cwd(), 'supabase', 'migrations', '20260715000003_phase6_auth_time_claim_hook.sql'),
  'utf8'
).toLowerCase()

describe('SEC-018 auth_time issuance hook', () => {
  it('derives auth_time from signed AMR timestamps without trusting iat or an incoming claim', () => {
    expect(sql).toContain('create or replace function public.custom_access_token_hook(event jsonb)')
    expect(sql).toContain("entry ->> 'timestamp'")
    expect(sql).toContain("entry ->> 'method'")
    expect(sql).toContain("v_claims := v_claims - 'auth_time'")
    expect(sql).not.toContain("v_claims ->> 'iat'")
    expect(sql).not.toContain("event ->> 'auth_time'")
  })

  it('is private to Supabase Auth and uses a fixed catalog search path', () => {
    expect(sql).toContain('set search_path = pg_catalog')
    expect(sql).toContain('alter function public.custom_access_token_hook(jsonb) owner to postgres')
    expect(sql).toContain(
      'grant execute on function public.custom_access_token_hook(jsonb) to supabase_auth_admin'
    )
    expect(sql).toContain(
      'revoke all on function public.custom_access_token_hook(jsonb) from public, anon, authenticated'
    )
  })

  it('does not emit auth_time when AMR evidence is absent or malformed', () => {
    expect(sql).toContain("else '[]'::jsonb")
    expect(sql).toContain("entry ->> 'timestamp' ~ '^[0-9]+([.][0-9]+)?$'")
    expect(sql).toContain('if v_auth_time is not null then')
  })
})
