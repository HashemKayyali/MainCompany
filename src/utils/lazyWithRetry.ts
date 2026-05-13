import { lazy, type ComponentType } from 'react'

/**
 * Lazy import wrapper that:
 *
 *  1. Retries a failed dynamic import once after a short backoff — this
 *     fixes intermittent "fails on first try, works on refresh" symptoms
 *     caused by transient network blips when the user opens the app on a
 *     laptop with weak Wi-Fi.
 *  2. Detects the "old build's chunk no longer exists after a redeploy"
 *     case and forces a single full reload so the user gets the new
 *     manifest. This avoids the blank-screen-after-deploy class of bugs.
 *
 * The reload safety flag lives in sessionStorage so we never reload more
 * than once per tab if something is genuinely broken.
 */

const RELOAD_FLAG = 'app:chunk-reload-attempted'

function isChunkLoadError(err: unknown): boolean {
  if (!err) return false
  const message = typeof err === 'object' && err && 'message' in err
    ? String((err as { message: unknown }).message || '')
    : String(err)
  return (
    /Loading chunk \d+ failed/i.test(message) ||
    /ChunkLoadError/i.test(message) ||
    /Failed to fetch dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message) ||
    /error loading dynamically imported module/i.test(message)
  )
}

function safeSessionStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null
  } catch {
    return null
  }
}

export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy<T>(async () => {
    try {
      return await factory()
    } catch (firstError) {
      if (!isChunkLoadError(firstError)) throw firstError

      // Wait briefly and retry once — covers transient network hiccups.
      await new Promise(resolve => setTimeout(resolve, 350))
      try {
        return await factory()
      } catch (secondError) {
        if (!isChunkLoadError(secondError)) throw secondError

        const storage = safeSessionStorage()
        const alreadyReloaded = storage?.getItem(RELOAD_FLAG) === '1'

        if (!alreadyReloaded && typeof window !== 'undefined') {
          try {
            storage?.setItem(RELOAD_FLAG, '1')
          } catch {
            // ignore
          }
          // Likely the deployed build was replaced — the user's index.html
          // points at chunk hashes that no longer exist. A single reload
          // pulls the fresh manifest.
          window.location.reload()
          // Return a never-resolving promise so React Suspense stays in
          // the loading state while the page is reloading.
          return new Promise<{ default: T }>(() => {})
        }

        throw secondError
      }
    }
  })
}

/**
 * Call this once we know the app booted successfully. Clears the reload
 * guard so a future genuine deploy/network issue can trigger the
 * recovery reload again.
 */
export function clearChunkReloadFlag() {
  try {
    safeSessionStorage()?.removeItem(RELOAD_FLAG)
  } catch {
    // ignore
  }
}
