import { describe, expect, it, vi } from 'vitest'
import { executeAdminUpload, type UploadWorkflowDependencies } from '../upload-workflow'

function dependencies(
  overrides: Partial<UploadWorkflowDependencies> = {}
): UploadWorkflowDependencies {
  return {
    findByIdempotencyKey: vi.fn().mockResolvedValue(null),
    upload: vi
      .fn()
      .mockResolvedValue({ publicId: 'eventies/products/stage', secureUrl: 'https://cdn/stage' }),
    record: vi.fn().mockResolvedValue({
      id: 'media-1',
      publicId: 'eventies/products/stage',
      secureUrl: 'https://cdn/stage',
    }),
    destroy: vi.fn().mockResolvedValue(undefined),
    audit: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  }
}

describe('UPL-PF upload workflow', () => {
  it('returns an existing record without a duplicate upload', async () => {
    const deps = dependencies({
      findByIdempotencyKey: vi
        .fn()
        .mockResolvedValue({ id: 'existing', publicId: 'p', secureUrl: 'u' }),
    })
    const result = await executeAdminUpload('key', deps)
    expect(result).toMatchObject({ ok: true, deduplicated: true })
    expect(deps.upload).not.toHaveBeenCalled()
  })

  it('compensates a failed DB record so no Cloudinary orphan remains', async () => {
    const deps = dependencies({ record: vi.fn().mockRejectedValue(new Error('db unavailable')) })
    const result = await executeAdminUpload('key', deps)
    expect(result).toEqual({ ok: false, code: 'RECORD_FAILED', orphaned: false })
    expect(deps.destroy).toHaveBeenCalledWith('eventies/products/stage')
  })

  it('reports cleanup failure honestly for operational recovery', async () => {
    const deps = dependencies({
      record: vi.fn().mockRejectedValue(new Error('db unavailable')),
      destroy: vi.fn().mockRejectedValue(new Error('cloud unavailable')),
    })
    const result = await executeAdminUpload('key', deps)
    expect(result).toEqual({ ok: false, code: 'RECORD_FAILED', orphaned: true })
    expect(deps.audit).toHaveBeenCalledWith({ result: 'failed', stage: 'record', orphaned: true })
  })
})
