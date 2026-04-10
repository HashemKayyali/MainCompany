import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import type { CSSProperties } from 'react'
import { useReducedMotion } from 'framer-motion'
import { usePerfMode } from '../../hooks/usePerfMode'

interface Props {
  isTyping: boolean
  passwordHidden: boolean  // password has value but is masked
  passwordVisible: boolean // password is unmasked
}

/**
 * Four brand-coloured abstract characters with:
 * - Smooth lerped eye tracking (direct DOM, zero re-renders)
 * - Idle floating bob (CSS keyframe, staggered per character)
 * - Random blinking (JS timers, staggered across characters)
 * - Cursor proximity brightness glow (RAF-driven)
 * - Pose reactions driven by form state
 *
 * All animations are disabled on touch devices, perfLow mode, and
 * reduced-motion preference.
 */
const AuthCharacters = memo(function AuthCharacters({
  isTyping,
  passwordHidden,
  passwordVisible,
}: Props) {
  const reduceMotion = useReducedMotion()
  const { perfLow } = usePerfMode()

  const isTouchDevice = useMemo(
    () =>
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0),
    []
  )

  const shouldAnimate = !reduceMotion && !perfLow && !isTouchDevice

  // Eye container refs (pupil tracking + blinking)
  const eyeA = useRef<HTMLDivElement>(null)
  const eyeB = useRef<HTMLDivElement>(null)
  const eyeC = useRef<HTMLDivElement>(null)
  const eyeD = useRef<HTMLDivElement>(null)

  // Body refs (proximity glow via filter)
  const bodyA = useRef<HTMLDivElement>(null)
  const bodyB = useRef<HTMLDivElement>(null)
  const bodyC = useRef<HTMLDivElement>(null)
  const bodyD = useRef<HTMLDivElement>(null)

  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  // null = track mouse; override = fixed offset (special form states)
  const forcedRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (passwordHidden) {
      forcedRef.current = { x: 3, y: 4 }
    } else if (passwordVisible) {
      forcedRef.current = { x: -5, y: -2 }
    } else if (isTyping) {
      forcedRef.current = { x: 4, y: 1 }
    } else {
      forcedRef.current = null
    }
  }, [passwordHidden, passwordVisible, isTyping])

  // ── RAF loop: lerped eye tracking + proximity glow ────────────────────────
  const startLoop = useCallback(() => {
    if (!shouldAnimate) return

    const chars = [
      { eye: eyeA, body: bodyA, max: 5 },
      { eye: eyeB, body: bodyB, max: 4 },
      { eye: eyeC, body: bodyC, max: 4 },
      { eye: eyeD, body: bodyD, max: 4 },
    ]

    // Per-character lerp accumulators
    const lerp = chars.map(() => ({ ex: 0, ey: 0 }))

    const loop = () => {
      const forced = forcedRef.current
      const { x: mx, y: my } = mouseRef.current

      chars.forEach((c, i) => {
        const eyeEl = c.eye.current
        const bodyEl = c.body.current
        if (!eyeEl || !bodyEl) return

        // Compute target eye offset
        let tx: number, ty: number
        if (forced) {
          tx = forced.x
          ty = forced.y
        } else {
          const rect = eyeEl.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = mx - cx
          const dy = my - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (!dist) {
            tx = 0
            ty = 0
          } else {
            const clamped = Math.min(dist, c.max)
            tx = (dx / dist) * clamped
            ty = (dy / dist) * clamped
          }
        }

        // Lerp toward target (smooth follow, ~12% per frame)
        lerp[i].ex = lerp[i].ex * 0.88 + tx * 0.12
        lerp[i].ey = lerp[i].ey * 0.88 + ty * 0.12

        eyeEl.querySelectorAll<HTMLElement>('.ac-pupil').forEach(p => {
          p.style.transform = `translate(${lerp[i].ex.toFixed(2)}px,${lerp[i].ey.toFixed(2)}px)`
        })

        // Proximity glow: subtle brightness boost when cursor is near
        const bodyRect = bodyEl.getBoundingClientRect()
        const bx = bodyRect.left + bodyRect.width / 2
        const by = bodyRect.top + bodyRect.height / 2
        const dist2 = Math.sqrt((mx - bx) ** 2 + (my - by) ** 2)
        const prox = Math.max(0, 1 - dist2 / 260)
        if (prox > 0.04) {
          bodyEl.style.filter = `brightness(${(1 + prox * 0.18).toFixed(3)})`
        } else if (bodyEl.style.filter) {
          bodyEl.style.filter = ''
        }
      })

      rafRef.current = requestAnimationFrame(loop)
    }

    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [shouldAnimate])

  useEffect(() => {
    const cleanup = startLoop()
    return cleanup
  }, [startLoop])

  // ── Blinking ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!shouldAnimate) return

    const refs = [eyeA, eyeB, eyeC, eyeD]
    // Different initial delays so characters don't blink in sync
    const initialDelays = [700, 2100, 1350, 3000]
    const timerIds: ReturnType<typeof setTimeout>[] = new Array(4)

    refs.forEach((ref, i) => {
      const scheduleBlink = () => {
        const el = ref.current
        if (el) {
          el.style.transition = 'transform 0.07s ease-in'
          el.style.transform = 'scaleY(0)'
          setTimeout(() => {
            if (ref.current) {
              ref.current.style.transition = 'transform 0.1s ease-out'
              ref.current.style.transform = ''
            }
          }, 80)
        }
        // Next blink: 2.5–6 s from now
        timerIds[i] = setTimeout(scheduleBlink, 2500 + Math.random() * 3500)
      }

      timerIds[i] = setTimeout(scheduleBlink, initialDelays[i])
    })

    return () => timerIds.forEach(id => clearTimeout(id))
  }, [shouldAnimate])

  // ── Pose config driven by props ───────────────────────────────────────────
  const violetH = passwordHidden ? 265 : 230
  const violetSkew = passwordHidden
    ? 'skewX(-11deg) translateX(22px)'
    : isTyping
    ? 'skewX(-3deg)'
    : 'skewX(0deg)'

  const pillarSkew = isTyping
    ? 'skewX(7deg)'
    : passwordHidden
    ? 'skewX(9deg) translateX(8px)'
    : 'skewX(0deg)'

  const domeSkew = isTyping ? 'skewX(-2deg)' : 'skewX(0deg)'
  const pinkSkew = isTyping ? 'skewX(4deg)' : 'skewX(0deg)'

  // Float animation helper — staggered per character
  const floatStyle = (duration: number, delay: number): CSSProperties =>
    shouldAnimate
      ? {
          animationName: 'ac-float',
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
          animationTimingFunction: 'ease-in-out',
          animationIterationCount: 'infinite',
        }
      : {}

  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: 340, height: 280 }}
      aria-hidden="true"
    >
      {/* ── Character A: Violet tall (back-left) ── */}
      <div
        className="ac-float-wrap absolute bottom-0"
        style={{ left: 28, width: 84, ...floatStyle(3.4, 0) }}
      >
        <div
          ref={bodyA}
          className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: 84,
            height: violetH,
            background: 'linear-gradient(180deg,#8b5cf6 0%,#7c3aed 60%,#6d28d9 100%)',
            borderRadius: '42px 42px 0 0',
            boxShadow:
              '0 -8px 32px rgba(124,58,237,0.38), inset 0 1px 0 rgba(255,255,255,0.16)',
            transform: violetSkew,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Eye sockets */}
          <div
            ref={eyeA}
            className="absolute flex gap-2.5 transition-[top] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ left: 18, top: passwordHidden ? 22 : 30, transformOrigin: 'center' }}
          >
            {[0, 1].map(i => (
              <div
                key={i}
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: 17,
                  height: 17,
                  background: 'rgba(255,255,255,0.93)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                <div
                  className="ac-pupil rounded-full"
                  style={{ width: 9, height: 9, background: '#1a0a3e' }}
                />
              </div>
            ))}
          </div>
          {/* Subtle mouth hint */}
          {!passwordHidden && (
            <div
              className="absolute rounded-full transition-opacity duration-300"
              style={{
                left: 24,
                bottom: 48,
                width: 36,
                height: 3,
                background: 'rgba(255,255,255,0.22)',
              }}
            />
          )}
        </div>
      </div>

      {/* ── Character B: Void pillar (center-back) ── */}
      <div
        className="ac-float-wrap absolute bottom-0"
        style={{ left: 152, width: 62, ...floatStyle(4.1, -0.9) }}
      >
        <div
          ref={bodyB}
          className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: 62,
            height: 196,
            background: 'linear-gradient(180deg,#1e1045 0%,#130d2e 100%)',
            borderRadius: '31px 31px 0 0',
            border: '1px solid rgba(139,92,246,0.24)',
            boxShadow:
              '0 -4px 20px rgba(79,44,200,0.22), inset 0 1px 0 rgba(139,92,246,0.18)',
            transform: pillarSkew,
            transformOrigin: 'bottom center',
          }}
        >
          <div
            ref={eyeB}
            className="absolute flex gap-2"
            style={{ left: 12, top: 28, transformOrigin: 'center' }}
          >
            {[0, 1].map(i => (
              <div
                key={i}
                className="rounded-full flex items-center justify-center overflow-hidden"
                style={{
                  width: 15,
                  height: 15,
                  background: 'rgba(255,255,255,0.88)',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)',
                }}
              >
                <div
                  className="ac-pupil rounded-full"
                  style={{ width: 8, height: 8, background: '#0a0520' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Character C: Cyan dome (front-left) ── */}
      <div
        className="ac-float-wrap absolute bottom-0"
        style={{ left: 0, width: 160, ...floatStyle(3.8, -1.7) }}
      >
        <div
          ref={bodyC}
          className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: 160,
            height: 126,
            background: 'linear-gradient(180deg,#22d3ee 0%,#06b6d4 55%,#0891b2 100%)',
            borderRadius: '80px 80px 0 0',
            boxShadow:
              '0 -6px 24px rgba(6,182,212,0.32), inset 0 1px 0 rgba(255,255,255,0.22)',
            transform: domeSkew,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Pupils only (no sclera — sits on cyan body) */}
          <div
            ref={eyeC}
            className="absolute flex gap-4"
            style={{ left: 38, top: 48, transformOrigin: 'center' }}
          >
            {[0, 1].map(i => (
              <div
                key={i}
                className="ac-pupil rounded-full"
                style={{
                  width: 13,
                  height: 13,
                  background: '#083344',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Character D: Pink capsule (front-right) ── */}
      <div
        className="ac-float-wrap absolute bottom-0"
        style={{ left: 248, width: 88, ...floatStyle(3.2, -2.5) }}
      >
        <div
          ref={bodyD}
          className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            width: 88,
            height: 178,
            background: 'linear-gradient(180deg,#f472b6 0%,#ec4899 55%,#db2777 100%)',
            borderRadius: '44px 44px 0 0',
            boxShadow:
              '0 -6px 24px rgba(236,72,153,0.32), inset 0 1px 0 rgba(255,255,255,0.2)',
            transform: pinkSkew,
            transformOrigin: 'bottom center',
          }}
        >
          {/* Pupils only */}
          <div
            ref={eyeD}
            className="absolute flex gap-3"
            style={{ left: 20, top: 34, transformOrigin: 'center' }}
          >
            {[0, 1].map(i => (
              <div
                key={i}
                className="ac-pupil rounded-full"
                style={{
                  width: 12,
                  height: 12,
                  background: '#4a0520',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                }}
              />
            ))}
          </div>
          {/* Tiny mouth */}
          <div
            className="absolute rounded-full"
            style={{
              left: 26,
              bottom: 52,
              width: 32,
              height: 3,
              background: 'rgba(74,5,32,0.5)',
            }}
          />
        </div>
      </div>

      {/* Floor line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)',
        }}
      />
    </div>
  )
})

export default AuthCharacters
