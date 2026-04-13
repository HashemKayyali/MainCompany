import { useEffect, useState } from 'react'

export function useMediaQuery(query: string, initialState = false) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return initialState
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
