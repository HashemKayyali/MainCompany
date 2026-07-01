import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck, Sparkles, Store } from 'lucide-react'
import { useCategoriesData } from '../../contexts/DataContext'
import { useHeroEntranceMotion } from '../../hooks/useHeroEntranceMotion'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import { preloadRoute } from '../../utils/route-preload'
import { useI18n } from '../../contexts/LanguageContext'

const HERO_IMAGE = '/images/hero-bg-event.webp'
const HERO_FALLBACK_IMAGE = '/images/image-fallback.svg'
const EASE = [0.4, 0, 0.2, 1] as const
const heroFadeUp = {
  hidden: { opacity: 0, y: 34 },
  visible: { opacity: 1, y: 0 },
}

const heroTransition = (delay = 0) => ({ duration: 0.92, delay, ease: EASE })

const PulsingBorder = lazy(() =>
  import('@paper-design/shaders-react').then(module => ({ default: module.PulsingBorder }))
)

export default function Hero({ image = HERO_IMAGE }: { image?: string }) {
  const { categories } = useCategoriesData()
  const { translateText } = useI18n()
  const motionEnabled = useMotionEnabled()
  const heroEntrance = useHeroEntranceMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  const shadersOn = mounted && motionEnabled

  const chips = useMemo(
    () => categories.filter(category => category.slug.trim().length > 0).slice(0, 5),
    [categories]
  )

  const float = (delay: number) =>
    motionEnabled
      ? { animate: { y: [0, -9, 0] }, transition: { duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay } }
      : {}

  return (
    <section className="relative w-full overflow-hidden">
      {/* Content */}
      <div
        className="eventies-hero-shell site-container-wide relative z-20 grid grid-cols-1 items-center gap-10 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:pb-20"
        style={{ paddingTop: 'calc(var(--app-navbar-height, 72px) + clamp(1.5rem, 4vw, 3rem))' }}
      >
        {/* ── LEFT ── */}
        <div className="max-w-5xl">
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.08] px-4 py-2 backdrop-blur-md"
            initial={heroEntrance ? heroFadeUp.hidden : false}
            animate={heroEntrance ? heroFadeUp.visible : undefined}
            transition={heroTransition(0)}
          >
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-200" strokeWidth={2.2} />
            <span className="text-[12px] font-semibold tracking-wide text-white">
              {translateText('Event Services Marketplace · Jordan')}
            </span>
          </motion.div>

          {/* Headline — crisp, no blur glow */}
          <motion.h1
            className="hero-title-silver max-w-[960px] font-display text-[clamp(2.45rem,5vw,4.35rem)] font-bold tracking-[-0.03em]"
            initial={heroEntrance ? heroFadeUp.hidden : false}
            animate={heroEntrance ? heroFadeUp.visible : undefined}
            transition={heroTransition(0.06)}
          >
            {translateText('Plan and request event services from one organized marketplace.')}
          </motion.h1>

          <motion.p
            className="mt-6 max-w-2xl text-[1rem] font-medium leading-[1.7] text-white/85 sm:text-[1.05rem]"
            initial={heroEntrance ? heroFadeUp.hidden : false}
            animate={heroEntrance ? heroFadeUp.visible : undefined}
            transition={heroTransition(0.14)}
          >
            {translateText('Explore event rentals, interactive activations, screens, booths, production support, and custom setups across Jordan — then submit a rental or purchase quote request for review.')}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3.5"
            initial={heroEntrance ? heroFadeUp.hidden : false}
            animate={heroEntrance ? heroFadeUp.visible : undefined}
            transition={heroTransition(0.22)}
          >
            <Link
              to="/products"
              onMouseEnter={() => preloadRoute('/products')}
              onFocus={() => preloadRoute('/products')}
              className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-8 py-3.5 text-[13px] font-bold text-white shadow-[0_18px_44px_-16px_rgba(192,38,211,0.7)] transition-all duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-fuchsia-400"
            >
              {translateText('Explore Services')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
            </Link>
            <Link
              to="/contact"
              onMouseEnter={() => preloadRoute('/contact')}
              onFocus={() => preloadRoute('/contact')}
              className="inline-flex items-center rounded-full border border-white/30 bg-white/[0.07] px-8 py-3.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-fuchsia-300/60 hover:bg-white/12"
            >
              {translateText('Request a Quote')}
            </Link>
          </motion.div>

          {chips.length > 0 && (
            <motion.div
              className="mt-8 flex flex-wrap items-center gap-2"
              initial={heroEntrance ? heroFadeUp.hidden : false}
              animate={heroEntrance ? heroFadeUp.visible : undefined}
              transition={heroTransition(0.3)}
            >
              <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/50">{translateText('Browse')}</span>
              {chips.map(category => {
                const href = `/categories/${encodeURIComponent(category.slug)}`
                return (
                  <Link
                    key={category.id}
                    to={href}
                    onMouseEnter={() => preloadRoute(href)}
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/[0.08] px-3.5 py-1.5 text-[11.5px] font-semibold text-white/90 backdrop-blur-sm transition-all hover:border-fuchsia-300/55 hover:bg-white/15 hover:text-white"
                  >
                    {translateText(category.name)}
                  </Link>
                )
              })}
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: showcase card ── */}
        <motion.div
          className="relative"
          initial={heroEntrance ? { opacity: 0, y: 40, scale: 0.985 } : false}
          animate={heroEntrance ? { opacity: 1, y: 0, scale: 1 } : undefined}
          transition={heroTransition(0.08)}
        >
          <div
            className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-3 backdrop-blur-xl"
            style={{ boxShadow: '0 40px 90px -34px rgba(8,3,26,0.8), inset 0 1px 0 rgba(255,255,255,0.18)' }}
          >
            <div className="relative overflow-hidden rounded-[22px]">
              <img
                src={image}
                alt="A vibrant event powered by Eventies providers"
                width={960}
                height={720}
                draggable={false}
                loading="eager"
                decoding="async"
                {...{ fetchpriority: 'high' }}
                className="h-[300px] w-full object-cover object-center sm:h-[360px] lg:h-[420px]"
                style={{ filter: 'saturate(1.1) contrast(1.04)' }}
                onError={event => {
                  const target = event.currentTarget
                  if (target.dataset.fallbackHero === 'true') return
                  target.dataset.fallbackHero = 'true'
                  target.src = HERO_FALLBACK_IMAGE
                }}
              />
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(180deg, rgba(8,3,26,0.28) 0%, transparent 30%, transparent 55%, rgba(8,3,26,0.7) 100%)' }}
              />

              {/* Live badge */}
              <div className="absolute right-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 backdrop-blur-md">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.9)' }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/90">{translateText('Trusted across Jordan')}</span>
              </div>

              {/* For Clients — floating */}
              <motion.div className="absolute left-3.5 top-14 w-[208px]" {...float(0)}>
                <div className="rounded-[16px] border border-white/20 bg-white/[0.12] p-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[11px]" style={{ background: 'linear-gradient(135deg,#7c3aed,#c026d3)' }}>
                      <CalendarCheck className="h-5 w-5 text-white" strokeWidth={2} />
                    </span>
                    <div>
                      <div className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-fuchsia-100">{translateText('For Clients')}</div>
                      <div className="text-[12px] font-bold text-white">{translateText('Browse & Request')}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* For Providers — floating */}
              <motion.div className="absolute bottom-16 right-3.5 w-[208px]" {...float(1.2)}>
                <div className="rounded-[16px] border border-white/20 bg-white/[0.12] p-3 backdrop-blur-xl">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-[11px]" style={{ background: 'linear-gradient(135deg,#a855f7,#7126e3)' }}>
                      <Store className="h-5 w-5 text-white" strokeWidth={2} />
                    </span>
                    <div>
                      <div className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-violet-100">{translateText('For Providers')}</div>
                      <div className="text-[12px] font-bold text-white">{translateText('Grow with Us')}</div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Pulsing rotating identity badge */}
              {shadersOn && (
                <div className="absolute bottom-3.5 left-3.5">
                  <div className="relative flex h-16 w-16 items-center justify-center">
                    <Suspense fallback={null}>
                      <PulsingBorder
                        colors={['#7126e3', '#a855f7', '#c026d3', '#8344f5', '#d946ef', '#ffffff']}
                        colorBack="#00000000"
                        speed={1.5}
                        roundness={1}
                        thickness={0.1}
                        softness={0.2}
                        intensity={5}
                        spotSize={0.1}
                        pulse={0.1}
                        smoke={0.5}
                        smokeSize={4}
                        scale={0.6}
                        style={{ width: '48px', height: '48px', borderRadius: '50%' }}
                      />
                    </Suspense>
                    <motion.svg
                      className="absolute inset-0 h-full w-full"
                      viewBox="0 0 100 100"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                      style={{ transform: 'scale(1.55)' }}
                    >
                      <defs>
                        <path id="hero-card-circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                      </defs>
                      <text className="fill-white/85 text-[8px] font-bold uppercase tracking-[0.12em]">
                        <textPath href="#hero-card-circle" startOffset="0%">
                          Eventies · Plan · Request · Celebrate ·
                        </textPath>
                      </text>
                    </motion.svg>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom info strip — what we offer */}
            <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-[12px] font-black text-white">E</span>
                <span className="font-display text-[13px] font-bold text-white">Eventies</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {['Games', 'VR', 'LED Screens', 'Booths', 'Production'].map(tag => (
                  <span key={tag} className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/80">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
