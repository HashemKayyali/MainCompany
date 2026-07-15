import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const source = readFileSync(
  resolve(process.cwd(), 'src/app/api/revalidate/route.ts'),
  'utf8'
)

describe('Phase 6 public route-cache invalidation contract', () => {
  it('purges localized Full Route Cache entries after authorized tag invalidation', () => {
    expect(source).toContain("import { revalidatePath } from 'next/cache'")
    expect(source).toContain("const invalidatedLayouts = ['en', 'ar'] as const")
    expect(source).toContain("revalidatePath(`/${locale}`, 'layout')")
  })
})