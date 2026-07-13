import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), 'src/app/api/admin/destructive/route.ts'),
  'utf8'
)

describe('SEC-016 destructive Route Handler contract', () => {
  it('is rollout-disabled by default and independently reauthorizes', () => {
    expect(source).toContain("ADMIN_DESTRUCTIVE_ENABLED !== '1'")
    expect(source).toContain('getVerifiedUser')
    expect(source).toContain('getAuthoritativeRole')
    expect(source).toContain('authorizeAdminMutation')
  })

  it('performs no RPC or cache invalidation on denial', () => {
    const deniedReturn = source.indexOf("if (decision !== 'allow')")
    const firstRpc = source.indexOf("supabase.rpc('delete_admin_product'")
    const revalidation = source.indexOf('revalidateEntity(cacheEntity)')
    expect(deniedReturn).toBeGreaterThan(-1)
    expect(firstRpc).toBeGreaterThan(deniedReturn)
    expect(revalidation).toBeGreaterThan(firstRpc)
  })

  it('surfaces cache failure after a committed mutation without claiming rollback', () => {
    expect(source).toContain('revalidation = { ok: false, pending: true }')
    expect(source).toContain("track('revalidate.failed'")
  })
})
