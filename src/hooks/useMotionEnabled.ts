import { usePerfMode } from './usePerfMode'

/**
 * Single switch for motion (Framer + CSS animations).
 */
export function useMotionEnabled() {
  const { perfLow, prefersReducedMotion } = usePerfMode()
  return !prefersReducedMotion && !perfLow
}
