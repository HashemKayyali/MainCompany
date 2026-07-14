import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const sql = readFileSync(
  resolve(
    process.cwd(),
    'supabase/migrations/20260715000006_phase6_first_superadmin_bootstrap.sql'
  ),
  'utf8'
).toLowerCase()

describe('Phase 6 first-superadmin bootstrap boundary', () => {
  it('is service-role-only, zero-superadmin-only, serialized, and audited', () => {
    expect(sql).toContain('bootstrap_first_superadmin')
    expect(sql).toContain("v_request_role <> 'service_role'")
    expect(sql).toContain('pg_advisory_xact_lock')
    expect(sql).toContain('eventies:first-superadmin-bootstrap')
    expect(sql).toContain("p.role = 'superadmin'")
    expect(sql).toContain('an active superadmin already exists')
    expect(sql).toContain('write_admin_audit')
    expect(sql).toContain("'bootstrap', true")
    expect(sql).toContain(
      'revoke all on function public.bootstrap_first_superadmin(uuid)\n  from public, anon, authenticated'
    )
    expect(sql).toContain(
      'grant execute on function public.bootstrap_first_superadmin(uuid) to service_role'
    )
  })

  it('ships a retirement RPC that removes the elevation function and restores the role lock', () => {
    expect(sql).toContain('retire_first_superadmin_bootstrap')
    expect(sql).toContain('drop function if exists public.bootstrap_first_superadmin(uuid)')
    expect(sql).toContain('only superadmins can change roles')
    expect(sql).toContain(
      'grant execute on function public.retire_first_superadmin_bootstrap() to service_role'
    )
  })

  it('does not revoke direct DELETE privileges before Group E', () => {
    expect(sql).not.toMatch(/revoke\s+delete\s+on/i)
  })
})
