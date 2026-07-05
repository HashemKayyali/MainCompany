type ScrollTarget = number | HTMLElement | string

type ScrollOptions = {
  immediate?: boolean
  offset?: number
}

export function scrollToPosition(target: ScrollTarget, options: ScrollOptions = {}) {
  if (typeof window === 'undefined') return

  const behavior: ScrollBehavior = options.immediate ? 'auto' : 'smooth'

  if (typeof target === 'number') {
    window.scrollTo({ top: target + (options.offset ?? 0), behavior })
    return
  }

  const element =
    typeof target === 'string' ? document.querySelector(target) : target

  if (element instanceof HTMLElement) {
    const top =
      window.scrollY + element.getBoundingClientRect().top + (options.offset ?? 0)
    window.scrollTo({ top: Math.max(0, top), behavior })
  }
}

export function scrollToTop(immediate = false) {
  scrollToPosition(0, { immediate })
}
