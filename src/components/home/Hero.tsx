import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Building2, Sparkles } from 'lucide-react'
import { usePerfMode } from '../../hooks/usePerfMode'
import { preloadRoute } from '../../utils/route-preload'

const ease = [0.16, 1, 0.3, 1] as const

const heroStats = [
  { value: '100+', label: 'Services' },
  { value: '30+', label: 'Vendors' },
  { value: '12+', label: 'Categories' },
]

const journeySteps = [
  { label: 'Discover', num: '01' },
  { label: 'Compare', num: '02' },
  { label: 'Request', num: '03' },
]

export default function Hero() {
  const reducedMotion = useReducedMotion()
  const { perfLow } = usePerfMode()
  const motionEnabled = !reducedMotion && !perfLow
  const [heroImageReady, setHeroImageReady] = useState(false)

  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden">

      {/* ════ BACKGROUND SYSTEM ════ */}

      {/* Layer 0 – deep dark base */}
      <div className="absolute inset-0 -z-40 bg-[#030610]" />

      {/* Layer 1 – hero image (subdued atmosphere) */}
      <div className="absolute inset-0 -z-30">
        <img
          src="/images/hero-bg-event.png"
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          className={`h-full w-full object-cover transition-opacity duration-700 ${
            heroImageReady ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setHeroImageReady(true)}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(3,6,16,0.55) 0%, rgba(3,6,16,0.2) 35%, rgba(3,6,16,0.7) 75%, rgba(3,6,16,1) 100%)',
          }}
        />
      </div>

      {/* Layer 2 – atmospheric light orbs */}
      {!perfLow && (
        <>
          {/* Violet orb – upper left */}
          <div
            className={`pointer-events-none absolute -z-20${motionEnabled ? ' animate-hero-orb-violet' : ''}`}
            style={{
              left: '-5%', top: '-10%',
              width: '60%', height: '70%',
              opacity: 0.32,
              background: 'radial-gradient(circle, rgba(124,58,237,0.30) 0%, rgba(124,58,237,0.10) 40%, transparent 68%)',
              filter: 'blur(56px)',
            }}
          />

          {/* Cyan orb – upper right */}
          <div
            className={`pointer-events-none absolute -z-20${motionEnabled ? ' animate-hero-orb-cyan' : ''}`}
            style={{
              right: '-8%', top: '-15%',
              width: '50%', height: '60%',
              opacity: 0.18,
              background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.07) 38%, transparent 65%)',
              filter: 'blur(48px)',
            }}
          />

          {/* Pink orb – lower center */}
          <div
            className={`pointer-events-none absolute -z-20${motionEnabled ? ' animate-hero-orb-pink' : ''}`}
            style={{
              left: '25%', bottom: '0%',
              width: '50%', height: '50%',
              opacity: 0.14,
              background: 'radial-gradient(circle, rgba(236,72,153,0.20) 0%, rgba(236,72,153,0.06) 40%, transparent 68%)',
              filter: 'blur(60px)',
            }}
          />
        </>
      )}

      {/* Layer 3 – subtle dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.75) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          opacity: 0.022,
        }}
      />

      {/* Layer 4 – bottom fade to page background (matches AnimatedBackground base #030511) */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-80"
        style={{ background: 'linear-gradient(to top, rgba(3,5,17,0.98) 0%, rgba(3,5,17,0.84) 28%, rgba(3,5,17,0.42) 58%, transparent 100%)' }}
      />

      {/* ════ HERO CONTENT ════ */}
      <div
        className="site-container relative z-20 flex flex-1 flex-col"
        style={{ paddingTop: 'calc(var(--app-navbar-height, 72px) + clamp(0.25rem, 1.5vw, 2.5rem))' }}
      >
        <div className="grid flex-1 grid-cols-1 items-start gap-10 pb-20 pt-3 sm:pb-28 sm:pt-5 lg:grid-cols-[1fr_0.58fr] lg:items-center lg:gap-6 lg:pb-32 lg:pt-0 xl:gap-12">

          {/* ── LEFT: Text content ── */}
          <motion.div
            initial={motionEnabled ? { opacity: 0, y: 32 } : false}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            transition={motionEnabled ? { duration: 0.85, ease } : undefined}
            className="flex max-w-[44rem] flex-col"
          >
            {/* Eyebrow badge */}
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: -10 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.5, delay: 0.06, ease } : undefined}
              className="mb-4 inline-flex w-fit sm:mb-6"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/22 bg-violet-500/10 px-3 py-1.5 backdrop-blur-sm sm:gap-2.5 sm:px-4 sm:py-2">
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400"
                  style={{ boxShadow: '0 0 8px rgba(167,139,250,0.95), 0 0 18px rgba(167,139,250,0.45)' }}
                />
                <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-violet-200/82 sm:text-[10.5px] sm:tracking-[0.18em]">
                  Event Services Marketplace
                </span>
              </div>
            </motion.div>

            {/* Main heading */}
            <h1
              className="font-sans text-[clamp(2.7rem,6.2vw,5.1rem)] font-extrabold leading-[0.95] tracking-[-0.04em] text-white"
              style={{
                fontFamily: '"Alexandria", system-ui, sans-serif',
                fontKerning: 'normal',
                textRendering: 'optimizeLegibility',
              }}
            >
              <span className="block opacity-90">Book Everything</span>
              <span className="relative isolate mt-2 block pb-[0.06em] tracking-[-0.028em]">
                <span
                  className="relative z-10 inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(95deg, #c4b5fd 0%, #f0abfc 30%, #67e8f9 65%, #c4b5fd 100%)',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Your Event Needs
                </span>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-[5%] bottom-[0.02em] z-0 h-[0.24em] rounded-full opacity-75 blur-3xl"
                  style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.42), rgba(236,72,153,0.28), rgba(34,211,238,0.18))' }}
                />
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-[36rem] text-[1rem] leading-[1.82] text-white/55 sm:text-[1.08rem]">
              Find and book games, LED screens, performers, booths, rentals, and production
              services from trusted vendors — all in one place.
            </p>

            {/* Journey step pills */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={motionEnabled ? { opacity: 0, x: -12 } : false}
                  animate={motionEnabled ? { opacity: 1, x: 0 } : undefined}
                  transition={motionEnabled ? { duration: 0.42, delay: 0.22 + index * 0.07, ease } : undefined}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-sm"
                >
                  <span className="text-[10px] font-bold tracking-[0.12em] text-violet-300/72">{step.num}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/65">{step.label}</span>
                </motion.div>
              ))}
            </div>

            {/* CTAs */}
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: 16 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.56, delay: 0.3, ease } : undefined}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/products"
                onMouseEnter={() => preloadRoute('/products')}
                onFocus={() => preloadRoute('/products')}
                className="btn-primary group relative !min-h-[50px] !overflow-hidden !rounded-[18px] !px-6 !text-[12px]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[200%]" />
                Explore Services
                <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
              </Link>

              <Link
                to="/contact"
                onMouseEnter={() => preloadRoute('/contact')}
                onFocus={() => preloadRoute('/contact')}
                className="inline-flex min-h-[50px] items-center gap-2 rounded-[18px] border border-white/[0.13] bg-white/[0.07] px-6 text-[12px] font-semibold tracking-[0.01em] text-white backdrop-blur-sm transition-all hover:border-white/[0.22] hover:bg-white/[0.12]"
              >
                Talk to the Team
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: 18 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.52, delay: 0.4, ease } : undefined}
              className="mt-10 flex items-stretch gap-0"
            >
              {heroStats.map((stat, index) => (
                <div key={stat.label} className="relative flex items-center">
                  {index > 0 && (
                    <div className="mx-6 h-10 w-px bg-white/10 sm:mx-8" />
                  )}
                  <div>
                    <div className="font-display text-[clamp(1.6rem,3.8vw,2.1rem)] font-black leading-none tracking-[-0.07em] text-white">
                      {stat.value}
                    </div>
                    <div className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.18em] text-violet-300/60">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Floating card composition (desktop only) ── */}
          <div className="relative hidden h-full min-h-[480px] lg:block">

            {/* Card 1: For Clients – upper right */}
            <motion.div
              className="absolute right-0 top-[2%]"
              initial={motionEnabled ? { opacity: 0 } : false}
              animate={motionEnabled ? { opacity: 1 } : undefined}
              transition={motionEnabled ? { duration: 0.9, delay: 0.35, ease } : undefined}
            >
              <div
                className={`w-[258px] rounded-[24px] border border-white/[0.1] bg-[rgba(8,6,22,0.76)] p-5 backdrop-blur-lg${motionEnabled ? ' animate-hero-float-up' : ''}`}
                style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.05)' }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[24px]"
                  style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.65) 50%, transparent 90%)' }}
                />
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[14px]"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', boxShadow: '0 8px 24px rgba(124,58,237,0.42)' }}
                  >
                    <Sparkles className="h-5 w-5 text-white" strokeWidth={1.9} />
                  </div>
                  <div>
                    <div className="text-[9.5px] font-semibold uppercase tracking-[0.2em] text-violet-300/65">For Clients</div>
                    <div className="text-[13px] font-bold text-white">Browse & Book</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {['LED Screens & Displays', 'Games & Activations', 'Live Production'].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 rounded-[11px] border border-white/[0.06] bg-white/[0.04] px-3 py-2"
                    >
                      <div
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400"
                        style={{ boxShadow: '0 0 7px rgba(34,211,238,0.85)' }}
                      />
                      <span className="text-[11px] text-white/62">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 2: Stats – lower right */}
            <motion.div
              className="absolute bottom-[6%] right-[8%]"
              initial={motionEnabled ? { opacity: 0 } : false}
              animate={motionEnabled ? { opacity: 1 } : undefined}
              transition={motionEnabled ? { duration: 0.9, delay: 0.55, ease } : undefined}
            >
              <div
                className={`w-[200px] rounded-[20px] border border-cyan-400/[0.12] bg-[rgba(5,20,32,0.72)] p-4 backdrop-blur-lg${motionEnabled ? ' animate-hero-float-down' : ''}`}
                style={{ boxShadow: '0 20px 56px rgba(0,0,0,0.48), inset 0 1px 0 rgba(34,211,238,0.1)' }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px]"
                  style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(34,211,238,0.55) 50%, transparent 90%)' }}
                />
                <div className="mb-4 text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-300/58">
                  Platform Stats
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {heroStats.map(stat => (
                    <div key={stat.label} className="text-center">
                      <div className="font-display text-[1.2rem] font-black leading-none tracking-[-0.06em] text-white">
                        {stat.value}
                      </div>
                      <div className="mt-1 text-[8px] uppercase tracking-[0.12em] text-violet-300/55">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 3: For Providers – middle left */}
            <motion.div
              className="absolute left-0 top-[36%]"
              initial={motionEnabled ? { opacity: 0 } : false}
              animate={motionEnabled ? { opacity: 1 } : undefined}
              transition={motionEnabled ? { duration: 0.9, delay: 0.72, ease } : undefined}
            >
              <div
                className={`w-[226px] rounded-[20px] border border-white/[0.08] bg-[rgba(6,8,22,0.68)] p-4 backdrop-blur-lg${motionEnabled ? ' animate-hero-float-up-sm' : ''}`}
                style={{ boxShadow: '0 20px 52px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.04)' }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px]"
                  style={{ background: 'linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.45) 50%, transparent 90%)' }}
                />
                <div className="mb-3 flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[12px]"
                    style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', boxShadow: '0 6px 18px rgba(6,182,212,0.38)' }}
                  >
                    <Building2 className="h-4 w-4 text-white" strokeWidth={1.9} />
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold uppercase tracking-[0.2em] text-cyan-300/65">For Providers</div>
                    <div className="text-[12px] font-bold text-white">Grow with Us</div>
                  </div>
                </div>
                <p className="text-[11px] leading-[1.65] text-white/48">
                  Showcase your services and receive inquiries from premium event organizers.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full bg-green-400"
                    style={{ boxShadow: '0 0 7px rgba(74,222,128,0.85)' }}
                  />
                  <span className="text-[10px] font-medium text-green-400/78">30+ Active Vendors</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
