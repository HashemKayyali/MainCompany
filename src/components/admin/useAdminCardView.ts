import { useEffect, useRef, useState } from 'react'

export type AdminCardView = 'grid' | 'list'
export type AdminCardViewTransitionState = 'idle' | 'exit' | 'enter'

const STORAGE_PREFIX = 'admin-card-view:'
const EXIT_DURATION_MS = 95
const ENTER_DURATION_MS = 170

const VALID_VIEWS: AdminCardView[] = ['grid', 'list']

function readStoredView(storageKey: string, fallback: AdminCardView): AdminCardView {
  if (typeof window === 'undefined') return fallback
  const value = window.localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`)
  if (value === 'grid-3' || value === 'grid-4' || value === 'grid-5') return 'grid'
  return VALID_VIEWS.includes(value as AdminCardView) ? (value as AdminCardView) : fallback
}

export function getAdminCardsLayoutClass(view: AdminCardView) {
  if (view === 'list') return 'flex flex-col gap-2.5'
  return 'grid grid-cols-1 gap-3 min-[560px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1760px]:grid-cols-6'
}

export function getAdminEntityVariant(view: AdminCardView): 'grid' | 'list' {
  return view === 'list' ? 'list' : 'grid'
}

export function getAdminCardViewTransitionClass(state: AdminCardViewTransitionState) {
  if (state === 'exit') return 'opacity-0 translate-y-1 scale-[0.992] blur-[2px] pointer-events-none'
  return 'opacity-100 translate-y-0 scale-100 blur-0'
}

function useCompactListFallback(query = '(max-width: 519px)') {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [query])

  return matches
}

export default function useAdminCardView(storageKey: string, fallback: AdminCardView = 'grid') {
  const [cardView, setCardView] = useState<AdminCardView>(() => readStoredView(storageKey, fallback))
  const forceListOnCompact = useCompactListFallback()
  const resolvedCardView: AdminCardView = cardView === 'grid' && forceListOnCompact ? 'list' : cardView
  const [displayCardView, setDisplayCardView] = useState<AdminCardView>(resolvedCardView)
  const [transitionState, setTransitionState] = useState<AdminCardViewTransitionState>('idle')
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, cardView)
  }, [cardView, storageKey])

  useEffect(() => {
    if (typeof window === 'undefined') {
      setDisplayCardView(resolvedCardView)
      setTransitionState('idle')
      return
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (resolvedCardView === displayCardView || prefersReducedMotion) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      setDisplayCardView(resolvedCardView)
      setTransitionState('idle')
      return
    }

    setTransitionState('exit')

    if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(() => {
      setDisplayCardView(resolvedCardView)
      setTransitionState('enter')

      timeoutRef.current = window.setTimeout(() => {
        setTransitionState('idle')
        timeoutRef.current = null
      }, ENTER_DURATION_MS)
    }, EXIT_DURATION_MS)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [resolvedCardView, displayCardView])

  return {
    cardView,
    resolvedCardView,
    displayCardView,
    transitionState,
    viewTransitionClassName: getAdminCardViewTransitionClass(transitionState),
    setCardView,
  }
}
