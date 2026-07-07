import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AssetSession,
  type AssetSessionInit,
  type AssetSessionSnapshot,
  type PersistenceOutcome,
  type RunPersistenceOptions,
} from '../services/asset-session'
import type { AssetDeletionResult } from '../services/storage.service'

/* ------------------------------------------------------------------ *
 *  Types                                                              *
 * ------------------------------------------------------------------ */

export interface UseAssetSessionOptions extends AssetSessionInit {
  /**
   * If this key changes, the current session is disposed and a new
   * session is initialized with the current `originalUrls`. Passing
   * `null`/`undefined` disposes the active session (useful when the
   * editor modal is closed).
   */
  sessionKey?: string | number | null
}

export interface UseAssetSessionResult {
  session: AssetSession
  snapshot: AssetSessionSnapshot
  /** True while any upload is in flight. */
  isUploading: boolean
  /** True while a DB write is in flight through `runPersistence`. */
  isPersisting: boolean
  /**
   * Save is safe: no upload in flight, no persistence in flight,
   * session not disposed/committed. UI Save buttons should gate on
   * this — attempting to start persistence otherwise throws.
   */
  canSave: boolean
  /** Close is safe (same guard as canSave). */
  canClose: boolean

  runUpload: <T>(
    work: (ctx: { isDisposed: () => boolean }) => Promise<T>,
    extractUrls: (result: T) => Array<string | null | undefined>,
  ) => Promise<T | null>

  /**
   * The persistence-safe Save entry point. See
   * `AssetSession.runPersistence` for the exact state-machine.
   *
   * TL;DR: `mutate` runs the DB write; the session guarantees no
   * temporary asset that becomes a final DB reference can be
   * deleted by an unmount or dispose that fires while the DB is
   * being written.
   */
  runPersistence: <T>(
    options: RunPersistenceOptions<T>,
  ) => Promise<PersistenceOutcome<T>>

  registerUpload: (url: string | null | undefined) => void

  commit: (
    finalUrls: Array<string | null | undefined>,
  ) => Promise<AssetDeletionResult>

  cancel: () => Promise<AssetDeletionResult>
}

/* ------------------------------------------------------------------ *
 *  Hook                                                               *
 * ------------------------------------------------------------------ */

/**
 * React binding for `AssetSession`. Key behaviour:
 *
 *   - Lazy session creation. The session is created once at first
 *     render and re-created only when `sessionKey` changes.
 *   - Re-creation disposes the previous session (fire-and-forget
 *     cleanup) so no session-temporary storage is leaked.
 *   - Every state transition (in-flight change, commit, cancel,
 *     dispose) re-renders the consumer via a normal `useState`
 *     subscription — no `useSyncExternalStore` foot-gun.
 *   - Unmount disposes the active session synchronously; late
 *     uploads self-clean via the session's own `disposed` check.
 */
export function useAssetSession(options: UseAssetSessionOptions = {}): UseAssetSessionResult {
  const {
    sessionKey = null,
    originalUrls,
    onLateCleanup,
    onCleanupFailure,
    deleter,
  } = options

  // Keep the latest callbacks in a ref so re-created sessions dispatch
  // to the current handler rather than a stale closure.
  const callbacksRef = useRef({ onLateCleanup, onCleanupFailure })
  callbacksRef.current = { onLateCleanup, onCleanupFailure }

  // Keep the latest originalUrls in a ref so a session re-created due
  // to `sessionKey` change picks up the freshest originals without
  // forcing the caller to re-render on every array change.
  const originalUrlsRef = useRef(originalUrls)
  originalUrlsRef.current = originalUrls

  const buildSession = useCallback(
    (initialOriginals: Array<string | null | undefined> | undefined) =>
      new AssetSession({
        originalUrls: initialOriginals,
        deleter,
        onLateCleanup: result => {
          callbacksRef.current.onLateCleanup?.(result)
          if (result.failed.length > 0) {
            console.warn('[AssetSession] late-cleanup partial failure', result.failed)
          }
        },
        onCleanupFailure: result => {
          callbacksRef.current.onCleanupFailure?.(result)
          if (result.failed.length > 0) {
            console.warn('[AssetSession] cleanup partial failure', result.failed)
          }
        },
      }),
    [deleter],
  )

  // Store the CURRENT session in useState so a change forces a
  // re-render (which is what we want — the whole downstream tree
  // needs to bind to the new session).
  const [session, setSession] = useState<AssetSession>(() =>
    buildSession(originalUrlsRef.current),
  )
  const sessionKeyRef = useRef<UseAssetSessionOptions['sessionKey']>(sessionKey)

  useEffect(() => {
    if (sessionKeyRef.current === sessionKey) return
    sessionKeyRef.current = sessionKey
    // Dispose the previous session; late in-flight uploads will
    // self-clean when they observe `isDisposed`.
    session.dispose()
    setSession(buildSession(originalUrlsRef.current))
    // We deliberately do not depend on `session` here — depending on
    // it would cause an infinite loop the moment setSession fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionKey, buildSession])

  // Subscribe to the session's snapshot updates so downstream UI can
  // react to in-flight/committed/disposed transitions.
  const [snapshot, setSnapshot] = useState<AssetSessionSnapshot>(() =>
    session.snapshot(),
  )
  useEffect(() => {
    // Every session swap starts with a fresh snapshot; publish it
    // synchronously so the first render after the swap is coherent.
    setSnapshot(session.snapshot())
    const unsubscribe = session.subscribe(next => setSnapshot(next))
    return unsubscribe
  }, [session])

  // Unmount cleanup. React StrictMode replays Effect setup/cleanup once
  // in development without actually unmounting the component. Disposing
  // synchronously in that probe cleanup permanently killed the live session,
  // so every local upload returned `null` before any network request started.
  //
  // Defer disposal to a microtask and cancel it when the Effect is set up
  // again first. A real unmount has no subsequent setup, so the session is
  // still disposed and temporary assets are still cleaned as intended.
  const cleanupEpochRef = useRef(0)
  useEffect(() => {
    const effectEpoch = ++cleanupEpochRef.current
    const targetSession = session

    return () => {
      queueMicrotask(() => {
        if (cleanupEpochRef.current !== effectEpoch) return
        if (!targetSession.isDisposed) targetSession.dispose()
      })
    }
  }, [session])

  const runUpload = useCallback<UseAssetSessionResult['runUpload']>(
    async (work, extractUrls) => session.runUpload(work, extractUrls),
    [session],
  )

  const runPersistence = useCallback<UseAssetSessionResult['runPersistence']>(
    options => session.runPersistence(options),
    [session],
  )

  const registerUpload = useCallback<UseAssetSessionResult['registerUpload']>(
    url => session.registerSessionUpload(url),
    [session],
  )

  const commit = useCallback<UseAssetSessionResult['commit']>(
    finalUrls => session.commit(finalUrls),
    [session],
  )

  const cancel = useCallback<UseAssetSessionResult['cancel']>(
    () => session.cancel(),
    [session],
  )

  return useMemo(
    () => ({
      session,
      snapshot,
      isUploading: snapshot.inFlight > 0,
      isPersisting: snapshot.persistenceState === 'active',
      canSave: snapshot.canStartPersistence,
      canClose: snapshot.canStartPersistence,
      runUpload,
      runPersistence,
      registerUpload,
      commit,
      cancel,
    }),
    [session, snapshot, runUpload, runPersistence, registerUpload, commit, cancel],
  )
}
