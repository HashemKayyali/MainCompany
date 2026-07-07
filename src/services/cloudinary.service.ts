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
  const { data, error } = await supabase.functions.invoke<UploadSignatureResponse>(
    CLOUDINARY_EDGE_FUNCTION,
    {
      body: { action: 'sign-upload', folder },
    },
  )

  if (error) {
    throw new Error(`Cloudinary upload authorization failed: ${error.message}`)
  }

  if (!data?.cloudName || !data.apiKey || !data.timestamp || !data.signature || !data.folder) {
    throw new Error('Cloudinary upload authorization returned an incomplete response')
  }

  const body = new FormData()
  body.set('file', file)
  body.set('api_key', data.apiKey)
  body.set('timestamp', String(data.timestamp))
  body.set('signature', data.signature)
  body.set('folder', data.folder)

  const endpoint = `https://api.cloudinary.com/v1_1/${encodeURIComponent(data.cloudName)}/image/upload`
  const response = await fetch(endpoint, { method: 'POST', body })
  const payload = (await response.json().catch(() => ({}))) as CloudinaryUploadResponse

  if (!response.ok || payload.error?.message) {
    throw new Error(payload.error?.message || `Cloudinary upload failed with HTTP ${response.status}`)
  }

  if (!payload.secure_url || !payload.public_id) {
    throw new Error('Cloudinary upload succeeded without a usable asset URL')
  }

  return payload.secure_url
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
