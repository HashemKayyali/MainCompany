import { describe, it, expect, vi } from 'vitest'
import { AssetSession } from '../asset-session'
import {
  IMAGE_BUCKET,
  type AssetDeletionResult,
  type StorageIdentity,
} from '../storage.service'

/*
 * Two focused regression suites requested during the pre-GC audit:
 *
 *   1. Save → commit → unmount race:  proving a session asset that
 *      just became a persisted DB reference is not deleted by a
 *      subsequent dispose/cancel (whether commit cleanup fully
 *      succeeded or partially failed).
 *
 *   2. Create → cancel → create session-generation safety: proving
 *      a first-session upload cannot leak into or be deleted by a
 *      second session, and the second session sees a clean slate.
 */

const PROJECT = 'https://example.supabase.co'
const url = (bucket: string, path: string) =>
  `${PROJECT}/storage/v1/object/public/${bucket}/${path}`

const A = url(IMAGE_BUCKET, 'products/a-hero.webp')
const B = url(IMAGE_BUCKET, 'products/b-hero.webp')
const C = url(IMAGE_BUCKET, 'products/c-hero.webp')

function successfulDeleter() {
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

function failingDeleter() {
  const calls: string[][] = []
  const fn = async (
    identities: StorageIdentity[],
  ): Promise<AssetDeletionResult> => {
    calls.push(identities.map(i => i.canonical))
    return {
      requested: identities.length,
      deleted: [],
      alreadyMissing: [],
      failed: identities.map(identity => ({
        canonical: identity.canonical,
        bucket: identity.bucket,
        path: identity.path,
        error: 'simulated storage 500',
      })),
    }
  }
  return { fn, calls }
}

/* ------------------------------------------------------------------ *
 *  1. Save → commit → unmount race                                    *
 * ------------------------------------------------------------------ */

describe('save → commit → unmount race', () => {
  it('a committed final session asset is NOT deleted by a subsequent dispose', async () => {
    const { fn, calls } = successfulDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    // user uploads B during the session — this is the "session-temp"
    // that becomes the final persisted asset after Save.
    await session.runUpload<string>(async () => B, u => [u])

    // Save succeeds — final DB payload references B (not A).
    const commitResult = await session.commit([B])
    // A was in originals-not-in-final → cleaned up.
    expect(commitResult.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    ])
    // Simulated unmount: modal closes, useAssetSession's cleanup
    // effect fires session.dispose(). If dispose were to touch B,
    // the DB would end up pointing at a missing object.
    session.dispose()

    // Prove B was NEVER passed to the deleter — a second call would
    // show up here.
    const allDeletedCanonicals = calls.flat()
    expect(allDeletedCanonicals).not.toContain(
      `${IMAGE_BUCKET}/products/b-hero.webp`,
    )
    // Only one deletion cycle ran (the commit).
    expect(calls).toHaveLength(1)
  })

  it('a committed final session asset is NOT deleted by a subsequent cancel', async () => {
    const { fn, calls } = successfulDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])

    await session.commit([B])
    // A stray cancel() somewhere in the codebase after commit must
    // be a no-op — it is guarded by the `disposed` flag.
    await session.cancel()

    const allDeletedCanonicals = calls.flat()
    expect(allDeletedCanonicals).not.toContain(
      `${IMAGE_BUCKET}/products/b-hero.webp`,
    )
    expect(calls).toHaveLength(1)
  })

  it('a partial commit-cleanup failure still marks the session inert — dispose does not retry', async () => {
    const { fn, calls } = failingDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])

    const commitResult = await session.commit([B])
    // The commit attempted to delete A but the deleter failed.
    expect(commitResult.failed).toHaveLength(1)
    expect(commitResult.failed[0].canonical).toBe(
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    )
    expect(calls).toHaveLength(1)

    // Editor closes / unmounts → dispose fires. It MUST NOT retry the
    // failed cleanup and it MUST NOT touch B.
    session.dispose()
    expect(calls).toHaveLength(1)
  })

  it('dispose during safeDelete does not double-schedule cleanup of the same asset', async () => {
    // Simulate a slow-resolving deleter so we can call dispose()
    // while commit's cleanup is still in flight.
    let releaseCleanup: (v: AssetDeletionResult) => void = () => undefined
    const cleanupPromise = new Promise<AssetDeletionResult>(resolve => {
      releaseCleanup = resolve
    })
    const seen: string[][] = []
    const slowDeleter = async (
      identities: StorageIdentity[],
    ): Promise<AssetDeletionResult> => {
      seen.push(identities.map(i => i.canonical))
      return cleanupPromise
    }
    const session = new AssetSession({
      originalUrls: [A],
      deleter: slowDeleter,
    })
    await session.runUpload<string>(async () => B, u => [u])

    const commitPromise = session.commit([B])
    // While the (slow) commit cleanup is running, unmount fires.
    session.dispose()
    // dispose fired but the deleter should not have been re-entered
    // because commit ran first and set disposed=true synchronously.
    expect(seen).toHaveLength(1)
    expect(seen[0]).toEqual([`${IMAGE_BUCKET}/products/a-hero.webp`])

    releaseCleanup({
      requested: 1,
      deleted: [
        {
          kind: 'image',
          bucket: IMAGE_BUCKET,
          path: 'products/a-hero.webp',
          canonical: `${IMAGE_BUCKET}/products/a-hero.webp`,
        },
      ],
      alreadyMissing: [],
      failed: [],
    })
    const result = await commitPromise
    expect(result.deleted).toHaveLength(1)
    // Final state: exactly one deleter call. Ever.
    expect(seen).toHaveLength(1)
  })
})

/* ------------------------------------------------------------------ *
 *  2. Session-generation safety — create → cancel → create           *
 * ------------------------------------------------------------------ */

describe('session-generation safety', () => {
  it('cancel on session #1 cannot delete an asset uploaded to session #2 (single-image editor)', async () => {
    const { fn: deleter1, calls: c1 } = successfulDeleter()
    const { fn: deleter2, calls: c2 } = successfulDeleter()

    // Open editor for the first time. Empty original set (create flow).
    const s1 = new AssetSession({ deleter: deleter1 })
    // User uploads A.
    await s1.runUpload<string>(async () => A, u => [u])
    expect(s1.hasSessionUpload(A)).toBe(true)

    // User clicks Cancel. Session #1 is disposed; A is deleted.
    const c1Result = await s1.cancel()
    expect(c1Result.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    ])
    expect(s1.isDisposed).toBe(true)

    // Second Create is opened immediately. Fresh session with fresh
    // upload B — modelled by the useAssetSession hook via its
    // sessionKey change → new AssetSession instance.
    const s2 = new AssetSession({ deleter: deleter2 })
    await s2.runUpload<string>(async () => B, u => [u])

    // Session #2 must know only about B. Session #1 must not.
    expect(s2.hasSessionUpload(B)).toBe(true)
    expect(s2.hasSessionUpload(A)).toBe(false)
    expect(s1.hasSessionUpload(B)).toBe(false)

    // Save session #2. Final ref = [B]. Nothing from session #1 must
    // appear in session #2's cleanup.
    const c2Result = await s2.commit([B])
    expect(c2Result.deleted).toHaveLength(0)
    // Session #2's deleter must NEVER have been asked to remove A.
    expect(c2.flat()).not.toContain(
      `${IMAGE_BUCKET}/products/a-hero.webp`,
    )
    // And session #1's deleter must never have been asked to remove B.
    expect(c1.flat()).not.toContain(
      `${IMAGE_BUCKET}/products/b-hero.webp`,
    )
  })

  it('a late upload delivered to session #1 AFTER session #2 opens self-cleans without touching session #2', async () => {
    const { fn: deleter1, calls: c1 } = successfulDeleter()
    const { fn: deleter2, calls: c2 } = successfulDeleter()

    // Session #1: user picks a file, upload starts.
    const s1 = new AssetSession({ deleter: deleter1 })
    let releaseS1Upload: (v: string) => void = () => undefined
    const s1UploadPromise = s1.runUpload<string>(
      () =>
        new Promise<string>(resolve => {
          releaseS1Upload = resolve
        }),
      u => [u],
    )
    // While that upload is still in flight, user clicks Cancel.
    await s1.cancel()
    // Now session #2 starts (user opens Create again).
    const s2 = new AssetSession({ deleter: deleter2 })
    await s2.runUpload<string>(async () => B, u => [u])
    // Now session #1's stalled upload finally arrives.
    releaseS1Upload(A)
    const s1Result = await s1UploadPromise

    // The late upload returned `null` (session was disposed) —
    // AssetSession's runUpload signals late completion this way.
    expect(s1Result).toBeNull()
    // A was cleaned by session #1's own late-completion path…
    expect(c1.flat()).toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
    // …and session #2 never even saw A.
    expect(c2.flat()).not.toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
    expect(s2.hasSessionUpload(A)).toBe(false)

    // Finish session #2 normally: Save with B kept.
    const commit = await s2.commit([B])
    expect(commit.deleted).toHaveLength(0)
  })

  it('Products flow: hero A → cancel → immediately re-open create → hero B → Save keeps B, deletes only session#1 assets from their own session', async () => {
    // This is the same guarantee as above but framed against the
    // Products lifecycle: hero and gallery together, videoUrl on
    // the side. The invariant we care about here is that session #1's
    // cleanup CANNOT affect session #2 even when the two sessions
    // touch the same admin page.
    const { fn: deleter1 } = successfulDeleter()
    const { fn: deleter2, calls: c2 } = successfulDeleter()

    // Session #1 — new product create, uploaded A into gallery.
    const s1 = new AssetSession({ deleter: deleter1 })
    await s1.runUpload<string>(async () => A, u => [u])
    // Cancel: session #1 cleans up A.
    await s1.cancel()

    // Session #2 — new product create again, uploads B then C.
    const s2 = new AssetSession({ deleter: deleter2 })
    await s2.runUpload<string>(async () => B, u => [u])
    await s2.runUpload<string>(async () => C, u => [u])
    // Save with C as the final gallery[0] hero + only ref.
    const commit = await s2.commit([C])
    // B was uploaded and not referenced → cleaned by session #2 alone.
    expect(commit.deleted.map(d => d.canonical)).toEqual([
      `${IMAGE_BUCKET}/products/b-hero.webp`,
    ])
    // C survives.
    expect(commit.deleted.every(d => d.canonical !== `${IMAGE_BUCKET}/products/c-hero.webp`)).toBe(true)
    // Session #2's deleter was NEVER asked to remove A.
    expect(c2.flat()).not.toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
  })

  it('reset() bumps the generation — a late upload from before reset self-cleans, and session-uploads registered after reset are safe', async () => {
    const { fn: deleter, calls } = successfulDeleter()
    // A single session that gets reset — models the useAssetSession
    // path where sessionKey changes force re-use of the same in-page
    // session state slot.
    const s = new AssetSession({ deleter })
    let releaseOld: (v: string) => void = () => undefined
    const oldUpload = s.runUpload<string>(
      () =>
        new Promise<string>(resolve => {
          releaseOld = resolve
        }),
      u => [u],
    )
    s.reset([]) // New editor session begins.
    // A new upload registers into the NEW generation.
    await s.runUpload<string>(async () => B, u => [u])
    // The old upload finally arrives — must self-clean.
    releaseOld(A)
    const oldResult = await oldUpload
    expect(oldResult).toBeNull()
    // The reset() deleter call cleans A; B remains a session-temp.
    expect(calls.flat()).toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
    expect(s.hasSessionUpload(B)).toBe(true)
    expect(s.hasSessionUpload(A)).toBe(false)
  })
})

/* ------------------------------------------------------------------ *
 *  Cross-check: commit failure does not corrupt session state for the *
 *  caller's fallback path.                                            *
 * ------------------------------------------------------------------ */

describe('commit + external-error resilience', () => {
  it('caller-injected deleter throwing sync produces a well-formed AssetDeletionResult (no throw escapes)', async () => {
    const throwing = vi.fn(async () => {
      throw new Error('deleter blew up')
    })
    const session = new AssetSession({
      originalUrls: [A],
      deleter: throwing as unknown as (
        identities: StorageIdentity[],
      ) => Promise<AssetDeletionResult>,
    })
    const result = await session.commit([])
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].error).toContain('deleter blew up')
    // Post-condition: session is disposed, further calls are no-ops.
    expect(session.isDisposed).toBe(true)
  })
})
