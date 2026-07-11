import { describe, expect, it } from 'vitest'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

/**
 * FOUND-027 — CT-RLS harness: anon/user/admin probe matrix per table.
 * Runs against the BRANCH/STAGING database (DBMIG-002). Env-gated: without
 * CT_SUPABASE_URL / CT_SUPABASE_ANON_KEY the suite skips loudly — it must
 * never silently pass in CI (the CI job asserts it RAN when secrets exist).
 * User/admin personas activate when CT_USER_JWT / CT_ADMIN_JWT are provided.
 */

const url = process.env.CT_SUPABASE_URL
const anonKey = process.env.CT_SUPABASE_ANON_KEY
const enabled = Boolean(url && anonKey)

const PUBLIC_READABLE = [
  'products',
  'categories',
  'parts',
  'custom_builds',
  'customers',
  'gallery_albums',
] as const
const PRIVATE_TABLES = [
  'profiles',
  'rental_requests',
  'purchase_quote_requests',
  'chat_messages',
  'notifications',
] as const

describe.skipIf(!enabled)('CT-RLS: anon persona', () => {
  const anon = () => createClient<Database>(url!, anonKey!, { auth: { persistSession: false } })

  for (const table of PUBLIC_READABLE) {
    it(`anon can read public table: ${table}`, async () => {
      const { error } = await anon().from(table).select('*').limit(1)
      expect(error).toBeNull()
    })
  }

  for (const table of PRIVATE_TABLES) {
    it(`anon gets NO rows from private table: ${table}`, async () => {
      const { data, error } = await anon().from(table).select('*').limit(1)
      // RLS denies via empty result or explicit error — either is a pass;
      // rows coming back is the failure.
      if (error) return
      expect(data ?? []).toHaveLength(0)
    })
  }

  it('anon cannot insert into products', async () => {
    const { error } = await anon()
      .from('products')
      .insert({ title: 'ct-rls-probe', slug: `ct-rls-${Date.now()}`, description: '', price: 0 })
    expect(error).not.toBeNull()
  })
})

describe.skipIf(!enabled || !process.env.CT_USER_JWT)('CT-RLS: authenticated persona', () => {
  it.todo('user reads only own rental_requests (needs CT_USER_JWT fixture)')
})

describe.skipIf(!enabled || !process.env.CT_ADMIN_JWT)('CT-RLS: admin persona', () => {
  it.todo('admin write surface per policy matrix (needs CT_ADMIN_JWT fixture)')
})

if (!enabled) {
  describe('CT-RLS harness', () => {
    it('SKIPPED: CT_SUPABASE_URL / CT_SUPABASE_ANON_KEY not configured (DBMIG-002 blocked)', () => {
      expect(enabled).toBe(false)
    })
  })
}
