import { type ReactNode, useEffect } from 'react'
import { usePerfMode } from '../hooks/usePerfMode'

/**
 * Adds a CSS class on <html> so we can disable heavy animations globally.
 */
export default function PerfClass({ children }: { children: ReactNode }) {
  const { perfLow } = usePerfMode()

  useEffect(() => {
    const el = document.documentElement
    if (perfLow) el.classList.add('perf-low')
    else el.classList.remove('perf-low')
  }, [perfLow])

  return <>{children}</>
}
