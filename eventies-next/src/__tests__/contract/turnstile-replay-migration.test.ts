import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  resolve(process.cwd(), 'supabase/migrations/20260715000005_phase3_turnstile_replay_claims.sql'),
  'utf8'
).toLowerCase()

describe('FORM-TS durable Turnstile replay claims', () => {
  it('stores only a fixed-length token hash and expires claims', () => {
    expect(sql).toContain('create table if not exists public.turnstile_token_claims')
    expect(sql).toContain("token_hash ~ '^[0-9a-f]{64}$'")
    expect(sql).toContain('expires_at timestamptz not null')
    expect(sql).not.toContain('turnstile_token text')
  })

  it('claims atomically and is callable only by service_role', () => {
    expect(sql).toContain('on conflict do nothing')
    expect(sql).toContain('get diagnostics v_inserted = row_count')
    expect(sql).toContain(
      'revoke all on function public.claim_turnstile_token(text, integer)\n  from public, anon, authenticated'
    )
    expect(sql).toContain(
      'grant execute on function public.claim_turnstile_token(text, integer) to service_role'
    )
  })
})
