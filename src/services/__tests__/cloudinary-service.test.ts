import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
}))

vi.mock('../../lib/supabase', () => ({
  supabase: {
    functions: {
      invoke: mocks.invoke,
    },
  },
}))

import {
  deleteCloudinaryIdentities,
  uploadImageToCloudinary,
} from '../cloudinary.service'
import type { CloudinaryStorageIdentity } from '../cloudinary-identity'

describe('cloudinary.service', () => {
  beforeEach(() => {
    mocks.invoke.mockReset()
    vi.restoreAllMocks()
  })

  it('requests a server signature and uploads the file directly to Cloudinary', async () => {
    mocks.invoke.mockResolvedValueOnce({
      data: {
        cloudName: 'demo-cloud',
        apiKey: 'public-api-key',
        timestamp: 1783447500,
        signature: 'signed-value',
        folder: 'eventies/products',
      },
      error: null,
    })

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          public_id: 'eventies/products/example',
          secure_url: 'https://res.cloudinary.com/demo-cloud/image/upload/v1783447500/eventies/products/example.jpg',
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    )

    const file = new File(['image-bytes'], 'example.jpg', { type: 'image/jpeg' })
    const url = await uploadImageToCloudinary(file, 'products')

    expect(mocks.invoke).toHaveBeenCalledWith('cloudinary-assets', {
      body: { action: 'sign-upload', folder: 'products' },
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [endpoint, init] = fetchMock.mock.calls[0]
    expect(endpoint).toBe('https://api.cloudinary.com/v1_1/demo-cloud/image/upload')
    expect(init?.method).toBe('POST')
    expect(init?.body).toBeInstanceOf(FormData)

    const body = init?.body as FormData
    expect(body.get('file')).toBe(file)
    expect(body.get('api_key')).toBe('public-api-key')
    expect(body.get('timestamp')).toBe('1783447500')
    expect(body.get('signature')).toBe('signed-value')
    expect(body.get('folder')).toBe('eventies/products')
    expect(url).toContain('/eventies/products/example.jpg')
  })

  it('maps secure delete results into the shared asset-deletion shape', async () => {
    mocks.invoke.mockResolvedValueOnce({
      data: {
        results: [
          { publicId: 'eventies/products/a', result: 'ok' },
          { publicId: 'eventies/products/b', result: 'not found' },
        ],
      },
      error: null,
    })

    const identities: CloudinaryStorageIdentity[] = [
      cloudinaryIdentity('eventies/products/a'),
      cloudinaryIdentity('eventies/products/b'),
    ]

    const result = await deleteCloudinaryIdentities(identities)

    expect(mocks.invoke).toHaveBeenCalledWith('cloudinary-assets', {
      body: {
        action: 'delete',
        assets: [
          {
            cloudName: 'demo-cloud',
            publicId: 'eventies/products/a',
            resourceType: 'image',
          },
          {
            cloudName: 'demo-cloud',
            publicId: 'eventies/products/b',
            resourceType: 'image',
          },
        ],
      },
    })

    expect(result.requested).toBe(2)
    expect(result.deleted.map(item => item.canonical)).toEqual([
      'cloudinary:demo-cloud:image/eventies/products/a',
    ])
    expect(result.alreadyMissing.map(item => item.canonical)).toEqual([
      'cloudinary:demo-cloud:image/eventies/products/b',
    ])
    expect(result.failed).toEqual([])
  })
})

function cloudinaryIdentity(publicId: string): CloudinaryStorageIdentity {
  return {
    provider: 'cloudinary',
    cloudName: 'demo-cloud',
    publicId,
    resourceType: 'image',
    kind: 'image',
    bucket: 'cloudinary:demo-cloud:image',
    path: publicId,
    canonical: `cloudinary:demo-cloud:image/${publicId}`,
  }
}
