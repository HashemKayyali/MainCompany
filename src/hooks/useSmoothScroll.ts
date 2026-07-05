import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { usePerfMode } from './usePerfMode'

const scrollPositions = new Map<string, number>()
const MAX_SCROLL_HISTORY = 50

/**
 * Native scroll management: restores scroll position on back/forward
 * navigation and scrolls to hash targets. Scrolling itself stays on the
 * browser's compositor thread — no wheel hijacking.
 */
export function useSmoothScroll(_enabled = true) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const { prefersReducedMotion } = usePerfMode()
  const previousKeyRef = useRef(location.key)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const previousKey = previousKeyRef.current
    if (previousKey !== location.key) {
      scrollPositions.set(previousKey, window.scrollY)
      if (scrollPositions.size > MAX_SCROLL_HISTORY) {
        const oldestKey = scrollPositions.keys().next().value
        if (oldestKey !== undefined) scrollPositions.delete(oldestKey)
      }
      previousKeyRef.current = location.key
    }

    let retryTimer = 0
    let attempts = 0

    const scrollToHashTarget = () => {
      const id = decodeURIComponent(location.hash.slice(1))
      const target = id ? document.getElementById(id) : null
      if (target) {
        const header = document.querySelector('header')
        const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0
        const top = window.scrollY + target.getBoundingClientRect().top - headerHeight - 16
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
        const targetTop = Math.max(0, Math.min(top, maxTop))

        const immediate = navigationType === 'POP' || prefersReducedMotion
        window.scrollTo({
          top: targetTop,
          left: 0,
          behavior: immediate ? 'auto' : 'smooth',
        })
        return
      }

      attempts += 1
      if (attempts <= 80) retryTimer = window.setTimeout(scrollToHashTarget, 75)
    }

    let frame = 0

    if (location.hash) {
      frame = window.requestAnimationFrame(scrollToHashTarget)
    } else {
      const nextTop =
        navigationType === 'POP'
          ? scrollPositions.get(location.key) ?? 0
          : 0

      window.scrollTo({ top: nextTop, left: 0, behavior: 'instant' })
    }

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(retryTimer)
    }
  }, [location.hash, location.key, navigationType, prefersReducedMotion])
}
