'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * CAT-021 / A11Y-007 — reveal-on-scroll wrapper (framer whileInView), no layout
 * thrash (transform/opacity only). Honours prefers-reduced-motion: reduced =
 * render in place, no animation.
 */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  dir,
}: {
  children: ReactNode
  delay?: number
  /** Vertical rise distance in px (matches the Vite Reveal API). */
  y?: number
  className?: string
  dir?: 'ltr' | 'rtl'
}) {
  const reduce = useReducedMotion()
  if (reduce)
    return (
      <div className={className} dir={dir}>
        {children}
      </div>
    )
  return (
    <motion.div
      className={className}
      dir={dir}
      // Content is deliberately opaque in the server and initial client frame.
      // IntersectionObserver enhances position only, so failed hydration,
      // screenshot automation, or a slow observer can never hide the content.
      initial={{ opacity: 1, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}
