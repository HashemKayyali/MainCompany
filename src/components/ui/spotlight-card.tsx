import { forwardRef, useCallback, useRef } from 'react'
import type { CSSProperties, PointerEvent } from 'react'

/**
 * useSpotlight — lightweight RAF-throttled cursor spotlight effect.
 *
 * Design decisions:
 * - Zero React re-renders: all DOM updates are direct style.setProperty calls
 * - Event-scoped: listeners are on each card, not the global document
 * - RAF-throttled: pointer position updates are capped at ~60 fps
 * - Touch-safe: SpotlightOverlay hides itself via CSS on pointer:coarse devices
 * - Motion-safe: fade transition is suppressed via prefers-reduced-motion CSS
 *
 * @example
 * const spotlight = useSpotlight()
 * <div {...spotlight.handlers}>
 *   <SpotlightOverlay ref={spotlight.overlayRef} />
 *   {children}
 * </div>
 */
export function useSpotlight(enabled = true) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number>(0)

  const onPointerMove = useCallback((e: PointerEvent<Element>) => {
    if (!enabled) return
    cancelAnimationFrame(rafId.current)
    const { clientX, clientY } = e
    const card = e.currentTarget as HTMLElement
    rafId.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect()
      card.style.setProperty('--sx', `${clientX - rect.left}px`)
      card.style.setProperty('--sy', `${clientY - rect.top}px`)
    })
  }, [enabled])

  const onPointerEnter = useCallback(() => {
    if (!enabled) return
    if (overlayRef.current) overlayRef.current.style.opacity = '1'
  }, [enabled])

  const onPointerLeave = useCallback(() => {
    if (!enabled) return
    if (overlayRef.current) overlayRef.current.style.opacity = '0'
    cancelAnimationFrame(rafId.current)
  }, [enabled])

  return { overlayRef, handlers: { onPointerMove, onPointerEnter, onPointerLeave } } as const
}

interface SpotlightOverlayProps {
  className?: string
  /** CSS color value for the glow. Defaults to a subtle violet matching the brand palette. */
  color?: string
  /** Spotlight radius in pixels. Default: 220. */
  size?: number
}

/**
 * SpotlightOverlay — absolutely-positioned glow overlay driven by useSpotlight.
 *
 * Place this as the **first child** inside the card root element.
 * The parent card must have `position: relative`.
 *
 * The `.spotlight-glow` CSS class handles visibility:
 *  - Hidden on touch (pointer:coarse) devices via media query
 *  - Transition suppressed when prefers-reduced-motion is set
 *  - z-index: 2 by default (override via className for cards with z-indexed children)
 */
export const SpotlightOverlay = forwardRef<HTMLDivElement, SpotlightOverlayProps>(
  function SpotlightOverlay({ className = '', color = 'rgba(124,58,237,0.11)', size = 220 }, ref) {
    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={`spotlight-glow pointer-events-none absolute inset-0 rounded-[inherit] ${className}`.trim()}
        style={{ '--sc': color, '--ss': `${size}px` } as CSSProperties}
      />
    )
  }
)
