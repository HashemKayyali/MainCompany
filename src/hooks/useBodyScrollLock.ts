import { useEffect, useLayoutEffect } from 'react'

type BodyScrollLockState = {
  lockCount: number
  previousHtmlOverflow: string
  previousBodyOverflow: string
  previousBodyPaddingRight: string
  previousBodyOverscroll: string
  previousBodyPosition: string
  previousBodyTop: string
  previousBodyLeft: string
  previousBodyRight: string
  previousBodyWidth: string
  lockedScrollX: number
  lockedScrollY: number
}

declare global {
  // eslint-disable-next-line no-var
  var __eventiesBodyScrollLock: BodyScrollLockState | undefined
}

const scrollLockState: BodyScrollLockState =
  globalThis.__eventiesBodyScrollLock ??= {
    lockCount: 0,
    previousHtmlOverflow: '',
    previousBodyOverflow: '',
    previousBodyPaddingRight: '',
    previousBodyOverscroll: '',
    previousBodyPosition: '',
    previousBodyTop: '',
    previousBodyLeft: '',
    previousBodyRight: '',
    previousBodyWidth: '',
    lockedScrollX: 0,
    lockedScrollY: 0,
  }

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

function emitScrollLockChange() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent('app:scroll-lock-change', {
      detail: { locked: scrollLockState.lockCount > 0, count: scrollLockState.lockCount },
    })
  )
}

function lockBodyScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return

  const html = document.documentElement
  const body = document.body

  if (scrollLockState.lockCount === 0) {
    scrollLockState.previousHtmlOverflow = html.style.overflow
    scrollLockState.previousBodyOverflow = body.style.overflow
    scrollLockState.previousBodyPaddingRight = body.style.paddingRight
    scrollLockState.previousBodyOverscroll = body.style.overscrollBehavior
    scrollLockState.previousBodyPosition = body.style.position
    scrollLockState.previousBodyTop = body.style.top
    scrollLockState.previousBodyLeft = body.style.left
    scrollLockState.previousBodyRight = body.style.right
    scrollLockState.previousBodyWidth = body.style.width
    scrollLockState.lockedScrollX = window.scrollX
    scrollLockState.lockedScrollY = window.scrollY

    const scrollbarWidth = Math.max(0, window.innerWidth - html.clientWidth)
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    body.style.overscrollBehavior = 'none'
    body.style.position = 'fixed'
    body.style.top = `-${scrollLockState.lockedScrollY}px`
    body.style.left = `-${scrollLockState.lockedScrollX}px`
    body.style.right = '0'
    body.style.width = '100%'
    body.style.paddingRight = scrollbarWidth > 0 ? `${scrollbarWidth}px` : scrollLockState.previousBodyPaddingRight
  }

  scrollLockState.lockCount += 1
  html.dataset.scrollLocked = 'true'
  emitScrollLockChange()
}

function unlockBodyScroll() {
  if (typeof document === 'undefined' || typeof window === 'undefined' || scrollLockState.lockCount === 0) return

  scrollLockState.lockCount -= 1

  if (scrollLockState.lockCount === 0) {
    const html = document.documentElement
    const body = document.body
    const scrollX = scrollLockState.lockedScrollX
    const scrollY = scrollLockState.lockedScrollY

    html.style.overflow = scrollLockState.previousHtmlOverflow
    body.style.overflow = scrollLockState.previousBodyOverflow
    body.style.paddingRight = scrollLockState.previousBodyPaddingRight
    body.style.overscrollBehavior = scrollLockState.previousBodyOverscroll
    body.style.position = scrollLockState.previousBodyPosition
    body.style.top = scrollLockState.previousBodyTop
    body.style.left = scrollLockState.previousBodyLeft
    body.style.right = scrollLockState.previousBodyRight
    body.style.width = scrollLockState.previousBodyWidth
    delete html.dataset.scrollLocked
    window.scrollTo(scrollX, scrollY)
  }

  emitScrollLockChange()
}

export function useBodyScrollLock(active: boolean) {
  useIsoLayoutEffect(() => {
    if (!active) return

    lockBodyScroll()
    return () => unlockBodyScroll()
  }, [active])
}
