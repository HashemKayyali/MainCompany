import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, Building2, GraduationCap, PartyPopper, Rocket, Store, Tent } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../utils/cn'
import { preloadRoute } from '../../utils/route-preload'
import Reveal from './Reveal'
import SectionHeading from './SectionHeading'

type EventType = {
  label: string
  description: string
  gradient: string
  icon: LucideIcon
  image: string
}

// Static, generic event types — intentionally not tied to catalog data.
const eventTypes: EventType[] = [
  {
    label: 'Corporate Activations',
    description: 'Engaging brand moments and interactive experiences for company events.',
    gradient: 'linear-gradient(145deg, #2a0a63 0%, #5d18c4 60%, #7126e3 100%)',
    icon: Building2,
    image: '/images/Corporate-card.webp',
  },
  {
    label: 'Exhibitions & Expos',
    description: 'Stand-out displays and production for fairs and trade shows.',
    gradient: 'linear-gradient(145deg, #4912a0 0%, #7126e3 60%, #a855f7 100%)',
    icon: Store,
    image: '/images/Exhibitions-card.webp',
  },
  {
    label: 'Private Events',
    description: 'Memorable touches for celebrations and gatherings.',
    gradient: 'linear-gradient(145deg, #5d18c4 0%, #8344f5 100%)',
    icon: PartyPopper,
    image: '/images/Private-Events-card.webp',
  },
  {
    label: 'Brand Launches',
    description: 'Make an entrance with high-impact activations.',
    gradient: 'linear-gradient(145deg, #7126e3 0%, #c026d3 100%)',
    icon: Rocket,
    image: '/images/Brand-card.webp',
  },
  {
    label: 'University & Campus',
    description: 'Energetic experiences built for student audiences.',
    gradient: 'linear-gradient(145deg, #190453 0%, #4912a0 60%, #7126e3 100%)',
    icon: GraduationCap,
    image: '/images/University-card.webp',
  },
  {
    label: 'Festivals & Public Events',
    description: 'Crowd-ready displays, production, and activations at scale.',
    gradient: 'linear-gradient(145deg, #4912a0 0%, #7126e3 50%, #c026d3 100%)',
    icon: Tent,
    image: '/images/Festivals-card.webp',
  },
]

function EventOption({
  type,
  active,
  visible,
  onSelect,
}: {
  type: EventType
  active: boolean
  visible: boolean
  onSelect: () => void
}) {
  const Icon = type.icon

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-[22px] bg-ink-900 shadow-[0_18px_44px_-30px_rgba(20,8,50,0.72)] transition-[flex,opacity,transform,box-shadow,height] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] lg:h-[27rem] lg:min-h-[5.8rem] lg:min-w-[4.7rem] lg:rounded-[24px]',
        active
          ? 'h-[12.4rem] shadow-[0_24px_58px_-32px_rgba(20,8,50,0.78)] lg:flex-[6.8_1_0%]'
          : 'h-[6.7rem] lg:flex-[1_1_0%]'
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
        aria-label={`Show ${type.label}`}
        aria-pressed={active}
        className="relative flex h-full w-full cursor-pointer flex-col justify-end overflow-hidden p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base sm:p-5"
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          aria-hidden="true"
        >
          <img
            src={type.image}
            alt=""
            width={1400}
            height={876}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="h-full w-full object-cover brightness-[0.82] saturate-[1.02] transition duration-700 group-hover:brightness-[0.95] group-hover:saturate-[1.08]"
          />
          <div
            className="absolute inset-0 transition-opacity duration-700"
            style={{ background: type.gradient, opacity: active ? 0.13 : 0.19 }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(13,4,36,0.82)_0%,rgba(13,4,36,0.38)_48%,rgba(13,4,36,0.12)_100%)] opacity-80 transition-opacity duration-700 group-hover:opacity-[0.62]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-900/92 via-ink-900/42 to-transparent" />
          <div className="absolute -left-28 top-0 h-full w-24 rotate-12 bg-white/[0.08] blur-2xl transition-transform duration-700 ease-out group-hover:translate-x-[42rem]" />
        </div>

        <Icon
          className="pointer-events-none absolute -right-4 -top-4 h-24 w-24 text-white/10 transition-all duration-700 group-hover:scale-110 group-hover:text-white/16 sm:h-28 sm:w-28"
          strokeWidth={1.4}
          aria-hidden="true"
        />

        <div className="relative flex min-w-0 items-end gap-3 pr-10 lg:pr-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink-900/58 text-white shadow-[0_12px_26px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-500 group-hover:bg-ink-900/44 sm:h-12 sm:w-12">
            <Icon className="h-5 w-5" strokeWidth={2} />
          </span>

          <div
            className={cn(
              'min-w-0 pb-0.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
              active
                ? 'translate-x-0 opacity-100 lg:w-auto'
                : 'translate-x-0 opacity-100 lg:w-0 lg:translate-x-6 lg:opacity-0'
            )}
          >
            <h3 className="font-display text-[1.08rem] font-bold leading-tight tracking-[-0.025em] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] sm:text-[1.35rem] lg:whitespace-nowrap">
              {type.label}
            </h3>
            <p
              className={cn(
                'mt-1.5 max-w-[27rem] text-[11.5px] font-semibold leading-[1.55] text-white/90 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:text-xs',
                active ? 'line-clamp-2' : 'hidden lg:block'
              )}
            >
              {type.description}
            </p>
          </div>
        </div>
      </button>

      <Link
        to="/products"
        onMouseEnter={() => preloadRoute('/products')}
        onFocus={() => preloadRoute('/products')}
        aria-label={`Browse products for ${type.label}`}
        className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-ink-900/54 text-white shadow-[0_14px_30px_-18px_rgba(0,0,0,0.9)] backdrop-blur-md transition-all duration-500 hover:bg-ink-900/38 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-violet-300 lg:opacity-0 lg:group-hover:opacity-100"
        style={{
          pointerEvents: active ? 'auto' : 'none',
          transform: active ? 'translateY(0)' : 'translateY(8px)',
          opacity: active ? undefined : 0,
        }}
      >
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
      </Link>
    </div>
  )
}

export default function EventTypes() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [visibleOptions, setVisibleOptions] = useState<number[]>([])

  useEffect(() => {
    const timers = eventTypes.map((_, index) =>
      window.setTimeout(() => {
        setVisibleOptions(prev => (prev.includes(index) ? prev : [...prev, index]))
      }, 120 * index)
    )

    return () => timers.forEach(timer => window.clearTimeout(timer))
  }, [])

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow="Plan by event type"
          title="Built for every occasion"
          description="However you gather people, there's a way to make it memorable. Start from the kind of event you're planning."
          className="mb-12"
        />

        <Reveal y={24}>
          <div className="flex flex-col gap-3 lg:h-[27rem] lg:flex-row lg:items-stretch lg:gap-3">
            {eventTypes.map((type, index) => (
              <EventOption
                key={type.label}
                type={type}
                active={activeIndex === index}
                visible={visibleOptions.includes(index)}
                onSelect={() => setActiveIndex(index)}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
