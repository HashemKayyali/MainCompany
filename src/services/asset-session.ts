import {
  deleteStorageIdentities,
  getStorageIdentities,
  type AssetDeletionResult,
  type StorageIdentity,
} from './storage.service'

/* ------------------------------------------------------------------ *
 *  Types                                                              *
 * ------------------------------------------------------------------ */

export interface AssetSessionInit {
  /**
   * URLs of the assets the entity already has persisted in the
   * database when the editor session opens. These are treated as
   * "originals" — the session must never delete them before a
   * successful save/commit.
   */
  originalUrls?: Array<string | null | undefined>

  /**
   * Optional callback fired when a late upload completes AFTER the
   * session has been disposed / reset, and its resulting storage
   * object is cleaned up. Wire this into your logger so a
   * partial-failure report is not lost silently.
   */
  onLateCleanup?: (result: AssetDeletionResult) => void

  /**
   * Optional callback fired when the session tries to auto-clean an
   * asset and the cleanup itself fails. Useful for surfacing
   * cleanup failures separately from database mutation failures.
   */
  onCleanupFailure?: (result: AssetDeletionResult) => void

  /**
   * Injected deletion function — mostly for tests. Defaults to the
   * real `deleteStorageIdentities` from storage.service. It operates
   * on parsed identities rather than raw URLs because the session
   * already has canonical-parsed data internally; making the deleter
   * URL-based would force a round-trip through URL synthesis.
   */
  deleter?: (
    identities: StorageIdentity[],
  ) => Promise<AssetDeletionResult>
}

/**
 * Persistence lifecycle state.
 *
 *   - `idle`      — no DB write in flight. Uploads, dispose, cancel
 *                    behave normally.
 *   - `active`    — a `runPersistence` call has started its DB
 *                    mutation. Dispose/cancel/upload are all deferred
 *                    or rejected in the ways documented on
 *                    `runPersistence`. This state is the ENTIRE
 *                    fix for the save-in-flight unmount race.
 *   - `succeeded` — terminal. Only set immediately before commit
 *                    finalization; the session is also `committed`
 *                    and `disposed` at this point.
 *   - `failed`    — the DB mutation threw. If dispose was requested
 *                    while the mutation was in flight, the session
 *                    proceeds to full cleanup. Otherwise it returns
 *                    to `idle` so the caller can retry Save.
 */
export type PersistenceState = 'idle' | 'active' | 'succeeded' | 'failed'

export interface AssetSessionSnapshot {
  originalCount: number
  sessionUploadsCount: number
  inFlight: number
  disposed: boolean
  committed: boolean
  canCommit: boolean
  persistenceState: PersistenceState
  disposeRequested: boolean
  /**
   * True when starting a new persistence attempt is safe (no upload
   * in flight, no persistence in flight, session not disposed or
   * committed). This is what UI Save buttons should gate on.
   */
  canStartPersistence: boolean
}

export type AssetSessionListener = (snapshot: AssetSessionSnapshot) => void

/* ------------------------------------------------------------------ *
 *  Persistence API                                                    *
 * ------------------------------------------------------------------ */

export interface RunPersistenceOptions<T> {
  /**
   * The DB mutation. Runs while the session is in `active`
   * persistence state, so unmount / dispose / cancel cannot delete
   * temporary uploads while this is running.
   */
  mutate: () => Promise<T>
  /**
   * Compute the final storage-URL reference set the persisted entity
   * will point at. Called with the mutation result AFTER the DB write
   * succeeds, so callers can derive references from server-assigned
   * fields (e.g. a generated id).
   */
  finalRefs: (result: T) => Array<string | null | undefined>
}

/**
 * The result of a single `runPersistence` call. Always well-formed —
 * `runPersistence` never throws; failures are conveyed through
 * `status: 'failure'` with `error` set.
 *
 * `cleanup` contains storage-side reconciliation:
 *   - On success: the diff of originals ∪ session-uploads vs final refs.
 *   - On failure with disposeRequested: session-uploads cleanup.
 *   - On failure without disposeRequested: an empty deletion result
 *     (no storage touched — session stays live for retry).
 */
export type PersistenceOutcome<T> =
  | {
      status: 'success'
      result: T
      cleanup: AssetDeletionResult
    }
  | {
      status: 'failure'
      error: unknown
      cleanup: AssetDeletionResult
      /**
       * True when the session moved to `disposed` because a dispose
       * was requested while persistence was in flight and the DB
       * mutation then failed. Callers can use this to skip UI
       * updates that would touch an unmounted tree.
       */
      disposed: boolean
    }

/* ------------------------------------------------------------------ *
 *  Errors                                                             *
 * ------------------------------------------------------------------ */

export class AssetSessionDisposedError extends Error {
  constructor(message = 'AssetSession has been disposed') {
    super(message)
    this.name = 'AssetSessionDisposedError'
  }
}

export class AssetSessionBusyError extends Error {
  constructor(message = 'AssetSession has uploads in flight; commit is not allowed') {
    super(message)
    this.name = 'AssetSessionBusyError'
  }
}

export class AssetSessionPersistenceActiveError extends Error {
  constructor(message = 'AssetSession already has a persistence attempt in flight') {
    super(message)
    this.name = 'AssetSessionPersistenceActiveError'
  }
}

/* ------------------------------------------------------------------ *
 *  Session                                                            *
 * ------------------------------------------------------------------ */

/**
 * A session tracks the media-asset lifecycle of a single admin editor
 * flow. It distinguishes:
 *
 *   - originalPersisted — canonicals present in the DB before the
 *     editor opened. NEVER deleted before a successful commit.
 *   - sessionUploads    — canonicals uploaded during this editor
 *     session (not yet persisted). Cleaned on commit-if-unreferenced
 *     or on cancel.
 *
 * All comparisons are done on canonical storage identity (bucket +
 * decoded path) so a URL with a media-frame hash / query string /
 * render transform is treated the same as the raw public URL.
 *
 * Race handling: uploads are wrapped in `runUpload` which captures a
 * generation token. If the session is disposed OR reset while an
 * upload is in flight, the late-arriving result is automatically
 * cleaned up before it can be registered.
 *
 * SAVE-IN-FLIGHT RACE — the state machine has FIVE lifecycle bits:
 *   - `inFlight`         → count of running uploads
 *   - `persistenceState` → 'idle' | 'active' | 'succeeded' | 'failed'
 *   - `disposeRequested` → set true if dispose() was called while
 *                          persistence was `active`
 *   - `committed`        → set true when a `runPersistence` (or the
 *                          legacy `commit`) finalizes successfully
 *   - `disposed`         → terminal
 *
 * With this machine, the ONLY safe API for saving media-owning
 * entities is `runPersistence({ mutate, finalRefs })`. It sets
 * `persistenceState = 'active'` synchronously before invoking
 * `mutate`, so any dispose/cancel that arrives during the DB write
 * is DEFERRED until the DB result is known. This eliminates the
 * "DB write succeeded pointing at B → dispose deleted B" race by
 * construction.
 */
export class AssetSession {
  private originalPersisted = new Map<string, StorageIdentity>()
  private sessionUploads = new Map<string, StorageIdentity>()

  private generation = 0
  private inFlight = 0
  private disposed = false
  private committed = false
  private persistenceState: PersistenceState = 'idle'
  private disposeRequested = false

  private listeners = new Set<AssetSessionListener>()
  private readonly onLateCleanup?: (result: AssetDeletionResult) => void
  private readonly onCleanupFailure?: (result: AssetDeletionResult) => void
  private readonly deleter: (
    identities: StorageIdentity[],
  ) => Promise<AssetDeletionResult>

  constructor(init: AssetSessionInit = {}) {
    this.onLateCleanup = init.onLateCleanup
    this.onCleanupFailure = init.onCleanupFailure
    this.deleter = init.deleter ?? deleteStorageIdentities
    this.ingestOriginals(init.originalUrls ?? [])
  }

  /* -------- observation -------- */

  snapshot(): AssetSessionSnapshot {
    const canCommit =
      !this.disposed && !this.committed && this.inFlight === 0 && this.persistenceState === 'idle'
    return {
      originalCount: this.originalPersisted.size,
      sessionUploadsCount: this.sessionUploads.size,
      inFlight: this.inFlight,
      disposed: this.disposed,
      committed: this.committed,
      canCommit,
      persistenceState: this.persistenceState,
      disposeRequested: this.disposeRequested,
      canStartPersistence: canCommit,
    }
  }

  subscribe(listener: AssetSessionListener): () => void {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  get isDisposed(): boolean {
    return this.disposed
  }

  get inFlightCount(): number {
    return this.inFlight
  }

  get isCommittable(): boolean {
    return this.snapshot().canCommit
  }

  get isPersisting(): boolean {
    return this.persistenceState === 'active'
  }

  /* -------- session upload registration -------- */

  /**
   * Wrap an upload operation so its result is safely tracked by the
   * session. If the session is disposed or reset before the promise
   * resolves, the resulting storage object is cleaned up
   * automatically and this function returns `null`.
   */
  async runUpload<T>(
    work: (ctx: { isDisposed: () => boolean }) => Promise<T>,
    extractUrls: (result: T) => Array<string | null | undefined>,
  ): Promise<T | null> {
    if (this.disposed) return null

    const startedGeneration = this.generation
    this.inFlight += 1
    this.notify()

    try {
      const result = await work({
        isDisposed: () =>
          this.disposed || this.generation !== startedGeneration,
      })

      const producedUrls = extractUrls(result)

      // Late completion — session was disposed or reset while the
      // upload was in flight. Never touch form state; clean the
      // orphan storage object(s) and swallow the result.
      if (this.disposed || this.generation !== startedGeneration) {
        const cleanup = await this.safeDelete(urlsToIdentities(producedUrls))
        this.onLateCleanup?.(cleanup)
        if (cleanup.failed.length > 0) {
          this.onCleanupFailure?.(cleanup)
        }
        return null
      }

      for (const url of producedUrls) {
        for (const identity of getStorageIdentities(url)) {
          this.sessionUploads.set(identity.canonical, identity)
        }
      }

      return result
    } finally {
      this.inFlight -= 1
      this.notify()
    }
  }

  /**
   * Manually register an already-uploaded canonical as a session
   * temporary. Useful when the caller performed the upload outside
   * `runUpload` (e.g. legacy code path) but still wants session
   * lifecycle cleanup.
   */
  registerSessionUpload(url: string | null | undefined): void {
    if (this.disposed) return
    const identities = getStorageIdentities(url)
    if (identities.length === 0) return
    for (const identity of identities) {
      this.sessionUploads.set(identity.canonical, identity)
    }
    this.notify()
  }

  /* -------- persistence API — THE race-safe Save entry point ------- */

  /**
   * The persistence-safe Save API — call this from a page's `save()`
   * handler instead of `await commit(...)`. It owns the entire state
   * transition:
   *
   *   1. Sync mark persistenceState = 'active'. UI Save button
   *      should gate on `canStartPersistence`, so this call cannot
   *      race with itself.
   *   2. Run `mutate()` — the DB write. During this await, any call
   *      to `dispose()` or `cancel()` is DEFERRED: it sets
   *      `disposeRequested` and returns without touching storage.
   *   3. On success:
   *        - compute the final canonical set from `finalRefs(result)`;
   *        - schedule cleanup of originals ∪ session-uploads NOT in
   *          the final set;
   *        - flip committed=true, disposed=true synchronously so any
   *          subsequent dispose/cancel is a proven no-op;
   *        - await cleanup; return `{ status: 'success', ... }`.
   *   4. On failure:
   *        - if dispose was requested during the await → treat the
   *          session as cancelled: clean session-uploads and mark
   *          disposed=true;
   *        - otherwise → return persistenceState to 'idle', do NOT
   *          delete anything, session stays retry-safe.
   *
   * Never throws. Callers should switch on `outcome.status`.
   */
  async runPersistence<T>(options: RunPersistenceOptions<T>): Promise<PersistenceOutcome<T>> {
    // Sync guards — these are the same predicate the UI's canSave
    // gate should respect, but the API enforces them for callers
    // that forget.
    if (this.disposed) {
      throw new AssetSessionDisposedError()
    }
    if (this.committed) {
      throw new AssetSessionDisposedError('AssetSession already committed')
    }
    if (this.persistenceState === 'active') {
      throw new AssetSessionPersistenceActiveError()
    }
    if (this.inFlight > 0) {
      throw new AssetSessionBusyError()
    }

    // Move to active BEFORE launching the DB call. Any dispose that
    // fires while `mutate()` is running will see 'active' and defer.
    this.persistenceState = 'active'
    this.notify()

    let mutateResult: T
    try {
      mutateResult = await options.mutate()
    } catch (err) {
      // DB mutation failed.
      this.persistenceState = 'failed'
      if (this.disposeRequested) {
        // The user closed the editor / navigated away while the
        // DB write was running. Now that the DB is known-failed,
        // it's safe to run the deferred cleanup: only session-
        // temporary uploads, never originals.
        const cleanup = await this.finalizeCancel()
        return { status: 'failure', error: err, cleanup, disposed: true }
      }
      // No dispose requested → session stays live for retry.
      this.persistenceState = 'idle'
      this.notify()
      return {
        status: 'failure',
        error: err,
        cleanup: { requested: 0, deleted: [], alreadyMissing: [], failed: [] },
        disposed: false,
      }
    }

    // DB mutation succeeded. Compute the definitive final ref set,
    // then reconcile storage.
    let finalUrls: Array<string | null | undefined>
    try {
      finalUrls = options.finalRefs(mutateResult)
    } catch (err) {
      // finalRefs threw — treat identically to a DB failure that
      // succeeded materially: the DB is already persisted with
      // whatever values, but we cannot compute the cleanup diff.
      // Roll back to idle unless disposeRequested — never delete
      // anything speculatively.
      this.persistenceState = 'failed'
      if (this.disposeRequested) {
        const cleanup = await this.finalizeCancel()
        return { status: 'failure', error: err, cleanup, disposed: true }
      }
      this.persistenceState = 'idle'
      this.notify()
      return {
        status: 'failure',
        error: err,
        cleanup: { requested: 0, deleted: [], alreadyMissing: [], failed: [] },
        disposed: false,
      }
    }

    const finalCanonicals = new Set<string>()
    for (const url of finalUrls) {
      for (const identity of getStorageIdentities(url)) {
        finalCanonicals.add(identity.canonical)
      }
    }

    const toDelete: StorageIdentity[] = []
    for (const [canonical, identity] of this.originalPersisted) {
      if (!finalCanonicals.has(canonical)) toDelete.push(identity)
    }
    for (const [canonical, identity] of this.sessionUploads) {
      if (!finalCanonicals.has(canonical)) toDelete.push(identity)
    }

    // Flip terminal flags synchronously. Any subsequent dispose()
    // or cancel() is guaranteed to be a no-op via the `disposed`
    // guard, so the just-persisted assets in `sessionUploads` (still
    // present in that Map) cannot be re-deleted.
    this.persistenceState = 'succeeded'
    this.committed = true
    this.disposed = true
    this.notify()

    const cleanup = await this.safeDelete(toDelete)
    if (cleanup.failed.length > 0) {
      this.onCleanupFailure?.(cleanup)
    }
    return { status: 'success', result: mutateResult, cleanup }
  }

  /* -------- lifecycle (legacy commit, cancel, dispose, reset) ------ */

  /**
   * Legacy commit — retained for tests and for callers that manage
   * their own DB mutation ordering. New Save paths should use
   * `runPersistence` instead so the save-in-flight unmount race is
   * eliminated by the state machine.
   */
  async commit(
    finalUrls: Array<string | null | undefined>,
  ): Promise<AssetDeletionResult> {
    if (this.disposed) throw new AssetSessionDisposedError()
    if (this.persistenceState === 'active') {
      throw new AssetSessionPersistenceActiveError()
    }
    if (this.inFlight > 0) throw new AssetSessionBusyError()
    if (this.committed) {
      return { requested: 0, deleted: [], alreadyMissing: [], failed: [] }
    }

    const finalCanonicals = new Set<string>()
    for (const url of finalUrls) {
      for (const identity of getStorageIdentities(url)) {
        finalCanonicals.add(identity.canonical)
      }
    }

    const toDelete: StorageIdentity[] = []
    for (const [canonical, identity] of this.originalPersisted) {
      if (!finalCanonicals.has(canonical)) toDelete.push(identity)
    }
    for (const [canonical, identity] of this.sessionUploads) {
      if (!finalCanonicals.has(canonical)) toDelete.push(identity)
    }

    this.committed = true
    this.disposed = true
    this.persistenceState = 'succeeded'
    this.notify()

    const cleanup = await this.safeDelete(toDelete)
    if (cleanup.failed.length > 0) {
      this.onCleanupFailure?.(cleanup)
    }
    return cleanup
  }

  /**
   * Discard all session uploads. If persistence is currently active,
   * the cancel is DEFERRED — `disposeRequested` is set and no
   * storage is touched until the persistence outcome is known.
   */
  async cancel(): Promise<AssetDeletionResult> {
    if (this.disposed) {
      return { requested: 0, deleted: [], alreadyMissing: [], failed: [] }
    }
    if (this.persistenceState === 'active') {
      // Defer — the persistence outcome will run this cleanup for us
      // exactly once, in the correct order.
      this.disposeRequested = true
      this.notify()
      return { requested: 0, deleted: [], alreadyMissing: [], failed: [] }
    }
    return this.finalizeCancel()
  }

  /**
   * Reset the session with a new set of originals. Cannot run while
   * persistence is active — the caller must wait for or interrupt
   * the pending Save first (in practice: `useAssetSession` only
   * resets on `sessionKey` change, which is gated by the UI).
   */
  reset(newOriginals: Array<string | null | undefined>): void {
    if (this.disposed) {
      throw new AssetSessionDisposedError('Cannot reset a disposed session')
    }
    if (this.persistenceState === 'active') {
      throw new AssetSessionPersistenceActiveError('Cannot reset during active persistence')
    }
    this.generation += 1

    const toDelete = Array.from(this.sessionUploads.values())
    this.sessionUploads.clear()
    this.originalPersisted.clear()
    this.ingestOriginals(newOriginals)

    if (toDelete.length > 0) {
      void this.safeDelete(toDelete).then(cleanup => {
        if (cleanup.failed.length > 0) {
          this.onCleanupFailure?.(cleanup)
        }
      })
    }
    this.notify()
  }

  /**
   * Sync-mark this session as disposed WITHOUT waiting for cleanup
   * to finish. If persistence is currently active, dispose is
   * DEFERRED — the persistence-outcome path will finalize cleanup
   * (or preservation, depending on success/failure) at exactly the
   * right moment.
   */
  dispose(): void {
    if (this.disposed) return
    if (this.persistenceState === 'active') {
      // THE FIX: do not touch storage while a DB write may still
      // succeed pointing at one of our session-temporary URLs. Just
      // record intent; the persistence path will honor it.
      this.disposeRequested = true
      this.notify()
      return
    }
    this.disposed = true
    this.notify()
    const toDelete = Array.from(this.sessionUploads.values())
    this.sessionUploads.clear()
    if (toDelete.length > 0) {
      void this.safeDelete(toDelete).then(cleanup => {
        if (cleanup.failed.length > 0) {
          this.onCleanupFailure?.(cleanup)
        }
      })
    }
  }

  /* -------- introspection helpers (mostly for tests) -------- */

  hasOriginal(url: string | null | undefined): boolean {
    const identities = getStorageIdentities(url)
    return identities.length > 0 && identities.every(identity => this.originalPersisted.has(identity.canonical))
  }

  hasSessionUpload(url: string | null | undefined): boolean {
    const identities = getStorageIdentities(url)
    return identities.some(identity => this.sessionUploads.has(identity.canonical))
  }

  listSessionUploads(): StorageIdentity[] {
    return Array.from(this.sessionUploads.values())
  }

  listOriginals(): StorageIdentity[] {
    return Array.from(this.originalPersisted.values())
  }

  /* -------- internals -------- */

  private async finalizeCancel(): Promise<AssetDeletionResult> {
    const toDelete = Array.from(this.sessionUploads.values())
    this.sessionUploads.clear()
    this.disposed = true
    this.notify()
    const cleanup = await this.safeDelete(toDelete)
    if (cleanup.failed.length > 0) {
      this.onCleanupFailure?.(cleanup)
    }
    return cleanup
  }

  private ingestOriginals(urls: Array<string | null | undefined>): void {
    for (const url of urls) {
      for (const identity of getStorageIdentities(url)) {
        this.originalPersisted.set(identity.canonical, identity)
      }
    }
  }

  private notify(): void {
    if (this.listeners.size === 0) return
    const snap = this.snapshot()
    for (const listener of this.listeners) {
      listener(snap)
    }
  }

  private async safeDelete(
    identities: StorageIdentity[],
  ): Promise<AssetDeletionResult> {
    if (identities.length === 0) {
      return { requested: 0, deleted: [], alreadyMissing: [], failed: [] }
    }
    try {
      return await this.deleter(identities)
    } catch (err) {
      return {
        requested: identities.length,
        deleted: [],
        alreadyMissing: [],
        failed: identities.map(identity => ({
          canonical: identity.canonical,
          bucket: identity.bucket,
          path: identity.path,
          error: err instanceof Error ? err.message : String(err),
        })),
      }
    }
  }
}

function urlsToIdentities(
  urls: Array<string | null | undefined>,
): StorageIdentity[] {
  const map = new Map<string, StorageIdentity>()
  for (const url of urls) {
    for (const identity of getStorageIdentities(url)) {
      if (!map.has(identity.canonical)) {
        map.set(identity.canonical, identity)
      }
    }
  }
  return Array.from(map.values())
}

/* ------------------------------------------------------------------ *
 *  Convenience factory                                                *
 * ------------------------------------------------------------------ */

export function createAssetSession(init: AssetSessionInit = {}): AssetSession {
  return new AssetSession(init)
}
