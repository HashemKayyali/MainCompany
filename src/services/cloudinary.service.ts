import { supabase } from '../lib/supabase'
import {
  isCloudinaryIdentity,
  type CloudinaryStorageIdentity,
} from './cloudinary-identity'
import type {
  AssetDeletionResult,
  StorageIdentity,
} from './storage-identity'

const CLOUDINARY_EDGE_FUNCTION = 'cloudinary-assets'
const MAX_DELETE_BATCH = 100
const SIGNATURE_MAX_ATTEMPTS = 3
const SIGNATURE_RETRY_DELAYS_MS = [250, 700] as const
const CLOUDINARY_RATE_LIMIT_RETRY_MS = 900

interface UploadSignatureResponse {
  cloudName: string
  apiKey: string
  timestamp: number
  signature: string
  folder: string
}

interface CloudinaryUploadResponse {
  public_id?: string
  secure_url?: string
  error?: { message?: string }
}

interface DeleteAssetResult {
  publicId: string
  result: 'ok' | 'not found' | 'error'
  error?: string
}

interface DeleteAssetsResponse {
  results?: DeleteAssetResult[]
}

export async function uploadImageToCloudinary(file: File, folder: string): Promise<string> {
  const signature = await requestUploadSignature(folder)
  return postImageDirectlyToCloudinary(file, signature)
}

async function requestUploadSignature(folder: string): Promise<UploadSignatureResponse> {
  let lastError = 'Unknown authorization error'

  for (let attempt = 1; attempt <= SIGNATURE_MAX_ATTEMPTS; attempt += 1) {
    try {
      const { data, error } = await supabase.functions.invoke<UploadSignatureResponse>(
        CLOUDINARY_EDGE_FUNCTION,
        {
          body: { action: 'sign-upload', folder },
        },
      )

      if (error) {
        lastError = error.message || 'Edge Function returned an error'
      } else if (!isCompleteUploadSignature(data)) {
        lastError = 'Cloudinary upload authorization returned an incomplete response'
      } else {
        return data
      }
    } catch (error) {
      lastError = toErrorMessage(error)
    }

    if (attempt < SIGNATURE_MAX_ATTEMPTS) {
      const delay =
        SIGNATURE_RETRY_DELAYS_MS[attempt - 1] ??
        SIGNATURE_RETRY_DELAYS_MS[SIGNATURE_RETRY_DELAYS_MS.length - 1] ??
        700
      await sleep(delay)
    }
  }

  throw new Error(
    `Cloudinary upload authorization failed after ${SIGNATURE_MAX_ATTEMPTS} attempts: ${lastError}`,
  )
}

function isCompleteUploadSignature(
  data: UploadSignatureResponse | null | undefined,
): data is UploadSignatureResponse {
  return Boolean(
    data?.cloudName &&
      data.apiKey &&
      data.timestamp &&
      data.signature &&
      data.folder,
  )
}

async function postImageDirectlyToCloudinary(
  file: File,
  data: UploadSignatureResponse,
): Promise<string> {
  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(data.cloudName)}/image/upload`

  // A 429 means Cloudinary explicitly rejected the request before accepting the
  // upload, so one bounded retry is safe. Ambiguous network failures are NOT
  // retried here because the first request may actually have completed and an
  // automatic replay could create a duplicate asset.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const body = new FormData()
    body.set('file', file)
    body.set('api_key', data.apiKey)
    body.set('timestamp', String(data.timestamp))
    body.set('signature', data.signature)
    body.set('folder', data.folder)

    let response: Response
    try {
      response = await fetch(endpoint, { method: 'POST', body })
    } catch (error) {
      throw new Error(`Cloudinary upload network request failed: ${toErrorMessage(error)}`)
    }

    const payload = (await response.json().catch(() => ({}))) as CloudinaryUploadResponse

    if (response.ok && !payload.error?.message) {
      if (!payload.secure_url || !payload.public_id) {
        throw new Error('Cloudinary upload succeeded without a usable asset URL')
      }
      return payload.secure_url
    }

    if (response.status === 429 && attempt === 0) {
      await sleep(retryAfterMs(response.headers.get('retry-after')))
      continue
    }

    throw new Error(payload.error?.message || `Cloudinary upload failed with HTTP ${response.status}`)
  }

  throw new Error('Cloudinary upload failed after rate-limit retry')
}

function retryAfterMs(value: string | null): number {
  if (!value) return CLOUDINARY_RATE_LIMIT_RETRY_MS

  const seconds = Number(value)
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.max(CLOUDINARY_RATE_LIMIT_RETRY_MS, Math.round(seconds * 1000))
  }

  const at = Date.parse(value)
  if (Number.isFinite(at)) {
    return Math.max(CLOUDINARY_RATE_LIMIT_RETRY_MS, at - Date.now())
  }

  return CLOUDINARY_RATE_LIMIT_RETRY_MS
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function deleteCloudinaryIdentities(
  identities: StorageIdentity[],
): Promise<AssetDeletionResult> {
  const cloudinary = identities.filter(isCloudinaryIdentity)
  const result: AssetDeletionResult = {
    requested: cloudinary.length,
    deleted: [],
    alreadyMissing: [],
    failed: [],
  }

  if (cloudinary.length === 0) return result

  for (let offset = 0; offset < cloudinary.length; offset += MAX_DELETE_BATCH) {
    const batch = cloudinary.slice(offset, offset + MAX_DELETE_BATCH)
    const batchResult = await deleteBatch(batch)
    mergeInto(result, batchResult)
  }

  return result
}

async function deleteBatch(
  identities: CloudinaryStorageIdentity[],
): Promise<AssetDeletionResult> {
  const result: AssetDeletionResult = {
    requested: identities.length,
    deleted: [],
    alreadyMissing: [],
    failed: [],
  }

  try {
    const { data, error } = await supabase.functions.invoke<DeleteAssetsResponse>(
      CLOUDINARY_EDGE_FUNCTION,
      {
        body: {
          action: 'delete',
          assets: identities.map(identity => ({
            cloudName: identity.cloudName,
            publicId: identity.publicId,
            resourceType: identity.resourceType,
          })),
        },
      },
    )

    if (error) {
      return failEvery(result, identities, error.message)
    }

    const byPublicId = new Map((data?.results ?? []).map(item => [item.publicId, item]))

    for (const identity of identities) {
      const item = byPublicId.get(identity.publicId)
      if (!item) {
        result.failed.push(failure(identity, 'Cloudinary deletion response omitted this asset'))
      } else if (item.result === 'ok') {
        result.deleted.push(identity)
      } else if (item.result === 'not found') {
        result.alreadyMissing.push(identity)
      } else {
        result.failed.push(failure(identity, item.error || 'Cloudinary deletion failed'))
      }
    }

    return result
  } catch (error) {
    return failEvery(result, identities, toErrorMessage(error))
  }
}

function failure(identity: StorageIdentity, error: string) {
  return {
    canonical: identity.canonical,
    bucket: identity.bucket,
    path: identity.path,
    error,
  }
}

function failEvery(
  result: AssetDeletionResult,
  identities: StorageIdentity[],
  error: string,
): AssetDeletionResult {
  for (const identity of identities) result.failed.push(failure(identity, error))
  return result
}

function mergeInto(target: AssetDeletionResult, source: AssetDeletionResult) {
  target.deleted.push(...source.deleted)
  target.alreadyMissing.push(...source.alreadyMissing)
  target.failed.push(...source.failed)
}

function toErrorMessage(value: unknown): string {
  if (value instanceof Error) return value.message
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}
