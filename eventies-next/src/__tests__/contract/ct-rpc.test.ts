import { describe, expect, it } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'
import { RPC } from '@/shared/contracts/rpc'

/**
 * FOUND-028 — CT-RPC harness: every contract RPC must EXIST in the target
 * database (existence probe: calling with empty args must never yield
 * PGRST202 "function not found"; argument/authorization errors are fine and
 * expected). Shape tests per RPC extend this file as their phases land.
 * Env-gated like CT-RLS.
 */

const url = process.env.CT_SUPABASE_URL
const anonKey = process.env.CT_SUPABASE_ANON_KEY
const enabled = Boolean(url && anonKey)

describe.skipIf(!enabled)('CT-RPC: contract functions exist', () => {
  const anon = () => createClient<Database>(url!, anonKey!, { auth: { persistSession: false } })

  for (const [alias, fn] of Object.entries(RPC)) {
    it(`rpc ${alias} (${fn}) exists`, async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await anon().rpc(fn as any, {} as any)
      // PGRST202 = function (with matching args) not found in schema cache.
      // Missing-arg/permission errors prove existence; absence fails.
      expect(error?.code, `${fn}: ${error?.message}`).not.toBe('PGRST202')
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
