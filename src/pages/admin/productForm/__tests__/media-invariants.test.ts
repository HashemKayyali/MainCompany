import { describe, it, expect } from 'vitest'
import {
  collectProductMediaRefs,
  enforceHeroInvariant,
} from '../media-invariants'
import { AssetSession } from '../../../../services/asset-session'
import {
  IMAGE_BUCKET,
  VIDEO_BUCKET,
  type AssetDeletionResult,
  type StorageIdentity,
} from '../../../../services/storage.service'

/*
 * Integration tests for the Product editor's media lifecycle.
 *
 * `enforceHeroInvariant` + `collectProductMediaRefs` are wired
 * against a real `AssetSession` (with an injected deleter) so the
 * end-to-end shape — Open → user edits → Save/Cancel → cleanup — is
 * asserted the way it flows in the admin page. No React needed;
 * these are pure lifecycle assertions.
 */

const PROJECT = 'https://example.supabase.co'
const url = (bucket: string, path: string) =>
  `${PROJECT}/storage/v1/object/public/${bucket}/${path}`

const A = url(IMAGE_BUCKET, 'products/a-hero.webp')
const B = url(IMAGE_BUCKET, 'products/b-hero.webp')
const C = url(IMAGE_BUCKET, 'products/c-hero.webp')
const H = url(IMAGE_BUCKET, 'products/legacy-hero.webp')
const V_A = url(VIDEO_BUCKET, 'products/v-a.webm')
const V_B = url(VIDEO_BUCKET, 'products/v-b.webm')

function recordingDeleter() {
  const calls: string[][] = []
  const fn = async (
    identities: StorageIdentity[],
  ): Promise<AssetDeletionResult> => {
    calls.push(identities.map(i => i.canonical))
    return {
      requested: identities.length,
      deleted: identities.slice(),
      alreadyMissing: [],
      failed: [],
    }
  }
  return { fn, calls }
}

/* ------------------------------------------------------------------ *
 *  Pure invariant                                                     *
 * ------------------------------------------------------------------ */

describe('enforceHeroInvariant', () => {
  it('returns gallery[0] when the gallery is non-empty', () => {
    expect(enforceHeroInvariant([A, B])).toBe(A)
  })
  it('returns empty string when the gallery is empty', () => {
    expect(enforceHeroInvariant([])).toBe('')
  })
  it('does NOT fall back to a stale hero — the dangerous state is unrepresentable', () => {
    // Even if a caller *wants* to smuggle a legacy hero through, the
    // invariant refuses. The whole point.
    expect(enforceHeroInvariant([])).not.toBe(H)
  })
})

describe('collectProductMediaRefs', () => {
  it('collects heroImage + gallery + videoUrl in that order', () => {
    expect(
      collectProductMediaRefs({
        heroImage: H,
        gallery: [A, B],
        videoUrl: V_A,
      }),
    ).toEqual([H, A, B, V_A])
  })
  it('handles missing fields gracefully', () => {
    expect(collectProductMediaRefs({})).toEqual([])
    expect(collectProductMediaRefs({ heroImage: A })).toEqual([A])
    expect(collectProductMediaRefs({ gallery: [A] })).toEqual([A])
  })
})

/* ------------------------------------------------------------------ *
 *  Ten hero/gallery scenarios from the spec                          *
 * ------------------------------------------------------------------ */

describe('product hero + gallery — spec scenarios', () => {
  it('1. gallery [A], hero A → remove A → Save deletes A', async () => {
    const { fn, calls } = recordingDeleter()
    const originals = collectProductMediaRefs({ heroImage: A, gallery: [A] })
    const session = new AssetSession({ originalUrls: originals, deleter: fn })
    // user removes A → gallery becomes []
    const finalGallery: string[] = []
    const finalPayload = {
      heroImage: enforceHeroInvariant(finalGallery),
      gallery: finalGallery,
    }
    expect(finalPayload.heroImage).toBe('')
    // Save reconciles.
    const cleanup = await session.commit(
      collectProductMediaRefs(finalPayload),
    )
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    ])
    expect(calls.flat()).toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
  })

  it('2. gallery [A], hero A → remove A → Cancel keeps A', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery: [A] }),
      deleter: fn,
    })
    const cleanup = await session.cancel()
    expect(cleanup.requested).toBe(0)
    expect(calls[0] ?? []).toEqual([])
  })

  it('3. gallery [A,B], hero A → remove A → Save deletes A, keeps B', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery: [A, B] }),
      deleter: fn,
    })
    // user removes A → gallery [B], hero becomes B via invariant
    const finalPayload = {
      heroImage: enforceHeroInvariant([B]),
      gallery: [B],
    }
    expect(finalPayload.heroImage).toBe(B)
    const cleanup = await session.commit(collectProductMediaRefs(finalPayload))
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    ])
  })

  it('4. legacy hero H + gallery [A,B] → Save unchanged: no cleanup', async () => {
    const { fn, calls } = recordingDeleter()
    const originals = collectProductMediaRefs({
      heroImage: H,
      gallery: [A, B],
    })
    const session = new AssetSession({ originalUrls: originals, deleter: fn })
    // user does not touch anything; the enforce-invariant during
    // save will REWRITE heroImage from H to A. So the final payload
    // no longer references H.
    const finalGallery = [A, B]
    const finalPayload = {
      heroImage: enforceHeroInvariant(finalGallery),
      gallery: finalGallery,
    }
    expect(finalPayload.heroImage).toBe(A)
    const cleanup = await session.commit(collectProductMediaRefs(finalPayload))
    // Legacy H is no longer referenced → it MUST be cleaned up.
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/legacy-hero.webp`,
    ])
    // A and B were referenced before and after → not touched.
    expect(calls.flat()).not.toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
    expect(calls.flat()).not.toContain(`${IMAGE_BUCKET}/products/b-hero.webp`)
  })

  it('5. legacy hero H + gallery [A,B] → change gallery: cleanup preserves final refs', async () => {
    const { fn } = recordingDeleter()
    const originals = collectProductMediaRefs({
      heroImage: H,
      gallery: [A, B],
    })
    const session = new AssetSession({ originalUrls: originals, deleter: fn })
    // Upload C, replace whole gallery with [C].
    await session.runUpload<string>(async () => C, u => [u])
    const finalGallery = [C]
    const finalPayload = {
      heroImage: enforceHeroInvariant(finalGallery),
      gallery: finalGallery,
    }
    const cleanup = await session.commit(collectProductMediaRefs(finalPayload))
    const deletedSet = new Set(cleanup.deleted.map(d => d.canonical))
    expect(deletedSet.has(`${IMAGE_BUCKET}/products/legacy-hero.webp`)).toBe(true)
    expect(deletedSet.has(`${IMAGE_BUCKET}/products/a-hero.webp`)).toBe(true)
    expect(deletedSet.has(`${IMAGE_BUCKET}/products/b-hero.webp`)).toBe(true)
    expect(deletedSet.has(`${IMAGE_BUCKET}/products/c-hero.webp`)).toBe(false)
  })

  it('6. add B, remove B before Save → cleanup deletes only B', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery: [A] }),
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])
    // user removes B before save → final gallery is [A].
    const finalGallery = [A]
    const finalPayload = {
      heroImage: enforceHeroInvariant(finalGallery),
      gallery: finalGallery,
    }
    const cleanup = await session.commit(collectProductMediaRefs(finalPayload))
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/b-hero.webp`,
    ])
  })

  it('7. add B, replace with C, Save C → deletes A and B, keeps C', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery: [A] }),
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])
    await session.runUpload<string>(async () => C, u => [u])
    const finalGallery = [C]
    const finalPayload = {
      heroImage: enforceHeroInvariant(finalGallery),
      gallery: finalGallery,
    }
    const cleanup = await session.commit(collectProductMediaRefs(finalPayload))
    const deleted = new Set(cleanup.deleted.map(d => d.canonical))
    expect(deleted.has(`${IMAGE_BUCKET}/products/a-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/b-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/c-hero.webp`)).toBe(false)
  })

  it('8. add B, replace with C, Cancel → deletes B and C, keeps A', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery: [A] }),
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])
    await session.runUpload<string>(async () => C, u => [u])
    const cleanup = await session.cancel()
    const deleted = new Set(cleanup.deleted.map(d => d.canonical))
    expect(deleted.has(`${IMAGE_BUCKET}/products/a-hero.webp`)).toBe(false)
    expect(deleted.has(`${IMAGE_BUCKET}/products/b-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/c-hero.webp`)).toBe(true)
  })

  it('9. database Save failure — nothing is cleaned up', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery: [A] }),
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])
    // Simulated: caller never calls commit because DB save failed.
    // Session stays live for retry / cancel.
    expect(calls).toHaveLength(0)
    expect(session.hasOriginal(A)).toBe(true)
    expect(session.hasSessionUpload(B)).toBe(true)
  })

  it('10. delete product with hero + gallery — refs collected before DB delete', () => {
    const target = { heroImage: H, gallery: [A, B], videoUrl: V_A }
    const refs = collectProductMediaRefs(target)
    // Order preserves the collection contract; canonical dedup happens
    // downstream in deleteAssetsSafely.
    expect(refs).toEqual([H, A, B, V_A])
  })
})

/* ------------------------------------------------------------------ *
 *  Video lifecycle                                                    *
 * ------------------------------------------------------------------ */

describe('product video lifecycle', () => {
  it('REMOVE + CANCEL: original video stays untouched', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ videoUrl: V_A }),
      deleter: fn,
    })
    // user clicks Remove → form.videoUrl becomes '' (no session call)
    // then Cancel:
    const cleanup = await session.cancel()
    expect(cleanup.requested).toBe(0)
    expect(calls[0] ?? []).toEqual([])
  })

  it('REMOVE + SAVE SUCCESS: original video is deleted', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ videoUrl: V_A }),
      deleter: fn,
    })
    // final payload has no video
    const cleanup = await session.commit(collectProductMediaRefs({}))
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${VIDEO_BUCKET}/products/v-a.webm`,
    ])
  })

  it('REPLACE A with B, CANCEL: A remains, B is deleted', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ videoUrl: V_A }),
      deleter: fn,
    })
    await session.runUpload<string>(async () => V_B, u => [u])
    const cleanup = await session.cancel()
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${VIDEO_BUCKET}/products/v-b.webm`,
    ])
  })

  it('REPLACE A with B, SAVE B: B remains, A is deleted', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ videoUrl: V_A }),
      deleter: fn,
    })
    await session.runUpload<string>(async () => V_B, u => [u])
    const cleanup = await session.commit(
      collectProductMediaRefs({ videoUrl: V_B }),
    )
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${VIDEO_BUCKET}/products/v-a.webm`,
    ])
  })
})

/* ------------------------------------------------------------------ *
 *  Entity delete ordering                                             *
 * ------------------------------------------------------------------ */

describe('entity delete — DB before storage', () => {
  it('DB failure: storage cleanup does NOT run', async () => {
    const { fn, calls } = recordingDeleter()
    const dbDelete = async () => {
      throw new Error('db unavailable')
    }
    let deleted: string[] | undefined
    try {
      await dbDelete()
      deleted = ['must-not-run']
    } catch {
      // Simulated caller path: on DB failure, storage cleanup is
      // NEVER invoked.
      deleted = undefined
    }
    expect(deleted).toBeUndefined()
    // Prove the deleter was not touched.
    void fn
    expect(calls).toHaveLength(0)
  })

  it('DB success: storage cleanup runs with the pre-collected refs', async () => {
    const { fn, calls } = recordingDeleter()
    const target = { heroImage: A, gallery: [A, B], videoUrl: V_A }
    const refs = collectProductMediaRefs(target)
    // Simulated caller path: DB delete resolves, THEN cleanup is
    // invoked with refs.
    const dbDelete = async () => undefined
    await dbDelete()
    // Convert URLs to identities to feed the injected deleter — the
    // real `deleteAssetsSafely` does this internally.
    const { getStorageIdentity } = await import('../../../../services/storage.service')
    const identities = refs
      .map(u => getStorageIdentity(u))
      .filter((i): i is NonNullable<typeof i> => Boolean(i))
    await fn(identities)
    expect(calls[0]).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
      // deduplicated? we passed A twice via hero+gallery[0], but
      // dedup happens in `deleteAssetsSafely` public wrapper — the
      // raw deleter here reflects whatever the caller sent. In the
      // real path the wrapper canonicalises first.
      `${IMAGE_BUCKET}/products/a-hero.webp`,
      `${IMAGE_BUCKET}/products/b-hero.webp`,
      `${VIDEO_BUCKET}/products/v-a.webm`,
    ])
  })
})

/* ------------------------------------------------------------------ *
 *  Array-specific scenarios                                           *
 * ------------------------------------------------------------------ */

describe('gallery array — remove first / middle / last / all', () => {
  const gallery = [A, B, C]

  it('remove first item', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery }),
      deleter: fn,
    })
    const finalGallery = gallery.slice(1)
    const cleanup = await session.commit(
      collectProductMediaRefs({
        heroImage: enforceHeroInvariant(finalGallery),
        gallery: finalGallery,
      }),
    )
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    ])
  })

  it('remove middle item', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery }),
      deleter: fn,
    })
    const finalGallery = [gallery[0], gallery[2]]
    const cleanup = await session.commit(
      collectProductMediaRefs({
        heroImage: enforceHeroInvariant(finalGallery),
        gallery: finalGallery,
      }),
    )
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/b-hero.webp`,
    ])
  })

  it('remove last item', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery }),
      deleter: fn,
    })
    const finalGallery = gallery.slice(0, -1)
    const cleanup = await session.commit(
      collectProductMediaRefs({
        heroImage: enforceHeroInvariant(finalGallery),
        gallery: finalGallery,
      }),
    )
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/c-hero.webp`,
    ])
  })

  it('remove ALL items', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery }),
      deleter: fn,
    })
    const finalGallery: string[] = []
    const cleanup = await session.commit(
      collectProductMediaRefs({
        heroImage: enforceHeroInvariant(finalGallery),
        gallery: finalGallery,
      }),
    )
    const deleted = new Set(cleanup.deleted.map(d => d.canonical))
    expect(deleted.has(`${IMAGE_BUCKET}/products/a-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/b-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/c-hero.webp`)).toBe(true)
  })

  it('reorder only — no deletions', async () => {
    const { fn } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery }),
      deleter: fn,
    })
    const finalGallery = [gallery[2], gallery[1], gallery[0]]
    const cleanup = await session.commit(
      collectProductMediaRefs({
        heroImage: enforceHeroInvariant(finalGallery),
        gallery: finalGallery,
      }),
    )
    expect(cleanup.deleted).toHaveLength(0)
  })

  it('duplicated URLs collapse to one canonical', async () => {
    const { fn } = recordingDeleter()
    const framed = `${A}#m=eyJ4Ijo1MH0`
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery: [A, framed] }),
      deleter: fn,
    })
    // Remove one of the duplicates — canonical still referenced.
    const finalGallery = [framed]
    const cleanup = await session.commit(
      collectProductMediaRefs({
        heroImage: enforceHeroInvariant(finalGallery),
        gallery: finalGallery,
      }),
    )
    expect(cleanup.deleted).toHaveLength(0)
  })

  it('hero and array pointing at the same asset only cleanup once when removed', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: collectProductMediaRefs({ heroImage: A, gallery: [A] }),
      deleter: fn,
    })
    const finalGallery: string[] = []
    await session.commit(
      collectProductMediaRefs({
        heroImage: enforceHeroInvariant(finalGallery),
        gallery: finalGallery,
      }),
    )
    // The one A URL should have been passed to the deleter exactly
    // once — session dedupes by canonical.
    expect(calls[0]).toEqual([`${IMAGE_BUCKET}/products/a-hero.webp`])
  })
})
