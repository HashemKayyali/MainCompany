'use client'

import { usePathname } from '@/i18n/navigation'
import { AnimatedBackground } from './AnimatedBackground'
import { HeroBackground } from './HeroBackground'

/**
 * CAT-024 — global backdrop stack (VERBATIM port of the Vite PageContainer
 * background wiring). Base atmosphere is always present; the animated
 * MeshGradient hero backdrop is active only on the hero-background routes (same
 * set as the Vite `HERO_BACKGROUND_PATHS`). Locale-stripped pathname via the
 * next-intl navigation hook, so `/ar/...` resolves identically.
 */
const HERO_PATHS = new Set([
  '/',
  '/products',
  '/categories',
  '/customers',
  '/custom-builds',
  '/gallery',
  '/about',
  '/contact',
])

export function SiteBackground() {
  const pathname = usePathname()
  const showHero = HERO_PATHS.has(pathname)
  return (
    <>
      <AnimatedBackground className="z-0" />
      <HeroBackground fixed active={showHero} />
    </>
  )
}
