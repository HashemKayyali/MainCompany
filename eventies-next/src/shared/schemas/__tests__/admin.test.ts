import { describe, expect, it } from 'vitest'
import {
  adminCatalogRecordSchema,
  adminChatMessageSchema,
  adminDestructiveRequestSchema,
  adminCatalogMutationSchema,
  adminMediaSchema,
  adminNotificationSchema,
  destructiveConfirmationSchema,
  requestStatusMutationSchema,
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

describe('Phase 6 privileged payloads', () => {
  const key = '11111111-1111-4111-8111-111111111111'

  it('normalizes safe slugs and rejects traversal', () => {
    expect(
      adminCatalogRecordSchema.parse({
        entity: 'product',
        name: 'Stage',
        slug: 'Main-Stage',
        idempotencyKey: key,
      }).slug
    ).toBe('main-stage')
    expect(() =>
      adminCatalogRecordSchema.parse({
        entity: 'product',
        name: 'Stage',
        slug: '../stage',
        idempotencyKey: key,
      })
    ).toThrow()
  })

  it('requires idempotency on request, chat, and notification mutations', () => {
    expect(
      requestStatusMutationSchema.safeParse({
        requestType: 'rental',
        requestId: key,
        status: 'approved',
      }).success
    ).toBe(false)
    expect(adminChatMessageSchema.safeParse({ conversationId: key, body: 'Hello' }).success).toBe(
      false
    )
    expect(
      adminNotificationSchema.safeParse({
        title: 'Update',
        message: 'Hello',
        targetUrl: '//evil.example',
        audience: { clients: true, admins: false, superadmins: false },
        idempotencyKey: key,
      }).success
    ).toBe(false)
  })

  it('enforces media type, size, filename, public-ID, and folder isolation', () => {
    const valid = {
      operation: 'upload',
      folder: 'eventies/products',
      fileName: 'stage.webp',
      publicId: 'eventies/products/stage-1',
      mimeType: 'image/webp',
      size: 1024,
      idempotencyKey: key,
    }
    expect(adminMediaSchema.safeParse(valid).success).toBe(true)
    expect(adminMediaSchema.safeParse({ ...valid, fileName: '../secret.jpg' }).success).toBe(false)
    expect(adminMediaSchema.safeParse({ ...valid, mimeType: 'image/svg+xml' }).success).toBe(false)
    expect(adminMediaSchema.safeParse({ ...valid, size: 11 * 1024 * 1024 }).success).toBe(false)
    expect(adminMediaSchema.safeParse({ ...valid, publicId: 'other/stage' }).success).toBe(false)
  })

  it('caps destructive batches at 25 while allowing duplicate collapse in the RPC', () => {
    const ids = Array.from(
      { length: 25 },
      (_, index) => `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`
    )
    expect(
      adminDestructiveRequestSchema.safeParse({
        operation: 'bulk',
        entity: 'product',
        targetIds: [ids[0], ids[0]],
        confirmation: 'DELETE',
      }).success
    ).toBe(true)
    expect(
      adminDestructiveRequestSchema.safeParse({
        operation: 'bulk',
        entity: 'product',
        targetIds: [...ids, ids[0]],
        confirmation: 'DELETE',
      }).success
    ).toBe(false)
  })
})
