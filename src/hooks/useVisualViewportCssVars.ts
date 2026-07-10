import { useEffect, useLayoutEffect } from 'react'

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function setPxVar(name: string, value: number) {
  document.documentElement.style.setProperty(name, `${Math.max(0, value)}px`)
}

export function syncVisualViewportCssVars() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return

  const viewport = window.visualViewport
  setPxVar('--app-visual-viewport-height', viewport?.height ?? window.innerHeight)
  setPxVar('--app-visual-viewport-width', viewport?.width ?? window.innerWidth)
  setPxVar('--app-visual-viewport-offset-top', viewport?.offsetTop ?? 0)
  setPxVar('--app-visual-viewport-offset-left', viewport?.offsetLeft ?? 0)
  document.documentElement.style.setProperty('--app-visual-viewport-scale', String(viewport?.scale ?? 1))
}

export function useVisualViewportCssVars() {
  useIsoLayoutEffect(() => {
    if (typeof window === 'undefined') return undefined

    let frame = 0
    const update = () => {
      if (frame) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        frame = 0
        syncVisualViewportCssVars()
      })
    }

    syncVisualViewportCssVars()
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [])
}
