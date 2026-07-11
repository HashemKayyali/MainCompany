'use client'

import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Building2,
  GraduationCap,
  PartyPopper,
  Rocket,
  Store,
  Tent,
  type LucideIcon,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { SmartImage } from '@/components/ui/SmartImage'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from './SectionHeading'

/**
 * CAT-026 — Plan by event type (client island). VERBATIM port of the Vite
 * EventTypes expanding-accordion: one active card grows (width on desktop,
 * height on mobile), staggered reveal, ghost corner icon, arrow deep-link.
 * Copy is localized (EN + AR) via next-intl.
 */
type EventVisual = { gradient: string; icon: LucideIcon; image: string }

const VISUALS: EventVisual[] = [
  {
    gradient: 'linear-gradient(145deg, #2a0a63 0%, #5d18c4 60%, #7126e3 100%)',
    icon: Building2,
    image: '/images/Corporate-card.webp',
  },
  {
    gradient: 'linear-gradient(145deg, #4912a0 0%, #7126e3 60%, #a855f7 100%)',
    icon: Store,
    image: '/images/Exhibitions-card.webp',
  },
  {
    gradient: 'linear-gradient(145deg, #5d18c4 0%, #8344f5 100%)',
    icon: PartyPopper,
    image: '/images/Private-Events-card.webp',
  },
  {
    gradient: 'linear-gradient(145deg, #7126e3 0%, #c026d3 100%)',
    icon: Rocket,
    image: '/images/Brand-card.webp',
  },
  {
    gradient: 'linear-gradient(145deg, #190453 0%, #4912a0 60%, #7126e3 100%)',
    icon: GraduationCap,
    image: '/images/University-card.webp',
  },
  {
    gradient: 'linear-gradient(145deg, #4912a0 0%, #7126e3 50%, #c026d3 100%)',
    icon: Tent,
    image: '/images/Festivals-card.webp',
  },
]

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

function EventOption({
  visual,
  label,
  description,
  active,
  visible,
  onSelect,
  showLabel,
  browseLabel,
}: {
  visual: EventVisual
  label: string
  description: string
  active: boolean
  visible: boolean
  onSelect: () => void
  showLabel: string
  browseLabel: string
}) {
  const Icon = visual.icon
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[22px] bg-ink-900 shadow-[0_18px_44px_-30px_rgba(20,8,50,0.72)] transition-[flex-grow,flex-basis,height,box-shadow] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] lg:h-[28rem] lg:rounded-[24px]',
        active
          ? 'h-[16.5rem] shadow-[0_24px_58px_-32px_rgba(20,8,50,0.78)] sm:h-[17.5rem] lg:flex-[5_1_0%]'
          : 'h-[8.6rem] sm:h-[9.4rem] lg:flex-[1_1_0%] lg:min-w-[7.75rem] xl:min-w-[8.75rem] 2xl:min-w-[10rem]'
      )}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : 'translate3d(-28px,0,0)',
        zIndex: active ? 10 : 1,
      }}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-label={showLabel}
        aria-pressed={active}
        className="relative flex h-full w-full cursor-pointer flex-col justify-end overflow-hidden p-4 text-start outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base sm:p-5 lg:p-[1.15rem] xl:p-6"
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          aria-hidden="true"
        >
          <SmartImage
            media={visual.image}
            alt=""
            fill
            loading="lazy"
            sizes="(max-width: 1024px) 100vw, 40vw"
            className="h-full w-full object-cover brightness-[0.82] saturate-[1.02] transition duration-700 group-hover:brightness-[0.95] group-hover:saturate-[1.08]"
          />
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ background: visual.gradient, opacity: active ? 0.13 : 0.19 }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,4,36,0.82)_0%,rgba(13,4,36,0.38)_48%,rgba(13,4,36,0.12)_100%)] opacity-80 transition-opacity duration-700 group-hover:opacity-[0.62]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink-900/95 via-ink-900/55 to-transparent" />
        </div>

        <Icon
          className="pointer-events-none absolute -end-4 -top-4 h-24 w-24 text-white/10 transition-all duration-700 group-hover:scale-110 group-hover:text-white/16 sm:h-28 sm:w-28"
          strokeWidth={1.4}
          aria-hidden="true"
        />

        <div className="relative z-10 flex min-w-0 flex-col justify-end gap-1.5">
          <p
            aria-hidden={!active}
            className={cn(
              'overflow-hidden text-[11.5px] font-semibold leading-[1.55] text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-[max-height,opacity,transform,filter] ease-[cubic-bezier(0.22,1,0.36,1)] sm:text-xs lg:text-[12px]',
              active
                ? 'max-h-24 translate-y-0 opacity-100 blur-0 delay-200 duration-[450ms] lg:delay-[240ms]'
                : 'pointer-events-none max-h-0 translate-y-1 opacity-0 blur-[2px] delay-0 duration-150'
            )}
          >
            {description}
          </p>
          <h3 className="min-w-0 font-display text-[1.05rem] font-bold leading-[1.16] tracking-[-0.025em] text-white [overflow-wrap:anywhere] [text-wrap:balance] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-[1.15rem] lg:text-[0.92rem] xl:text-[1.02rem] 2xl:text-[1.2rem]">
            {label}
          </h3>
        </div>
      </button>

      <Link
        href="/products"
        aria-label={browseLabel}
        className="absolute end-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ink-900/54 text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-500 hover:bg-ink-900/38 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-violet-300 lg:end-5 lg:top-5"
        style={{
          pointerEvents: active ? 'auto' : 'none',
          transform: active ? 'translateY(0)' : 'translateY(-6px)',
          opacity: active ? 1 : 0,
        }}
      >
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
      </Link>
    </div>
  )
}

type EventItem = { label: string; description: string }

export function EventTypes() {
  const t = useTranslations('catalog.home')
  const items = t.raw('eventTypesSection.items') as EventItem[]
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleOptions, setVisibleOptions] = useState<number[]>([])

  useEffect(() => {
    const timers = items.map((_, index) =>
      window.setTimeout(() => {
        setVisibleOptions((prev) => (prev.includes(index) ? prev : [...prev, index]))
      }, 120 * index)
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [items])

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow={t('eventTypesSection.eyebrow')}
          title={t('eventTypesSection.title')}
          description={t('eventTypesSection.description')}
          className="mb-12"
        />
        <Reveal y={24}>
          <div className="flex flex-col gap-3 lg:h-[28rem] lg:flex-row lg:items-stretch lg:gap-3">
            {items.map((item, index) => (
              <EventOption
                key={item.label}
                visual={VISUALS[index % VISUALS.length] as EventVisual}
                label={item.label}
                description={item.description}
                active={activeIndex === index}
                visible={visibleOptions.includes(index)}
                onSelect={() => setActiveIndex(index)}
                showLabel={t('eventTypesSection.showLabel', { label: item.label })}
                browseLabel={t('eventTypesSection.browseLabel', { label: item.label })}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
