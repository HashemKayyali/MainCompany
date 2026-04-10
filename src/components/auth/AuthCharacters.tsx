import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { usePerfMode } from '../../hooks/usePerfMode'

interface Props {
  isTyping: boolean
  passwordHidden: boolean  // password has value but is masked
  passwordVisible: boolean // password is unmasked
}

/**
 * Four brand-coloured abstract characters whose eyes track the cursor.
 *
 * Performance notes:
 * - Eyes are driven by direct DOM manipulation inside a rAF loop — zero React re-renders
 * - Body lean/pose changes are React state (rare, prop-driven)
 * - Disabled entirely on touch devices, perfLow mode, and reduced-motion preference
 * - rAF loop is started once on mount and cancelled on unmount
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

  const shouldTrack = !reduceMotion && !perfLow && !isTouchDevice

  // Eye container refs — one per character
  const eyeA = useRef<HTMLDivElement>(null) // violet tall
  const eyeB = useRef<HTMLDivElement>(null) // void pillar
  const eyeC = useRef<HTMLDivElement>(null) // cyan dome (pupils only)
  const eyeD = useRef<HTMLDivElement>(null) // pink capsule (pupils only)

  const mouseRef = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  // When a special state is active, override the tracking direction
  // null = use live mouse; otherwise use a fixed offset
  const forcedRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (passwordHidden) {
      // Characters peek toward the password field (down-right)
      forcedRef.current = { x: 3, y: 4 }
    } else if (passwordVisible) {
      // Characters look away (leftward, slightly up — embarrassed)
      forcedRef.current = { x: -5, y: -2 }
    } else if (isTyping) {
      // Look toward the form (right side)
      forcedRef.current = { x: 4, y: 1 }
    } else {
      forcedRef.current = null
    }
  }, [passwordHidden, passwordVisible, isTyping])

  const startLoop = useCallback(() => {
    if (!shouldTrack) return

    const refs = [
      { ref: eyeA, max: 5 },
      { ref: eyeB, max: 4 },
      { ref: eyeC, max: 4 },
      { ref: eyeD, max: 4 },
    ]

    const loop = () => {
      const forced = forcedRef.current
      const { x: mx, y: my } = mouseRef.current

      refs.forEach(({ ref, max }) => {
        const el = ref.current
        if (!el) return

        let ex: number, ey: number
        if (forced) {
          ex = forced.x
          ey = forced.y
        } else {
          const rect = el.getBoundingClientRect()
          const cx = rect.left + rect.width / 2
          const cy = rect.top + rect.height / 2
          const dx = mx - cx
          const dy = my - cy
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (!dist) { ex = 0; ey = 0 }
          else {
            const clamped = Math.min(dist, max)
            ex = (dx / dist) * clamped
            ey = (dy / dist) * clamped
          }
        }

        el.querySelectorAll<HTMLElement>('.ac-pupil').forEach(p => {
          p.style.transform = `translate(${ex.toFixed(1)}px,${ey.toFixed(1)}px)`
        })
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
  }, [shouldTrack])

  useEffect(() => {
    const cleanup = startLoop()
    return cleanup
  }, [startLoop])

  // ── Pose config driven by props ───────────────────────────────────────────
  // Violet tall — rises and leans when password is typed
  const violetH = passwordHidden ? 265 : 230
  const violetSkew = passwordHidden
    ? 'skewX(-11deg) translateX(22px)'
    : isTyping
    ? 'skewX(-3deg)'
    : 'skewX(0deg)'

  // Void pillar — leans toward the form when typing
  const pillarSkew = isTyping
    ? 'skewX(7deg)'
    : passwordHidden
    ? 'skewX(9deg) translateX(8px)'
    : 'skewX(0deg)'

  // Cyan dome — subtle lean
  const domeSkew = isTyping ? 'skewX(-2deg)' : 'skewX(0deg)'

  // Pink capsule — leans when typing
  const pinkSkew = isTyping ? 'skewX(4deg)' : 'skewX(0deg)'

  return (
    <div
      className="relative mx-auto select-none"
      style={{ width: 340, height: 280 }}
      aria-hidden="true"
    >
      {/* ── Character A: Violet tall (back-left) ── */}
      <div
        className="absolute bottom-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: 28,
          width: 84,
          height: violetH,
          background: 'linear-gradient(180deg,#8b5cf6 0%,#7c3aed 60%,#6d28d9 100%)',
          borderRadius: '42px 42px 0 0',
          boxShadow: '0 -8px 32px rgba(124,58,237,0.38), inset 0 1px 0 rgba(255,255,255,0.16)',
          zIndex: 1,
          transform: violetSkew,
          transformOrigin: 'bottom center',
        }}
      >
        {/* Eye sockets */}
        <div
          ref={eyeA}
          className="absolute flex gap-2.5"
          style={{ left: 18, top: passwordHidden ? 22 : 30 }}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              className="rounded-full flex items-center justify-center overflow-hidden"
              style={{ width: 17, height: 17, background: 'rgba(255,255,255,0.93)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)' }}
            >
              <div
                className="ac-pupil rounded-full"
                style={{ width: 9, height: 9, background: '#1a0a3e', transition: 'transform 0.08s ease-out' }}
              />
            </div>
          ))}
        </div>
        {/* Subtle mouth hint */}
        {!passwordHidden && (
          <div
            className="absolute rounded-full transition-opacity duration-300"
            style={{ left: 24, bottom: 48, width: 36, height: 3, background: 'rgba(255,255,255,0.22)' }}
          />
        )}
      </div>

      {/* ── Character B: Void pillar (center-back) ── */}
      <div
        className="absolute bottom-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: 152,
          width: 62,
          height: 196,
          background: 'linear-gradient(180deg,#1e1045 0%,#130d2e 100%)',
          borderRadius: '31px 31px 0 0',
          border: '1px solid rgba(139,92,246,0.24)',
          boxShadow: '0 -4px 20px rgba(79,44,200,0.22), inset 0 1px 0 rgba(139,92,246,0.18)',
          zIndex: 2,
          transform: pillarSkew,
          transformOrigin: 'bottom center',
        }}
      >
        <div
          ref={eyeB}
          className="absolute flex gap-2"
          style={{ left: 12, top: 28 }}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              className="rounded-full flex items-center justify-center overflow-hidden"
              style={{ width: 15, height: 15, background: 'rgba(255,255,255,0.88)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15)' }}
            >
              <div
                className="ac-pupil rounded-full"
                style={{ width: 8, height: 8, background: '#0a0520', transition: 'transform 0.08s ease-out' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Character C: Cyan dome (front-left) ── */}
      <div
        className="absolute bottom-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: 0,
          width: 160,
          height: 126,
          background: 'linear-gradient(180deg,#22d3ee 0%,#06b6d4 55%,#0891b2 100%)',
          borderRadius: '80px 80px 0 0',
          boxShadow: '0 -6px 24px rgba(6,182,212,0.32), inset 0 1px 0 rgba(255,255,255,0.22)',
          zIndex: 3,
          transform: domeSkew,
          transformOrigin: 'bottom center',
        }}
      >
        {/* Pupils only (no sclera — sits on cyan body) */}
        <div
          ref={eyeC}
          className="absolute flex gap-4"
          style={{ left: 38, top: 48 }}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              className="ac-pupil rounded-full"
              style={{ width: 13, height: 13, background: '#083344', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', transition: 'transform 0.08s ease-out' }}
            />
          ))}
        </div>
      </div>

      {/* ── Character D: Pink capsule (front-right) ── */}
      <div
        className="absolute bottom-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: 248,
          width: 88,
          height: 178,
          background: 'linear-gradient(180deg,#f472b6 0%,#ec4899 55%,#db2777 100%)',
          borderRadius: '44px 44px 0 0',
          boxShadow: '0 -6px 24px rgba(236,72,153,0.32), inset 0 1px 0 rgba(255,255,255,0.2)',
          zIndex: 3,
          transform: pinkSkew,
          transformOrigin: 'bottom center',
        }}
      >
        {/* Pupils only */}
        <div
          ref={eyeD}
          className="absolute flex gap-3"
          style={{ left: 20, top: 34 }}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              className="ac-pupil rounded-full"
              style={{ width: 12, height: 12, background: '#4a0520', boxShadow: '0 1px 3px rgba(0,0,0,0.4)', transition: 'transform 0.08s ease-out' }}
            />
          ))}
        </div>
        {/* Tiny mouth */}
        <div
          className="absolute rounded-full"
          style={{ left: 26, bottom: 52, width: 32, height: 3, background: 'rgba(74,5,32,0.5)' }}
        />
      </div>

      {/* Floor line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }}
      />
    </div>
  )
})

export default AuthCharacters
