import { useReducedMotion } from 'framer-motion'
import { usePerfMode } from './usePerfMode'

/**
 * Single switch for motion (Framer + CSS animations).
 */
export function useMotionEnabled() {
  const reduced = useReducedMotion()
  const { perfLow } = usePerfMode()
  return !reduced && !perfLow
}
