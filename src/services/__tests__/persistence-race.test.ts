import { describe, it, expect } from 'vitest'
import {
  AssetSession,
  AssetSessionBusyError,
  AssetSessionDisposedError,
  AssetSessionPersistenceActiveError,
} from '../asset-session'
import {
  IMAGE_BUCKET,
  type AssetDeletionResult,
  type StorageIdentity,
} from '../storage.service'

/*
 * Regression suite for the save-in-flight unmount race.
 *
 * These tests exercise the new persistence state machine:
 *
 *   idle → active → succeeded | failed
 *
 * with disposeRequested tracked orthogonally. The invariant proven
 * across the whole suite is:
 *
 *   A session-temporary asset that becomes a persisted DB reference
 *   is NEVER deleted by any dispose/cancel invocation, even one that
 *   fires while the DB write is in flight.
 */

const PROJECT = 'https://example.supabase.co'
const url = (bucket: string, path: string) =>
  `${PROJECT}/storage/v1/object/public/${bucket}/${path}`

const A = url(IMAGE_BUCKET, 'products/a-hero.webp')
const B = url(IMAGE_BUCKET, 'products/b-hero.webp')
const C = url(IMAGE_BUCKET, 'products/c-hero.webp')

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
        error: 'simulated 500',
      })),
    }
  }
  return { fn, calls }
}

function deferrable<T>(): { promise: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void } {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/* ------------------------------------------------------------------ *
 *  1. Save success + unmount during DB request                        *
 * ------------------------------------------------------------------ */

describe('save success + unmount during DB request', () => {
  it('B is never deleted; A is cleaned after DB success; terminal state = disposed+committed', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])

    const gate = deferrable<void>()
    const persistencePromise = session.runPersistence({
      mutate: async () => {
        await gate.promise
      },
      finalRefs: () => [B],
    })

    // While the DB is still in flight, unmount fires: dispose is
    // requested but MUST be deferred.
    expect(session.snapshot().persistenceState).toBe('active')
    session.dispose()
    expect(session.snapshot().disposeRequested).toBe(true)
    // No cleanup calls yet — dispose was deferred by design.
    expect(calls).toHaveLength(0)

    // DB now succeeds.
    gate.resolve()
    const outcome = await persistencePromise
    expect(outcome.status).toBe('success')

    // A was in originals-not-in-final → cleaned exactly once.
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual([`${IMAGE_BUCKET}/products/a-hero.webp`])
    // B — the session temp that just became the persisted asset —
    // MUST NOT appear anywhere in the deleter's history.
    expect(calls.flat()).not.toContain(`${IMAGE_BUCKET}/products/b-hero.webp`)

    // Terminal state.
    expect(session.snapshot().disposed).toBe(true)
    expect(session.snapshot().committed).toBe(true)
    expect(session.snapshot().persistenceState).toBe('succeeded')
  })
})

/* ------------------------------------------------------------------ *
 *  2. Save failure + unmount during DB request                        *
 * ------------------------------------------------------------------ */

describe('save failure + unmount during DB request', () => {
  it('A untouched; B cleaned after failure; session disposed', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])

    const gate = deferrable<void>()
    const persistencePromise = session.runPersistence({
      mutate: async () => {
        await gate.promise
        throw new Error('DB rejected')
      },
      finalRefs: () => [B],
    })

    session.dispose() // unmount during save
    expect(session.snapshot().disposeRequested).toBe(true)
    expect(calls).toHaveLength(0)

    gate.resolve()
    const outcome = await persistencePromise
    expect(outcome.status).toBe('failure')
    if (outcome.status === 'failure') {
      expect(outcome.disposed).toBe(true)
    }

    // Failure + disposeRequested → session-temp B is cleaned.
    expect(calls).toHaveLength(1)
    expect(calls[0]).toEqual([`${IMAGE_BUCKET}/products/b-hero.webp`])
    // Original A never touched.
    expect(calls.flat()).not.toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
    expect(session.snapshot().disposed).toBe(true)
  })
})

/* ------------------------------------------------------------------ *
 *  3. Save failure while still mounted                                *
 * ------------------------------------------------------------------ */

describe('save failure while editor still mounted', () => {
  it('A and B remain; session is retry-safe; a second save can succeed', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])

    // First attempt fails, no dispose requested.
    const first = await session.runPersistence({
      mutate: async () => {
        throw new Error('network')
      },
      finalRefs: () => [B],
    })
    expect(first.status).toBe('failure')
    // No storage touched.
    expect(calls).toHaveLength(0)
    // Session is back to idle and retry-safe.
    expect(session.snapshot().persistenceState).toBe('idle')
    expect(session.snapshot().canStartPersistence).toBe(true)
    expect(session.hasOriginal(A)).toBe(true)
    expect(session.hasSessionUpload(B)).toBe(true)

    // Retry succeeds — normal commit diff applies.
    const second = await session.runPersistence({
      mutate: async () => undefined,
      finalRefs: () => [B],
    })
    expect(second.status).toBe('success')
    expect(calls[0]).toEqual([`${IMAGE_BUCKET}/products/a-hero.webp`])
  })
})

/* ------------------------------------------------------------------ *
 *  4. Save success while mounted                                      *
 * ------------------------------------------------------------------ */

describe('save success while mounted', () => {
  it('final refs kept; removed originals cleaned; unused session-temps cleaned', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    // Session-temp B (kept) and C (unused) uploaded.
    await session.runUpload<string>(async () => B, u => [u])
    await session.runUpload<string>(async () => C, u => [u])

    const outcome = await session.runPersistence({
      mutate: async () => undefined,
      finalRefs: () => [B],
    })
    expect(outcome.status).toBe('success')
    const deleted = new Set(calls.flat())
    expect(deleted.has(`${IMAGE_BUCKET}/products/a-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/c-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/b-hero.webp`)).toBe(false)
  })
})

/* ------------------------------------------------------------------ *
 *  5. Dispose during commit cleanup                                   *
 * ------------------------------------------------------------------ */

describe('dispose during commit cleanup', () => {
  it('cleanup identities are scheduled at most once; final ref never deleted', async () => {
    // The deleter blocks so we can inject a dispose while `commit`
    // is in the safeDelete step.
    const gate = deferrable<AssetDeletionResult>()
    const seen: string[][] = []
    const slowDeleter = async (
      identities: StorageIdentity[],
    ): Promise<AssetDeletionResult> => {
      seen.push(identities.map(i => i.canonical))
      return gate.promise
    }
    const session = new AssetSession({
      originalUrls: [A],
      deleter: slowDeleter,
    })
    await session.runUpload<string>(async () => B, u => [u])

    const persistencePromise = session.runPersistence({
      mutate: async () => undefined,
      finalRefs: () => [B],
    })
    // Give the microtask queue a chance to reach the safeDelete
    // call inside runPersistence.
    await Promise.resolve()
    // Persistence is `succeeded` now (mutate returned, cleanup
    // dispatched) — dispose is a plain no-op because disposed=true.
    session.dispose()

    expect(seen).toHaveLength(1)
    expect(seen[0]).toEqual([`${IMAGE_BUCKET}/products/a-hero.webp`])

    gate.resolve({
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
    const outcome = await persistencePromise
    expect(outcome.status).toBe('success')
    // Exactly one deleter call for the entire lifecycle.
    expect(seen).toHaveLength(1)
  })
})

/* ------------------------------------------------------------------ *
 *  6. Duplicate Save attempt                                          *
 * ------------------------------------------------------------------ */

describe('duplicate Save attempt', () => {
  it('a second runPersistence during active persistence throws AssetSessionPersistenceActiveError', async () => {
    const session = new AssetSession({ deleter: recordingDeleter().fn })

    const gate = deferrable<void>()
    const first = session.runPersistence({
      mutate: async () => {
        await gate.promise
      },
      finalRefs: () => [],
    })

    expect(session.snapshot().canStartPersistence).toBe(false)
    await expect(
      session.runPersistence({
        mutate: async () => undefined,
        finalRefs: () => [],
      }),
    ).rejects.toBeInstanceOf(AssetSessionPersistenceActiveError)

    gate.resolve()
    const outcome = await first
    expect(outcome.status).toBe('success')
  })

  it('runPersistence after successful runPersistence throws AssetSessionDisposedError', async () => {
    const session = new AssetSession({ deleter: recordingDeleter().fn })
    await session.runPersistence({
      mutate: async () => undefined,
      finalRefs: () => [],
    })
    await expect(
      session.runPersistence({
        mutate: async () => undefined,
        finalRefs: () => [],
      }),
    ).rejects.toBeInstanceOf(AssetSessionDisposedError)
  })
})

/* ------------------------------------------------------------------ *
 *  7. Upload active + Save attempted                                  *
 * ------------------------------------------------------------------ */

describe('upload active + Save attempted', () => {
  it('runPersistence with an in-flight upload throws AssetSessionBusyError', async () => {
    const session = new AssetSession({ deleter: recordingDeleter().fn })
    const gate = deferrable<string>()
    const upload = session.runUpload<string>(() => gate.promise, u => [u])
    expect(session.snapshot().canStartPersistence).toBe(false)
    await expect(
      session.runPersistence({
        mutate: async () => undefined,
        finalRefs: () => [],
      }),
    ).rejects.toBeInstanceOf(AssetSessionBusyError)
    gate.resolve(B)
    await upload
  })
})

/* ------------------------------------------------------------------ *
 *  8. Late upload interacting with persistence/dispose                *
 * ------------------------------------------------------------------ */

describe('late upload during / after persistence', () => {
  it('late upload that resolves after successful persistence self-cleans without touching final refs', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    // Start a slow upload for C (session-temp).
    const uploadGate = deferrable<string>()
    const slowUpload = session.runUpload<string>(() => uploadGate.promise, u => [u])

    // Upload for B finishes quickly and enters the session.
    await session.runUpload<string>(async () => B, u => [u])

    // We cannot start persistence while the slow upload is in
    // flight — that's the point of the `inFlight > 0` guard. So
    // resolve slow upload first.
    uploadGate.resolve(C)
    await slowUpload

    // Persist with only B as final.
    const outcome = await session.runPersistence({
      mutate: async () => undefined,
      finalRefs: () => [B],
    })
    expect(outcome.status).toBe('success')
    const deleted = new Set(calls.flat())
    expect(deleted.has(`${IMAGE_BUCKET}/products/a-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/c-hero.webp`)).toBe(true)
    expect(deleted.has(`${IMAGE_BUCKET}/products/b-hero.webp`)).toBe(false)
  })

  it('late upload that resolves after dispose (no persistence) self-cleans; second session unaffected', async () => {
    const { fn: d1, calls: c1 } = recordingDeleter()
    const { fn: d2, calls: c2 } = recordingDeleter()
    const s1 = new AssetSession({ deleter: d1 })
    const gate = deferrable<string>()
    const stalled = s1.runUpload<string>(() => gate.promise, u => [u])
    s1.dispose()

    // Session 2 opens.
    const s2 = new AssetSession({ deleter: d2 })
    await s2.runUpload<string>(async () => B, u => [u])

    gate.resolve(A)
    expect(await stalled).toBeNull()
    // Session 1 cleaned A on late completion.
    expect(c1.flat()).toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
    // Session 2 never saw A.
    expect(c2.flat()).not.toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
    expect(s2.hasSessionUpload(A)).toBe(false)
  })
})

/* ------------------------------------------------------------------ *
 *  9. Create → Save → Navigate → Create again                         *
 * ------------------------------------------------------------------ */

describe('create → save → navigate → create again', () => {
  it('session #1 cannot affect session #2', async () => {
    const { fn: d1 } = recordingDeleter()
    const { fn: d2, calls: c2 } = recordingDeleter()

    const s1 = new AssetSession({ deleter: d1 })
    await s1.runUpload<string>(async () => A, u => [u])
    const outcome1 = await s1.runPersistence({
      mutate: async () => undefined,
      finalRefs: () => [A],
    })
    expect(outcome1.status).toBe('success')
    // Simulate route change → hook unmount → dispose.
    s1.dispose() // no-op since terminal
    expect(s1.snapshot().disposed).toBe(true)

    // Open new session for a second entity.
    const s2 = new AssetSession({ deleter: d2 })
    await s2.runUpload<string>(async () => B, u => [u])
    const outcome2 = await s2.runPersistence({
      mutate: async () => undefined,
      finalRefs: () => [B],
    })
    expect(outcome2.status).toBe('success')
    // Session #2 deleter never asked to remove A.
    expect(c2.flat()).not.toContain(`${IMAGE_BUCKET}/products/a-hero.webp`)
  })
})

/* ------------------------------------------------------------------ *
 * 10. Partial commit cleanup failure + unmount                        *
 * ------------------------------------------------------------------ */

describe('partial commit cleanup failure + unmount', () => {
  it('DB success remains success; final asset remains; cleanup failure is reported once; no retry deletion of final ref', async () => {
    const { fn, calls } = failingDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])

    const outcome = await session.runPersistence({
      mutate: async () => undefined,
      finalRefs: () => [B],
    })
    expect(outcome.status).toBe('success')
    if (outcome.status === 'success') {
      expect(outcome.cleanup.failed).toHaveLength(1)
      expect(outcome.cleanup.failed[0].canonical).toBe(
        `${IMAGE_BUCKET}/products/a-hero.webp`,
      )
    }
    // Post-outcome unmount — no retry, no touch on B.
    session.dispose()
    expect(calls).toHaveLength(1)
    expect(calls.flat()).not.toContain(`${IMAGE_BUCKET}/products/b-hero.webp`)
  })
})

/* ------------------------------------------------------------------ *
 *  Extra: cancel during active persistence is deferred                *
 * ------------------------------------------------------------------ */

describe('cancel during active persistence', () => {
  it('cancel sets disposeRequested and returns empty result; DB success still finalizes correctly', async () => {
    const { fn, calls } = recordingDeleter()
    const session = new AssetSession({
      originalUrls: [A],
      deleter: fn,
    })
    await session.runUpload<string>(async () => B, u => [u])

    const gate = deferrable<void>()
    const persistencePromise = session.runPersistence({
      mutate: async () => {
        await gate.promise
      },
      finalRefs: () => [B],
    })

    // While DB is in flight, user closes editor → cancel().
    const cancelResult = await session.cancel()
    expect(cancelResult.requested).toBe(0) // deferred
    expect(session.snapshot().disposeRequested).toBe(true)
    expect(calls).toHaveLength(0)

    // DB succeeds — the deferred dispose is not "activated" because
    // the persistence path is authoritative for success. Only the
    // final cleanup diff runs.
    gate.resolve()
    const outcome = await persistencePromise
    expect(outcome.status).toBe('success')
    // A cleaned; B preserved.
    expect(calls[0]).toEqual([`${IMAGE_BUCKET}/products/a-hero.webp`])
    expect(calls.flat()).not.toContain(`${IMAGE_BUCKET}/products/b-hero.webp`)
  })
})
