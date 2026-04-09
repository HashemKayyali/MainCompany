import { useMemo, type CSSProperties } from 'react'
import { useMotionEnabled } from './useMotionEnabled'

export const REVEAL_EASE = [0.16, 1, 0.3, 1] as const

type RevealOptions = {
  delay?: number
  duration?: number
  distance?: number
  margin?: string
  once?: boolean
  amount?: number
}

type RevealGroupOptions = RevealOptions & {
  stagger?: number
  delayChildren?: number
}

export function useReveal({
  delay = 0,
  duration = 0.48,
  distance = 18,
  margin = '-64px',
  once = true,
  amount = 0.12,
}: RevealOptions = {}) {
  const motionEnabled = useMotionEnabled()

  return useMemo(
    () =>
      motionEnabled
        ? {
            initial: { opacity: 0, y: distance },
            whileInView: { opacity: 1, y: 0 },
            viewport: { once, margin, amount },
            transition: { duration, delay, ease: REVEAL_EASE },
          }
        : { initial: false as const },
    [amount, delay, distance, duration, margin, motionEnabled, once]
  )
}

export function useRevealGroup({
  delay = 0,
  duration = 0.48,
  distance = 18,
  margin = '-64px',
  once = true,
  amount = 0.12,
  stagger = 0.05,
  delayChildren = 0.02,
}: RevealGroupOptions = {}) {
  const motionEnabled = useMotionEnabled()

  return useMemo(() => {
    if (!motionEnabled) {
      return {
        containerProps: { initial: false as const },
        itemProps: {},
      }
    }

    return {
      containerProps: {
        variants: {
          hidden: { opacity: 1 },
          show: {
            opacity: 1,
            transition: {
              delayChildren: delay + delayChildren,
              staggerChildren: stagger,
            },
          },
        },
        initial: 'hidden' as const,
        whileInView: 'show' as const,
        viewport: { once, margin, amount },
      },
      itemProps: {
        variants: {
          hidden: { opacity: 0, y: distance },
          show: {
            opacity: 1,
            y: 0,
            transition: { duration, ease: REVEAL_EASE },
          },
        },
      },
    }
  }, [amount, delay, delayChildren, distance, duration, margin, motionEnabled, once, stagger])
}

export function getDeferredRenderStyle(containIntrinsicSize: string): CSSProperties {
  return {
    contentVisibility: 'auto',
    containIntrinsicSize,
  }
}
