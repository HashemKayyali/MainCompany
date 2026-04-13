import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import Lenis from 'lenis'
import { usePerfMode } from './usePerfMode'

declare global {
  interface Window {
    __appLenis?: Lenis
  }
}

const smoothEase = (t: number) => 1 - Math.pow(1 - t, 3.2)
const scrollPositions = new Map<string, number>()

export function useSmoothScroll(enabled = true) {
  const location = useLocation()
  const navigationType = useNavigationType()
  const { perfLow, prefersReducedMotion } = usePerfMode()
  const shouldEnable = enabled && !perfLow && !prefersReducedMotion
  const previousKeyRef = useRef(location.key)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!shouldEnable) {
      document.documentElement.classList.remove('lenis-root')
      delete window.__appLenis
      return
    }

    const lenis = new Lenis({
      autoRaf: true,
      smoothWheel: true,
      syncTouch: false,
      duration: 0.72,
      lerp: 0.14,
      easing: smoothEase,
      wheelMultiplier: 1,
      touchMultiplier: 1,
      overscroll: true,
      anchors: { duration: 0.55, easing: smoothEase },
      stopInertiaOnNavigate: true,
      prevent: node =>
        Boolean(node.closest('[data-native-scroll], [data-lenis-prevent], [role="dialog"]')),
      virtualScroll: ({ event }) => !(event instanceof WheelEvent && event.ctrlKey),
    })

    window.__appLenis = lenis
    document.documentElement.classList.add('lenis-root')

    const syncScrollLock = () => {
      if (document.documentElement.dataset.scrollLocked === 'true') lenis.stop()
      else lenis.start()
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        lenis.stop()
        return
      }

      syncScrollLock()
    }

    syncScrollLock()
    window.addEventListener('app:scroll-lock-change', syncScrollLock as EventListener)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('app:scroll-lock-change', syncScrollLock as EventListener)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      lenis.destroy()

      if (window.__appLenis === lenis) delete window.__appLenis
      document.documentElement.classList.remove('lenis-root')
    }
  }, [shouldEnable])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const previousKey = previousKeyRef.current
    if (previousKey !== location.key) {
      scrollPositions.set(previousKey, window.scrollY)
      previousKeyRef.current = location.key
    }

    const restoreScroll = (top: number) => {
      if (shouldEnable && window.__appLenis) {
        window.__appLenis.scrollTo(top, { immediate: true, force: true })
        return
      }

      window.scrollTo({ top, left: 0, behavior: 'auto' })
    }

    const nextTop =
      navigationType === 'POP'
        ? scrollPositions.get(location.key) ?? 0
        : 0

    const frame = window.requestAnimationFrame(() => restoreScroll(nextTop))

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [location.key, navigationType, shouldEnable])
}
