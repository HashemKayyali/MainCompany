'use client'

import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Link } from '@/i18n/navigation'

/**
 * CAT-024 — shared inner-page hero (VERBATIM port of the Vite `EventiesHero`).
 * White text over the fixed MeshGradient backdrop; pulls up under the
 * transparent navbar (`-mt-[var(--app-header-offset)]`). Framer fade-up
 * entrance, honours reduced-motion. Used by Products/Categories/Category/About/
 * Custom-Builds/Customers listing tops.
 */
const EASE = [0.4, 0, 0.2, 1] as const
const fadeUp = { hidden: { opacity: 0, y: 34 }, visible: { opacity: 1, y: 0 } }

export type HeroAction = { label: string; href: string }
export type HeroChip = { label: string; href: string }

export function EventiesHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  chipsLabel,
  chips = [],
  rightSlot,
  contentClassName,
}: {
  eyebrow: string
  title: ReactNode
  description: ReactNode
  primaryAction?: HeroAction
  secondaryAction?: HeroAction
  chipsLabel?: string
  chips?: HeroChip[]
  rightSlot?: ReactNode
  contentClassName?: string
}) {
  const reduce = useReducedMotion()
  const on = !reduce
  const tr = (delay = 0) => ({ duration: 0.92, delay, ease: EASE })

  return (
    <section className="relative -mt-[var(--app-header-offset)] w-full overflow-hidden text-white">
      <div
        className="eventies-hero-shell site-container-wide relative z-20 grid grid-cols-1 items-center gap-10 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-20"
        style={{ paddingTop: 'calc(var(--app-navbar-height, 74px) + clamp(1.5rem, 4vw, 3rem))' }}
      >
        <div className={`max-w-5xl ${contentClassName ?? ''}`}>
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 backdrop-blur-md"
            initial={on ? fadeUp.hidden : false}
            animate={on ? fadeUp.visible : undefined}
            transition={tr(0)}
          >
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-200" strokeWidth={2.2} />
            <span className="text-[12px] font-semibold tracking-wide text-white">{eyebrow}</span>
          </motion.div>

          <motion.h1
            className="hero-title-silver max-w-[900px] font-display text-[clamp(2.25rem,4.4vw,4.05rem)] font-bold tracking-[-0.03em]"
            initial={on ? fadeUp.hidden : false}
            animate={on ? fadeUp.visible : undefined}
            transition={tr(0.06)}
          >
            {title}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-[1rem] font-medium leading-[1.7] text-white/85 sm:text-[1.05rem]"
            initial={on ? fadeUp.hidden : false}
            animate={on ? fadeUp.visible : undefined}
            transition={tr(0.14)}
          >
            {description}
          </motion.p>

          {(primaryAction || secondaryAction) && (
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3.5"
              initial={on ? fadeUp.hidden : false}
              animate={on ? fadeUp.visible : undefined}
              transition={tr(0.22)}
            >
              {primaryAction && (
                <Link
                  href={primaryAction.href}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-3.5 text-[13px] font-bold text-white shadow-[0_18px_44px_-16px_rgba(192,38,211,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-fuchsia-400"
                >
                  {primaryAction.label}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    strokeWidth={2.4}
                  />
                </Link>
              )}
              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/[0.07] px-8 py-3.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-300/60 hover:bg-white/12"
                >
                  {secondaryAction.label}
                </Link>
              )}
            </motion.div>
          )}

          {chips.length > 0 && (
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-2"
              initial={on ? fadeUp.hidden : false}
              animate={on ? fadeUp.visible : undefined}
              transition={tr(0.3)}
            >
              {chipsLabel && (
                <span className="me-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">
                  {chipsLabel}
                </span>
              )}
              {chips.map((chip) => (
                <Link
                  key={chip.href}
                  href={chip.href}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1.5 text-[11.5px] font-semibold text-white/90 backdrop-blur-sm transition-all hover:border-fuchsia-300/55 hover:bg-white/15 hover:text-white"
                >
                  {chip.label}
                </Link>
              ))}
            </motion.div>
          )}
        </div>

        {rightSlot && (
          <motion.div
            initial={on ? { opacity: 0, y: 40, scale: 0.985 } : false}
            animate={on ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={tr(0.08)}
            className="relative"
          >
            {rightSlot}
          </motion.div>
        )}
      </div>
    </section>
  )
}
