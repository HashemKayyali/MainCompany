import { useCallback, useEffect, useState } from 'react'

type UseElementActivityOptions = {
  rootMargin?: string
  threshold?: number
}

/**
 * Tracks whether an element is close enough to the viewport to justify
 * continuous animation work, while also respecting tab visibility.
 *
 * The element stays mounted, so pausing work does not change layout or UI.
 */
export function useElementActivity<T extends HTMLElement>({
  rootMargin = '240px 0px',
  threshold = 0.01,
}: UseElementActivityOptions = {}) {
  const [element, setElement] = useState<T | null>(null)
  const [nearViewport, setNearViewport] = useState(true)
  const [documentVisible, setDocumentVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState !== 'hidden'
  )

  const ref = useCallback((node: T | null) => {
    setElement(node)
  }, [])

  useEffect(() => {
    if (!element || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        setNearViewport(Boolean(entry?.isIntersecting))
      },
      { rootMargin, threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [element, rootMargin, threshold])

  useEffect(() => {
    if (typeof document === 'undefined') return undefined

    const onVisibilityChange = () => {
      setDocumentVisible(document.visibilityState !== 'hidden')
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  return {
    ref,
    active: nearViewport && documentVisible,
  }
}
