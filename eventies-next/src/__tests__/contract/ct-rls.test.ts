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

function authenticated(jwt: string) {
  return createClient<Database>(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  })
}

describe.skipIf(!enabled || !process.env.CT_USER_JWT)('CT-RLS: authenticated persona', () => {
  const jwt = process.env.CT_USER_JWT!

  it('reads the own profile and no other profiles', async () => {
    const client = authenticated(jwt)
    const identity = await client.auth.getUser(jwt)
    expect(identity.error).toBeNull()
    expect(identity.data.user?.id).toBeTruthy()

    const userId = identity.data.user!.id
    const own = await client.from('profiles').select('id,role').eq('id', userId).single()
    expect(own.error).toBeNull()
    expect(own.data?.id).toBe(userId)

    const others = await client.from('profiles').select('id').neq('id', userId).limit(5)
    expect(others.error).toBeNull()
    expect(others.data ?? []).toHaveLength(0)
  })

  it('cannot promote the own profile through a direct table update', async () => {
    const client = authenticated(jwt)
    const identity = await client.auth.getUser(jwt)
    const userId = identity.data.user!.id
    const promoted = await client
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select('role')

    expect(promoted.error).not.toBeNull()
  })
})

describe.skipIf(!enabled || !process.env.CT_ADMIN_JWT)('CT-RLS: admin persona', () => {
  const jwt = process.env.CT_ADMIN_JWT!

  it('can read the admin-authorized profile surface', async () => {
    const client = authenticated(jwt)
    const identity = await client.auth.getUser(jwt)
    expect(identity.error).toBeNull()
    const userId = identity.data.user!.id

    const own = await client.from('profiles').select('id,role,is_active').eq('id', userId).single()
    expect(own.error).toBeNull()
    expect(['admin', 'superadmin']).toContain(own.data?.role)
    expect(own.data?.is_active).toBe(true)

    const profiles = await client.from('profiles').select('id,role').limit(5)
    expect(profiles.error).toBeNull()
  })
})

if (!enabled) {
  describe('CT-RLS harness', () => {
    it('SKIPPED: CT_SUPABASE_URL / CT_SUPABASE_ANON_KEY not configured (DBMIG-002 blocked)', () => {
      expect(enabled).toBe(false)
    })
  })
}
