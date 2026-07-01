import { motion, type HTMLMotionProps } from 'framer-motion'

type RevealProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'whileInView' | 'transition' | 'viewport'> & {
  /** Stagger / sequencing delay in seconds. Kept for caller compatibility. */
  delay?: number
  /** Vertical rise distance in px. Kept for caller compatibility. */
  y?: number
  /** Starting scale. Kept for caller compatibility. */
  scaleFrom?: number
  duration?: number
}

/**
 * Lightweight wrapper used by the homepage sections.
 *
 * Content renders in its final state immediately so smooth scrolling and image
 * lazy loading do not race the section entrance animation.
 */
export default function Reveal({
  children,
  delay: _delay = 0,
  y: _y = 30,
  scaleFrom: _scaleFrom = 0.97,
  duration: _duration = 0.6,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      initial={false}
      {...rest}
    >
      {children}
    </motion.div>
  )
}
