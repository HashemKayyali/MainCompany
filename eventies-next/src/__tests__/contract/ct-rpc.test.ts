import { beforeAll, describe, expect, it } from 'vitest'
import { RPC } from '@/shared/contracts/rpc'

/**
 * FOUND-028 — CT-RPC harness: every contract RPC must EXIST in the target
 * database. The probe reads PostgREST's OpenAPI document instead of invoking
 * each function: an empty-argument call returns PGRST202 for parameterized
 * functions even when the function exists, and privileged RPCs must not be
 * invoked merely to prove discovery. Shape tests per RPC extend this file as
 * their phases land.
 * Env-gated like CT-RLS.
 */

const url = process.env.CT_SUPABASE_URL
const anonKey = process.env.CT_SUPABASE_ANON_KEY
const schemaKey = process.env.CT_ADMIN_KEY ?? anonKey
const enabled = Boolean(url && anonKey)

describe.skipIf(!enabled)('CT-RPC: contract functions exist', () => {
  let paths: Record<string, unknown>

  beforeAll(async () => {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        apikey: schemaKey!,
        Authorization: `Bearer ${schemaKey}`,
        Accept: 'application/openapi+json',
      },
    })
    expect(response.ok, `PostgREST OpenAPI request failed with ${response.status}`).toBe(true)
    const schema = (await response.json()) as { paths?: Record<string, unknown> }
    paths = schema.paths ?? {}
  })

  for (const [alias, fn] of Object.entries(RPC)) {
    it(`rpc ${alias} (${fn}) exists`, async () => {
      expect(paths, `${fn} is absent from the PostgREST schema cache`).toHaveProperty(`/rpc/${fn}`)
    })
  }
})

if (!enabled) {
  describe('CT-RPC harness', () => {
    it('SKIPPED: CT_SUPABASE_URL / CT_SUPABASE_ANON_KEY not configured (DBMIG-002 blocked)', () => {
      expect(enabled).toBe(false)
    })
  })
}
