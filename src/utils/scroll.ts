import type Lenis from 'lenis'

declare global {
  interface Window {
    __appLenis?: Lenis
  }
}

type ScrollTarget = number | HTMLElement | string

type ScrollOptions = {
  immediate?: boolean
  offset?: number
}

export function scrollToPosition(target: ScrollTarget, options: ScrollOptions = {}) {
  if (typeof window === 'undefined') return

  const lenis = window.__appLenis
  if (lenis) {
    lenis.scrollTo(target, {
      immediate: options.immediate,
      offset: options.offset,
      force: true,
    })
    return
  }

  if (typeof target === 'number') {
    window.scrollTo({
      top: target,
      behavior: options.immediate ? 'auto' : 'smooth',
    })
    return
  }

  if (typeof target === 'string') {
    const element = document.querySelector(target)
    if (element instanceof HTMLElement) {
      element.scrollIntoView({ behavior: options.immediate ? 'auto' : 'smooth', block: 'start' })
    }
    return
  }

  target.scrollIntoView({ behavior: options.immediate ? 'auto' : 'smooth', block: 'start' })
}

export function scrollToTop(immediate = false) {
  scrollToPosition(0, { immediate })
}

