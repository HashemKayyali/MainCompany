/**
 * Race a promise against a timeout. If the promise doesn't settle
 * within `ms`, resolve with `fallback`. Use this around Supabase
 * profile / role fetches so a slow request never freezes the UI.
 *
 * Unlike rejecting on timeout, we resolve with a sentinel/fallback so
 * the caller can degrade gracefully — e.g. AdminGuard can show a retry
 * UI rather than crashing inside an ErrorBoundary.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  fallback: T,
  label = 'request'
): Promise<T> {
  let settled = false
  const timer = new Promise<T>(resolve => {
    setTimeout(() => {
      if (!settled) {
        if (typeof console !== 'undefined') {
          console.warn(`[withTimeout] ${label} timed out after ${ms}ms — using fallback`)
        }
        resolve(fallback)
      }
    }, ms)
  })
  return Promise.race([
    promise.then(value => {
      settled = true
      return value
    }),
    timer,
  ])
}
