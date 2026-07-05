import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  AssetSession,
  AssetSessionBusyError,
  AssetSessionDisposedError,
  createAssetSession,
} from '../asset-session'
import {
  IMAGE_BUCKET,
  VIDEO_BUCKET,
  type AssetDeletionResult,
  type StorageIdentity,
} from '../storage.service'

/*
 * These tests exercise the shared media-lifecycle logic without
 * touching the real Supabase client. A deleter is injected into each
 * session so we can assert precisely which canonicals are cleaned up
 * at which lifecycle transition, and simulate cleanup partial
 * failures.
 */

const PROJECT = 'https://example.supabase.co'
const url = (bucket: string, path: string) =>
  `${PROJECT}/storage/v1/object/public/${bucket}/${path}`

/**
 * A recording deleter that reports every identity it is asked to
 * remove. By default it reports every one as successfully deleted;
 * tests can override its behaviour to simulate missing objects or
 * failures.
 */
function makeDeleter(
  behaviour?: (identities: StorageIdentity[]) => AssetDeletionResult,
) {
  const calls: string[][] = []
  const fn = async (
    identities: StorageIdentity[],
  ): Promise<AssetDeletionResult> => {
    calls.push(identities.map(id => id.canonical))
    if (behaviour) return behaviour(identities)
    return {
      requested: identities.length,
      deleted: identities.slice(),
      alreadyMissing: [],
      failed: [],
    }
  }
  return { fn, calls }
}

// Silence VIDEO_BUCKET as unused import — keep it exported for other
// tests that reference video URLs.
void VIDEO_BUCKET

const HERO_A = url(IMAGE_BUCKET, 'products/a-hero.webp')
const HERO_B = url(IMAGE_BUCKET, 'products/b-hero.webp')
const HERO_C = url(IMAGE_BUCKET, 'products/c-hero.webp')
const HERO_D = url(IMAGE_BUCKET, 'products/d-hero.webp')
const VIDEO_A = url(VIDEO_BUCKET, 'products/v-a.webm')

beforeEach(() => {
  vi.useRealTimers()
})

describe('AssetSession — construction', () => {
  it('ingests originals and dedupes duplicate URLs by canonical', () => {
    const { fn: deleter } = makeDeleter()
    const framed = `${HERO_A}#m=eyJ4Ijo1MH0`
    const session = createAssetSession({
      originalUrls: [HERO_A, framed, HERO_B],
      deleter,
    })
    expect(session.snapshot().originalCount).toBe(2)
    expect(session.hasOriginal(HERO_A)).toBe(true)
    expect(session.hasOriginal(HERO_B)).toBe(true)
  })

  it('ignores garbage inputs during construction', () => {
    const { fn: deleter } = makeDeleter()
    const session = createAssetSession({
      originalUrls: [null, undefined, '', 'https://cdn.example.com/x.png'],
      deleter,
    })
    expect(session.snapshot().originalCount).toBe(0)
  })
})

describe('AssetSession — upload success and failure', () => {
  it('registers the uploaded canonical as a session temporary (scenario 1: upload success)', async () => {
    const { fn: deleter } = makeDeleter()
    const session = createAssetSession({ deleter })

    const result = await session.runUpload<string>(
      async () => HERO_A,
      u => [u],
    )
    expect(result).toBe(HERO_A)
    expect(session.hasSessionUpload(HERO_A)).toBe(true)
    expect(session.snapshot().inFlight).toBe(0)
  })

  it('never registers the URL when work throws (scenario 2: upload failure)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({ deleter })

    await expect(
      session.runUpload<string>(async () => {
        throw new Error('boom')
      }, u => [u]),
    ).rejects.toThrow('boom')

    expect(session.snapshot().sessionUploadsCount).toBe(0)
    expect(session.snapshot().inFlight).toBe(0)
    expect(calls).toHaveLength(0)
  })
})

describe('AssetSession — cancel', () => {
  it('deletes only the session uploads, not the originals (scenario 8: upload then cancel)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({
      originalUrls: [HERO_A],
      deleter,
    })
    await session.runUpload<string>(async () => HERO_B, u => [u])

    const cleanup = await session.cancel()
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/b-hero.webp`,
    ])
    expect(calls[0]).toEqual([`${IMAGE_BUCKET}/products/b-hero.webp`])
    // Original untouched
    expect(cleanup.deleted.some(d => d.canonical.endsWith('a-hero.webp'))).toBe(false)
  })

  it('cleans every temporary uploaded during Replace-Replace (scenario 9: upload A, replace with B, cancel)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({ deleter })

    await session.runUpload<string>(async () => HERO_A, u => [u])
    await session.runUpload<string>(async () => HERO_B, u => [u])
    // The user "replaces" A with B — from the session's perspective
    // both A and B are session-temporary until save/cancel.
    await session.cancel()

    const deletedCanonicals = new Set(calls[0])
    expect(deletedCanonicals.has(`${IMAGE_BUCKET}/products/a-hero.webp`)).toBe(true)
    expect(deletedCanonicals.has(`${IMAGE_BUCKET}/products/b-hero.webp`)).toBe(true)
  })

  it('is a no-op on repeated calls', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({ deleter })
    await session.runUpload<string>(async () => HERO_A, u => [u])
    await session.cancel()
    const second = await session.cancel()
    expect(second.requested).toBe(0)
    expect(calls).toHaveLength(1)
  })
})

describe('AssetSession — commit', () => {
  it('deletes replaced session temporaries but keeps the final one (scenario 10: upload A, replace with B, save B)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({ deleter })

    await session.runUpload<string>(async () => HERO_A, u => [u])
    await session.runUpload<string>(async () => HERO_B, u => [u])

    const cleanup = await session.commit([HERO_B])
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    ])
    expect(calls[0]).toEqual([`${IMAGE_BUCKET}/products/a-hero.webp`])
  })

  it('does nothing when Remove was followed by Cancel — original stays (scenario 11: remove persisted then cancel)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({
      originalUrls: [HERO_A],
      deleter,
    })
    // Remove is a form-state mutation only; no session call is made.
    // Cancel should NOT touch the original.
    const cleanup = await session.cancel()
    expect(cleanup.requested).toBe(0)
    expect(calls[0] ?? []).toEqual([])
  })

  it('deletes the original when Remove is followed by successful Save (scenario 12: remove persisted then save)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({
      originalUrls: [HERO_A],
      deleter,
    })
    // The parent form state now has no image. Save reconciles.
    const cleanup = await session.commit([])
    expect(cleanup.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    ])
    expect(calls[0]).toEqual([`${IMAGE_BUCKET}/products/a-hero.webp`])
  })

  it('leaves originals untouched if the caller aborts save before calling commit (scenario 13: DB save failure after Remove)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({
      originalUrls: [HERO_A],
      deleter,
    })
    // Simulate: DB save fails, so we do NOT call commit. Caller may
    // retry save or cancel later; original must still exist.
    expect(session.hasOriginal(HERO_A)).toBe(true)
    expect(calls).toHaveLength(0)
  })

  it('keeps replaced-and-uploaded-only files when caller aborts save (scenario 14: DB save failure after Replace)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({
      originalUrls: [HERO_A],
      deleter,
    })
    await session.runUpload<string>(async () => HERO_B, u => [u])
    // Save fails — commit is not called. Both A and B must still be
    // reachable so the user can retry Save.
    expect(session.hasOriginal(HERO_A)).toBe(true)
    expect(session.hasSessionUpload(HERO_B)).toBe(true)
    expect(calls).toHaveLength(0)
  })

  it('rejects commit while uploads are still in flight (scenario 18: commit while uploading must be prevented)', async () => {
    const { fn: deleter } = makeDeleter()
    const session = createAssetSession({ deleter })

    let releaseUpload: (v: string) => void = () => undefined
    const pending = new Promise<string>(resolve => {
      releaseUpload = resolve
    })
    const uploadPromise = session.runUpload<string>(() => pending, u => [u])

    expect(session.snapshot().canCommit).toBe(false)
    await expect(session.commit([HERO_A])).rejects.toBeInstanceOf(AssetSessionBusyError)

    releaseUpload(HERO_A)
    await uploadPromise
    expect(session.snapshot().canCommit).toBe(true)
  })

  it('throws AssetSessionDisposedError if commit is called after cancel', async () => {
    const { fn: deleter } = makeDeleter()
    const session = createAssetSession({ deleter })
    await session.cancel()
    await expect(session.commit([])).rejects.toBeInstanceOf(AssetSessionDisposedError)
  })

  it('marks the session as disposed after commit — subsequent commit throws', async () => {
    const { fn: deleter } = makeDeleter()
    const session = createAssetSession({
      originalUrls: [HERO_A],
      deleter,
    })
    await session.commit([])
    await expect(session.commit([HERO_A])).rejects.toBeInstanceOf(
      AssetSessionDisposedError,
    )
  })
})

describe('AssetSession — late-completion race handling', () => {
  it('cleans up an upload that resolves AFTER the session was disposed (scenario 15)', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({ deleter })

    let releaseUpload: (v: string) => void = () => undefined
    const pending = new Promise<string>(resolve => {
      releaseUpload = resolve
    })
    const uploadPromise = session.runUpload<string>(() => pending, u => [u])

    // Editor closes / component unmounts while upload is in flight.
    session.dispose()

    // Now the upload finishes — but the session is disposed.
    releaseUpload(HERO_C)
    const result = await uploadPromise

    expect(result).toBeNull() // late completion signals null
    // The session cleaned up the orphan storage object.
    expect(calls.length).toBeGreaterThanOrEqual(1)
    const flatDeleted = calls.flat()
    expect(flatDeleted).toContain(`${IMAGE_BUCKET}/products/c-hero.webp`)
  })

  it('cleans up when session is reset while upload is in flight', async () => {
    const { fn: deleter, calls } = makeDeleter()
    const session = createAssetSession({ deleter })

    let releaseUpload: (v: string) => void = () => undefined
    const pending = new Promise<string>(resolve => {
      releaseUpload = resolve
    })
    const uploadPromise = session.runUpload<string>(() => pending, u => [u])

    session.reset([HERO_A])
    releaseUpload(HERO_D)
    const result = await uploadPromise
    expect(result).toBeNull()

    const flatDeleted = calls.flat()
    expect(flatDeleted).toContain(`${IMAGE_BUCKET}/products/d-hero.webp`)
  })
})

describe('AssetSession — concurrency & state observability', () => {
  it('tracks multiple simultaneous uploads correctly (scenario 16)', async () => {
    const { fn: deleter } = makeDeleter()
    const session = createAssetSession({ deleter })

    const releases: Array<(v: string) => void> = []
    const pending = [HERO_A, HERO_B, HERO_C].map(final => {
      return new Promise<string>(resolve => {
        releases.push(() => resolve(final))
      })
    })

    const uploads = pending.map((p, index) =>
      session.runUpload<string>(() => p, u => [u]).then(v => ({ index, v })),
    )
    expect(session.snapshot().inFlight).toBe(3)
    expect(session.snapshot().canCommit).toBe(false)

    // Finish in a scrambled order to prove counters don't drift.
    releases[1]('unused')
    releases[0]('unused')
    releases[2]('unused')

    await Promise.all(uploads)
    expect(session.snapshot().inFlight).toBe(0)
    expect(session.snapshot().canCommit).toBe(true)
    expect(session.listSessionUploads().length).toBe(3)
  })

  it('emits snapshots to subscribers on every state transition', async () => {
    const { fn: deleter } = makeDeleter()
    const session = createAssetSession({ deleter })
    const snapshots: number[] = []
    const unsub = session.subscribe(snap => snapshots.push(snap.inFlight))

    let release: (v: string) => void = () => undefined
    const pending = new Promise<string>(resolve => {
      release = resolve
    })
    const promise = session.runUpload<string>(() => pending, u => [u])
    release(HERO_A)
    await promise
    unsub()

    // At minimum we saw inFlight go up then back down.
    expect(snapshots).toContain(1)
    expect(snapshots).toContain(0)
  })
})

describe('AssetSession — cleanup partial failure reporting', () => {
  it('routes commit-time cleanup failures to onCleanupFailure (scenario 17: cleanup partial failure)', async () => {
    const failing = vi.fn(
      (identities: StorageIdentity[]): AssetDeletionResult => ({
        requested: identities.length,
        deleted: [],
        alreadyMissing: [],
        failed: identities.map(identity => ({
          canonical: identity.canonical,
          bucket: identity.bucket,
          path: identity.path,
          error: 'simulated network error',
        })),
      }),
    )
    const { fn: deleter } = makeDeleter(failing)

    const onCleanupFailure = vi.fn()
    const session = createAssetSession({
      originalUrls: [HERO_A],
      deleter,
      onCleanupFailure,
    })

    const cleanup = await session.commit([])
    expect(cleanup.failed).toHaveLength(1)
    expect(cleanup.deleted).toHaveLength(0)
    expect(onCleanupFailure).toHaveBeenCalledOnce()
    expect(onCleanupFailure.mock.calls[0][0].failed[0].error).toContain('simulated')
  })

  it('routes late-completion cleanup failures to both onLateCleanup and onCleanupFailure', async () => {
    const failing = (identities: StorageIdentity[]): AssetDeletionResult => ({
      requested: identities.length,
      deleted: [],
      alreadyMissing: [],
      failed: identities.map(identity => ({
        canonical: identity.canonical,
        bucket: identity.bucket,
        path: identity.path,
        error: 'late-boom',
      })),
    })
    const { fn: deleter } = makeDeleter(failing)

    const onLateCleanup = vi.fn()
    const onCleanupFailure = vi.fn()
    const session = createAssetSession({
      deleter,
      onLateCleanup,
      onCleanupFailure,
    })

    let release: (v: string) => void = () => undefined
    const pending = new Promise<string>(resolve => {
      release = resolve
    })
    const upload = session.runUpload<string>(() => pending, u => [u])

    session.dispose()
    release(HERO_B)
    await upload

    expect(onLateCleanup).toHaveBeenCalledOnce()
    expect(onCleanupFailure).toHaveBeenCalledOnce()
  })
})

describe('AssetSession — canonical dedup guards against duplicate-URL bugs', () => {
  it('recognises framed and bare URLs as the same session upload (scenario 7: duplicate URLs same path)', async () => {
    const { fn: deleter } = makeDeleter()
    const session = createAssetSession({ deleter })
    const framed = `${HERO_A}#m=eyJ4Ijo1MH0`

    await session.runUpload<string>(async () => HERO_A, u => [u])
    expect(session.hasSessionUpload(framed)).toBe(true) // canonical equality

    // Save that references the framed variant should NOT delete the
    // shared underlying storage object.
    const cleanup = await session.commit([framed])
    expect(cleanup.deleted).toHaveLength(0)
  })
})

describe('storage service — deletion result shape (scenarios 4/5/6)', () => {
  it('returns empty result for null/undefined inputs (scenario 5: already-missing / no-op)', async () => {
    // Import from source to get the real behaviour; no Supabase is
    // reachable so the safe path should report identities as
    // alreadyMissing/no-op (requested is only counted for parseable
    // URLs).
    const { deleteAssetsSafely } = await import('../storage.service')
    const result = await deleteAssetsSafely([null, undefined, '', 'https://foo/bar.png'])
    expect(result.requested).toBe(0)
    expect(result.deleted).toHaveLength(0)
    expect(result.failed).toHaveLength(0)
  })
})
