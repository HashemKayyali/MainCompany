import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { ADMIN_MUTATION_ENTITIES, tagsForAdminMutation } from '../mutation-map'

describe('ADM-INV mutation coverage', () => {
  it('maps every public catalog mutation entity to at least one canonical tag', () => {
    expect(ADMIN_MUTATION_ENTITIES).toEqual([
      'product',
      'category',
      'part',
      'build',
      'customer',
      'gallery',
    ])
    for (const entity of ADMIN_MUTATION_ENTITIES) {
      const tags = tagsForAdminMutation(entity, 'example')
      expect(tags.length).toBeGreaterThan(0)
      expect(new Set(tags).size).toBe(tags.length)
    }
  })

  it('preserves the approval advisory-lock implementation', () => {
    const sql = readFileSync(
      resolve(process.cwd(), '..', 'supabase/migrations/20260610_approve_rental_lock.sql'),
      'utf8'
    )
    expect(sql).toContain("pg_advisory_xact_lock(hashtext('rental_approval:'")
    expect(sql).toContain('FOR UPDATE')
  })
})
