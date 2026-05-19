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
  _motionEnabled: boolean,
  _options: RevealOptions = {}
) {
  // Reveal-on-scroll entrance animations are intentionally disabled site-wide.
  //
  // Every consumer renders in its final visual state immediately. This keeps the
  // settled layout/styling identical while removing the per-element
  // IntersectionObserver + opacity/transform work that made content "disappear
  // and reload" on fast scroll and added needless load on low-end devices.
  return { initial: false as const }
}

function buildRevealGroupProps(
  _motionEnabled: boolean,
  _options: RevealGroupOptions = {}
) {
  // Disabled site-wide for the same reason as buildRevealProps: render the
  // final state immediately, no staggered scroll-in work.
  return {
    containerProps: { initial: false as const },
    itemProps: {},
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
