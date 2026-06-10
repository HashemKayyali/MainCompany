import { useRef, useCallback } from 'react'

/**
 * Client-side rate limiter.
 *
 * ⚠️ UX ONLY — NOT a security control. This lives in memory in the browser and
 * is trivially bypassed (refresh the page, or POST directly to the Supabase
 * REST API). Its only job is to give honest users immediate feedback and avoid
 * accidental double-submits. The authoritative rate limit is enforced
 * server-side by the BEFORE INSERT trigger `check_contact_rate_limit` on
 * `contact_submissions` (see supabase/migrations). Never rely on this hook to
 * protect the backend.
 *
 * @param maxAttempts  max allowed within window
 * @param windowMs    rolling window in ms (default 60 s)
 */
export function useRateLimit(maxAttempts = 3, windowMs = 60_000) {
  const attempts = useRef<number[]>([])

  const check = useCallback((): boolean => {
    const now = Date.now()
    attempts.current = attempts.current.filter(t => now - t < windowMs)
    if (attempts.current.length >= maxAttempts) return false
    attempts.current.push(now)
    return true
  }, [maxAttempts, windowMs])

  const remaining = useCallback((): number => {
    const now = Date.now()
    const recent = attempts.current.filter(t => now - t < windowMs)
    return Math.max(0, maxAttempts - recent.length)
  }, [maxAttempts, windowMs])

  return { check, remaining }
}
