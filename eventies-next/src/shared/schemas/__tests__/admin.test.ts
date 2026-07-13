import { describe, expect, it } from 'vitest'
import {
  adminCatalogMutationSchema,
  destructiveConfirmationSchema,
  uploadAuthorizationSchema,
  uploadPolicy,
} from '../admin'

describe('Phase 6 admin schemas', () => {
  it('accepts bilingual bounded catalog data', () => {
    expect(
      adminCatalogMutationSchema.parse({
        entity: 'product',
        slug: 'stage',
        name: 'Stage',
        nameAr: 'منصة',
      }).nameAr
    ).toBe('منصة')
    expect(() =>
      adminCatalogMutationSchema.parse({
        entity: 'product',
        name: '',
        description: 'x'.repeat(10_001),
      })
    ).toThrow()
  })

  it('rejects unknown privileged operations and unapproved upload folders', () => {
    expect(() =>
      destructiveConfirmationSchema.parse({
        operation: 'sql',
        targetId: '1',
        confirmation: 'DELETE',
      })
    ).toThrow()
    expect(() =>
      uploadAuthorizationSchema.parse({
        action: 'sign-upload',
        folder: 'eventies/evil',
        idempotencyKey: crypto.randomUUID(),
      })
    ).toThrow()
  })

  it('centralizes signed preset constraints and provisional quotas', () => {
    expect(uploadPolicy.allowedFormats).not.toContain('svg')
    expect(uploadPolicy.maxFileSize).toBe(10 * 1024 * 1024)
    expect(uploadPolicy.hourlyQuota).toBe(30)
    expect(uploadPolicy.dailyQuota).toBe(300)
  })
})
