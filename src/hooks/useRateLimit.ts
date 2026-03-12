import { useRef, useCallback } from 'react'

/**
 * Client-side rate limiter.
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
