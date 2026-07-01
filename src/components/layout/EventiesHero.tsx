import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useHeroEntranceMotion } from '../../hooks/useHeroEntranceMotion'
import { preloadRoute } from '../../utils/route-preload'
import { cn } from '../../utils/cn'
import { useI18n } from '../../contexts/LanguageContext'

const EASE = [0.4, 0, 0.2, 1] as const
const heroFadeUp = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
}

const heroTransition = (delay = 0) => ({ duration: 0.92, delay, ease: EASE })

export type EventiesHeroAction = {
  label: string
  to?: string
  href?: string
  external?: boolean
}

export type EventiesHeroChip = {
  label: string
  to?: string
  href?: string
  onClick?: () => void
}

type EventiesHeroProps = {
  eyebrow: string
  title: ReactNode
  description: ReactNode
  primaryAction?: EventiesHeroAction
  secondaryAction?: EventiesHeroAction
  chipsLabel?: string
  chips?: EventiesHeroChip[]
  rightSlot?: ReactNode
  className?: string
  contentClassName?: string
  rightSlotClassName?: string
}

function HeroAction({ action, variant }: { action: EventiesHeroAction; variant: 'primary' | 'secondary' }) {
  const { translateText } = useI18n()
  const className =
    variant === 'primary'
      ? 'group inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-3.5 text-[13px] font-bold text-white shadow-[0_18px_44px_-16px_rgba(192,38,211,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-fuchsia-400'
      : 'inline-flex items-center justify-center rounded-full border border-white/30 bg-white/[0.07] px-8 py-3.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-300/60 hover:bg-white/12'

  const content = (
    <>
      {translateText(action.label)}
      {variant === 'primary' && (
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
      )}
    </>
  )

  if (action.to) {
    const to = action.to
    return (
      <Link
        to={to}
        onMouseEnter={() => preloadRoute(to)}
        onFocus={() => preloadRoute(to)}
        className={className}
      >
        {content}
      </Link>
    )
  }

  return (
    <a
      href={action.href ?? '#'}
      target={action.external ? '_blank' : undefined}
      rel={action.external ? 'noopener noreferrer' : undefined}
      className={className}
    >
      {content}
    </a>
  )
}

function HeroChip({ chip }: { chip: EventiesHeroChip }) {
  const { translateText } = useI18n()
  const className =
    'inline-flex items-center rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1.5 text-[11.5px] font-semibold text-white/90 backdrop-blur-sm transition-all hover:border-fuchsia-300/55 hover:bg-white/15 hover:text-white'

  if (chip.to) {
    const to = chip.to
    return (
      <Link to={to} onMouseEnter={() => preloadRoute(to)} onFocus={() => preloadRoute(to)} className={className}>
        {translateText(chip.label)}
      </Link>
    )
  }

  if (chip.href) {
    return (
      <a href={chip.href} className={className}>
        {translateText(chip.label)}
      </a>
    )
  }

  if (chip.onClick) {
    return (
      <button type="button" onClick={chip.onClick} className={className}>
        {translateText(chip.label)}
      </button>
    )
  }

  return <span className={className}>{translateText(chip.label)}</span>
}

export default function EventiesHero({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  chipsLabel = 'Browse',
  chips = [],
  rightSlot,
  className,
  contentClassName,
  rightSlotClassName,
}: EventiesHeroProps) {
  const heroEntrance = useHeroEntranceMotion()
  const { translateText } = useI18n()
  const translateNode = (value: ReactNode) => (typeof value === 'string' ? translateText(value) : value)

  return (
    <section className={cn('relative -mt-[var(--app-header-offset)] w-full overflow-hidden', className)}>
      <div
        className="eventies-hero-shell site-container-wide relative z-20 grid grid-cols-1 items-center gap-10 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-20"
        style={{ paddingTop: 'calc(var(--app-navbar-height, 72px) + clamp(1.5rem, 4vw, 3rem))' }}
      >
        <div className={cn('max-w-5xl', contentClassName)}>
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 backdrop-blur-md"
            initial={heroEntrance ? heroFadeUp.hidden : false}
            animate={heroEntrance ? heroFadeUp.visible : undefined}
            transition={heroTransition(0)}
          >
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-200" strokeWidth={2.2} />
            <span className="text-[12px] font-semibold tracking-wide text-white">{translateText(eyebrow)}</span>
          </motion.div>

          <motion.h1
            className="hero-title-silver max-w-[900px] font-display text-[clamp(2.25rem,4.4vw,4.05rem)] font-bold tracking-[-0.03em]"
            initial={heroEntrance ? heroFadeUp.hidden : false}
            animate={heroEntrance ? heroFadeUp.visible : undefined}
            transition={heroTransition(0.06)}
          >
            {translateNode(title)}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-[1rem] font-medium leading-[1.7] text-white/85 sm:text-[1.05rem]"
            initial={heroEntrance ? heroFadeUp.hidden : false}
            animate={heroEntrance ? heroFadeUp.visible : undefined}
            transition={heroTransition(0.14)}
          >
            {translateNode(description)}
          </motion.p>

          {(primaryAction || secondaryAction) && (
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-3.5"
              initial={heroEntrance ? heroFadeUp.hidden : false}
              animate={heroEntrance ? heroFadeUp.visible : undefined}
              transition={heroTransition(0.22)}
            >
              {primaryAction && <HeroAction action={primaryAction} variant="primary" />}
              {secondaryAction && <HeroAction action={secondaryAction} variant="secondary" />}
            </motion.div>
          )}

          {chips.length > 0 && (
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-2"
              initial={heroEntrance ? heroFadeUp.hidden : false}
              animate={heroEntrance ? heroFadeUp.visible : undefined}
              transition={heroTransition(0.3)}
            >
              <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{translateText(chipsLabel)}</span>
              {chips.map(chip => (
                <HeroChip key={chip.label} chip={chip} />
              ))}
            </motion.div>
          )}
        </div>

        {rightSlot && (
          <motion.div
            initial={heroEntrance ? { opacity: 0, y: 40, scale: 0.985 } : false}
            animate={heroEntrance ? { opacity: 1, y: 0, scale: 1 } : undefined}
            transition={heroTransition(0.08)}
            className={cn('relative', rightSlotClassName)}
          >
            {rightSlot}
          </motion.div>
        )}
      </div>
    </section>
  )
}
