import { useMemo } from 'react'
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

function buildRevealProps(
  motionEnabled: boolean,
  {
    delay = 0,
    duration = 0.38,
    distance = 14,
    margin = '0px 0px 10% 0px',
    once = true,
    amount = 0.08,
  }: RevealOptions = {}
) {
  return motionEnabled
    ? {
        initial: { opacity: 0, y: distance },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once, margin, amount },
        transition: { duration, delay, ease: REVEAL_EASE },
      }
    : { initial: false as const }
}

function buildRevealGroupProps(
  motionEnabled: boolean,
  {
    delay = 0,
    duration = 0.38,
    distance = 14,
    margin = '0px 0px 10% 0px',
    once = true,
    amount = 0.08,
    stagger = 0.04,
    delayChildren = 0,
  }: RevealGroupOptions = {}
) {
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
}

export function useReveal({
  delay = 0,
  duration = 0.38,
  distance = 14,
  margin = '0px 0px 10% 0px',
  once = true,
  amount = 0.08,
}: RevealOptions = {}) {
  const motionEnabled = useMotionEnabled()

  return useMemo(
    () => buildRevealProps(motionEnabled, { delay, duration, distance, margin, once, amount }),
    [amount, delay, distance, duration, margin, motionEnabled, once]
  )
}

export function useRevealWithMotion(
  motionEnabled: boolean,
  { delay = 0, duration = 0.38, distance = 14, margin = '0px 0px 10% 0px', once = true, amount = 0.08 }: RevealOptions = {}
) {
  return useMemo(
    () => buildRevealProps(motionEnabled, { delay, duration, distance, margin, once, amount }),
    [amount, delay, distance, duration, margin, motionEnabled, once]
  )
}

export function useRevealGroup({
  delay = 0,
  duration = 0.38,
  distance = 14,
  margin = '0px 0px 10% 0px',
  once = true,
  amount = 0.08,
  stagger = 0.04,
  delayChildren = 0,
}: RevealGroupOptions = {}) {
  const motionEnabled = useMotionEnabled()

  return useMemo(
    () =>
      buildRevealGroupProps(motionEnabled, {
        delay,
        duration,
        distance,
        margin,
        once,
        amount,
        stagger,
        delayChildren,
      }),
    [amount, delay, delayChildren, distance, duration, margin, motionEnabled, once, stagger]
  )
}
