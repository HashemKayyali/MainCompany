import 'server-only'

export type StoredMedia = { id: string; publicId: string; secureUrl: string }

export type UploadWorkflowDependencies = {
  findByIdempotencyKey(key: string): Promise<StoredMedia | null>
  upload(): Promise<{ publicId: string; secureUrl: string }>
  record(input: {
    publicId: string
    secureUrl: string
    idempotencyKey: string
  }): Promise<StoredMedia>
  destroy(publicId: string): Promise<void>
  audit(input: { result: 'succeeded' | 'failed'; stage: string; orphaned: boolean }): Promise<void>
}

export type UploadWorkflowResult =
  | { ok: true; media: StoredMedia; deduplicated: boolean }
  | { ok: false; code: 'UPLOAD_FAILED' | 'RECORD_FAILED'; orphaned: boolean }

/** Upload first, record second, compensate on record failure; retries dedupe before uploading. */
export async function executeAdminUpload(
  idempotencyKey: string,
  dependencies: UploadWorkflowDependencies
): Promise<UploadWorkflowResult> {
  const existing = await dependencies.findByIdempotencyKey(idempotencyKey)
  if (existing) return { ok: true, media: existing, deduplicated: true }

  let uploaded: { publicId: string; secureUrl: string }
  try {
    uploaded = await dependencies.upload()
  } catch {
    await dependencies.audit({ result: 'failed', stage: 'upload', orphaned: false })
    return { ok: false, code: 'UPLOAD_FAILED', orphaned: false }
  }

  try {
    const media = await dependencies.record({ ...uploaded, idempotencyKey })
    await dependencies.audit({ result: 'succeeded', stage: 'record', orphaned: false })
    return { ok: true, media, deduplicated: false }
  } catch {
    let orphaned = false
    try {
      await dependencies.destroy(uploaded.publicId)
    } catch {
      orphaned = true
    }
    await dependencies.audit({ result: 'failed', stage: 'record', orphaned })
    return { ok: false, code: 'RECORD_FAILED', orphaned }
  }
}
