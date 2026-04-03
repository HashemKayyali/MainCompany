import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Lenis from 'lenis'
import { usePerfMode } from './usePerfMode'

declare global {
  interface Window {
    __appLenis?: Lenis
  }
}

const smoothEase = (t: number) => 1 - Math.pow(1 - t, 3.2)

export function useSmoothScroll(enabled = true) {
  const { pathname } = useLocation()
  const { perfLow, prefersReducedMotion } = usePerfMode()
  const shouldEnable = enabled && !perfLow && !prefersReducedMotion

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
      duration: 1.05,
      lerp: 0.082,
      easing: smoothEase,
      wheelMultiplier: 0.92,
      touchMultiplier: 1,
      overscroll: true,
      anchors: { duration: 0.85, easing: smoothEase },
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

    if (!shouldEnable || !window.__appLenis) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    const scrollToTop = () => {
      window.__appLenis?.scrollTo(0, { immediate: true, force: true })
    }

    scrollToTop()
    const frame = window.requestAnimationFrame(scrollToTop)
    const timeout = window.setTimeout(scrollToTop, 50)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
    }
  }, [pathname, shouldEnable])
}
