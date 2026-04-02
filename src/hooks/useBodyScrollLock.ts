import { useEffect } from 'react'

let lockCount = 0
let previousHtmlOverflow = ''
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''
let previousBodyOverscroll = ''

function emitScrollLockChange() {
  window.dispatchEvent(
    new CustomEvent('app:scroll-lock-change', {
      detail: { locked: lockCount > 0, count: lockCount },
    })
  )
}

function lockBodyScroll() {
  if (typeof document === 'undefined') return

  const html = document.documentElement
  const body = document.body

  if (lockCount === 0) {
    previousHtmlOverflow = html.style.overflow
    previousBodyOverflow = body.style.overflow
    previousBodyPaddingRight = body.style.paddingRight
    previousBodyOverscroll = body.style.overscrollBehavior

    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth)
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : previousBodyPaddingRight
  }

  lockCount += 1
  html.dataset.scrollLocked = 'true'
  emitScrollLockChange()
}

function unlockBodyScroll() {
  if (typeof document === 'undefined' || lockCount === 0) return

  lockCount -= 1

  if (lockCount === 0) {
    const html = document.documentElement
    const body = document.body

    html.style.overflow = previousHtmlOverflow
    body.style.overflow = previousBodyOverflow
    body.style.paddingRight = previousBodyPaddingRight
    body.style.overscrollBehavior = previousBodyOverscroll
    delete html.dataset.scrollLocked
  }

  emitScrollLockChange()
}

export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [active])
}

