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
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
    >
      {children}
    </motion.div>
  )
}
