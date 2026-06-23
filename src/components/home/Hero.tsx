import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Building2, Sparkles, Stars } from 'lucide-react'
import { useMediaQuery } from '../../hooks/useMediaQuery'
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
  const compactViewport = useMediaQuery('(max-width: 1023px)')
  const motionEnabled = !reducedMotion && !perfLow
  const richHeroAtmosphere = !perfLow && !compactViewport
  const glassEnabled = !compactViewport && !perfLow
  const [heroImageReady, setHeroImageReady] = useState(false)

  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden">

      {/* ════ BACKGROUND SYSTEM ════ */}

      {/* Layer 0 – soft white/lavender base */}
      <div className="absolute inset-0 -z-40 bg-[#f5edff]" />

      {/* Layer 1 – hero image (prominent, tinted by a soft lavender wash
          that protects text readability on the left, fades cleanly into
          the page background at the bottom). */}
      <div className="absolute inset-0 -z-30">
        <img
          src="/images/hero-bg-event.webp"
          alt=""
          aria-hidden="true"
          draggable={false}
          loading="eager"
          decoding="async"
          {...{ fetchpriority: 'high' }}
          className={`h-full w-full object-cover object-right md:object-center transition-opacity duration-700 ${
            heroImageReady ? 'opacity-[0.72]' : 'opacity-0'
          }`}
          onLoad={() => setHeroImageReady(true)}
        />
        {/* Readability scrim:
            - Left side (where headline + CTA sit) gets a stronger lavender wash.
            - Right side stays clearer so the event scene comes through.
            - Bottom fades to the page background for a clean transition. */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(245,237,255,0.41) 0%, rgba(245,237,255,0.275) 38%, rgba(245,237,255,0.09) 70%, rgba(245,237,255,0.025) 100%), ' +
              'linear-gradient(180deg, rgba(245,237,255,0.175) 0%, transparent 22%, transparent 72%, rgba(248,243,255,0.48) 100%), ' +
              'radial-gradient(55% 42% at 14% 18%, rgba(113,38,227,0.18) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Layer 2 – atmospheric light orbs */}
      {richHeroAtmosphere ? (
        <>
          <div
            className={`pointer-events-none absolute -z-20${motionEnabled ? ' animate-hero-orb-violet' : ''}`}
            style={{
              left: '-8%', top: '-10%',
              width: '58%', height: '64%',
              opacity: 0.50,
              background: 'radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(124,58,237,0.12) 42%, transparent 70%)',
              filter: 'blur(58px)',
            }}
          />

          <div
            className={`pointer-events-none absolute -z-20${motionEnabled ? ' animate-hero-orb-cyan' : ''}`}
            style={{
              right: '-8%', top: '-12%',
              width: '50%', height: '58%',
              opacity: 0.32,
              background: 'radial-gradient(circle, rgba(217,70,239,0.34) 0%, rgba(168,85,247,0.10) 40%, transparent 68%)',
              filter: 'blur(54px)',
            }}
          />

          <div
            className={`pointer-events-none absolute -z-20${motionEnabled ? ' animate-hero-orb-pink' : ''}`}
            style={{
              left: '30%', bottom: '-12%',
              width: '46%', height: '52%',
              opacity: 0.28,
              background: 'radial-gradient(circle, rgba(196,165,255,0.40) 0%, rgba(168,85,247,0.10) 46%, transparent 72%)',
              filter: 'blur(54px)',
            }}
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-x-[-8%] top-[-4%] -z-20 h-[42%]"
          style={{
            background:
              'radial-gradient(40% 75% at 22% 16%, rgba(124,58,237,0.18) 0%, transparent 76%), ' +
              'radial-gradient(34% 70% at 78% 18%, rgba(217,70,239,0.12) 0%, transparent 74%)',
          }}
        />
      )}

      {/* Layer 3 – subtle dot grid texture */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundImage: 'radial-gradient(rgba(124,58,237,0.20) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          opacity: 0.10,
          maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 60%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black 60%, transparent 100%)',
        }}
      />

      {/* Layer 4 – bottom fade to page background */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-80"
        style={{
          background:
            'linear-gradient(to top, rgba(248,243,255,0.5) 0%, rgba(248,243,255,0.46) 28%, rgba(248,243,255,0.225) 62%, transparent 100%)',
        }}
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
              className="mb-5 inline-flex w-fit sm:mb-7"
            >
              <div
                className={`inline-flex items-center gap-2.5 rounded-full border border-violet-400/55 bg-white/95 px-3.5 py-1.5 ${glassEnabled ? 'backdrop-blur-md' : ''} sm:px-4 sm:py-2 shadow-[0_10px_30px_-10px_rgba(89,23,196,0.35)]`}
              >
                <Stars className="h-3.5 w-3.5 text-violet-700" strokeWidth={2.4} />
                <span className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-violet-800 sm:text-[10.5px] sm:tracking-[0.18em]">
                  Event Services Marketplace
                </span>
                <span
                  className="ml-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600"
                  style={{ boxShadow: '0 0 9px rgba(168,85,247,0.95)' }}
                />
              </div>
            </motion.div>

            {/* Main heading */}
            <h1
              className="font-sans text-[clamp(2.6rem,6vw,4.9rem)] font-extrabold leading-[0.96] tracking-[-0.04em] text-ink-900"
              style={{
                fontFamily: '"Alexandria", system-ui, sans-serif',
                fontKerning: 'normal',
                textRendering: 'optimizeLegibility',
                color: '#140832',
              }}
            >
              <span className="block" style={{ color: '#1a0b3d' }}>
                Book Everything
              </span>
              <span className="relative isolate mt-2 block pb-[0.08em] tracking-[-0.028em]">
                <span
                  className="relative z-10 inline-block bg-clip-text text-transparent"
                  style={{
                    backgroundImage:
                      'linear-gradient(100deg, #5d18c4 0%, #7126e3 18%, #8344f5 34%, #c026d3 50%, #8344f5 66%, #7126e3 82%, #5d18c4 100%)',
                    WebkitTextFillColor: 'transparent',
                    backgroundSize: '200% auto',
                    animation: motionEnabled ? 'text-color-flow 6s linear infinite' : undefined,
                  }}
                >
                  Your Event Needs
                </span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-x-[5%] bottom-[0.02em] z-0 h-[0.24em] rounded-full ${richHeroAtmosphere ? 'opacity-55 blur-3xl' : 'opacity-40 blur-xl'}`}
                  style={{ background: 'linear-gradient(90deg, rgba(113,38,227,0.5), rgba(217,70,239,0.36), rgba(168,85,247,0.26))' }}
                />
              </span>
            </h1>

            {/* Description */}
            <p className="mt-7 max-w-[36rem] text-[1rem] font-medium leading-[1.78] text-ink-800 sm:text-[1.08rem]" style={{ color: '#31195f' }}>
              Find and book games, LED screens, performers, booths, rentals, and production
              services from trusted vendors — all in one place.
            </p>

            {/* Journey step pills */}
            <div className="mt-7 flex flex-wrap items-center gap-2">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={motionEnabled ? { opacity: 0, x: -12 } : false}
                  animate={motionEnabled ? { opacity: 1, x: 0 } : undefined}
                  transition={motionEnabled ? { duration: 0.42, delay: 0.22 + index * 0.07, ease } : undefined}
                  className={`inline-flex items-center gap-2.5 rounded-full border border-violet-400/55 bg-white/95 px-3.5 py-1.5 ${glassEnabled ? 'backdrop-blur-sm' : ''} shadow-[0_6px_16px_-6px_rgba(89,23,196,0.28)]`}
                >
                  <span className="text-[10px] font-extrabold tracking-[0.12em] text-violet-700">{step.num}</span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em]" style={{ color: '#211049' }}>{step.label}</span>
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
                className="btn-primary group relative !min-h-[52px] !overflow-hidden !rounded-[18px] !px-7 !text-[12px]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/22 transition-transform duration-700 group-hover:translate-x-[200%]" />
                Explore Services
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.2} />
              </Link>

              <Link
                to="/contact"
                onMouseEnter={() => preloadRoute('/contact')}
                onFocus={() => preloadRoute('/contact')}
                className={`inline-flex min-h-[52px] items-center gap-2 rounded-[18px] border border-violet-400/65 bg-white/95 px-7 text-[12px] font-bold tracking-[0.02em] text-violet-800 transition-all hover:border-violet-600 hover:bg-white hover:text-violet-900 hover:shadow-[0_14px_30px_-12px_rgba(89,23,196,0.36)] ${glassEnabled ? 'backdrop-blur-sm' : ''}`}
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
                    <div className="mx-6 h-10 w-px bg-violet-400/55 sm:mx-8" />
                  )}
                  <div>
                    <div
                      className="font-display text-[clamp(1.6rem,3.8vw,2.1rem)] font-black leading-none tracking-[-0.07em]"
                      style={{
                        background: 'linear-gradient(135deg, #140832 0%, #5d18c4 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {stat.value}
                    </div>
                    <div className="mt-1.5 text-[9.5px] font-bold uppercase tracking-[0.18em] text-violet-800">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── RIGHT: Floating card composition (desktop only) ── */}
          {!perfLow && <div className="relative hidden h-full min-h-[500px] lg:block">

            {/* Card 1: For Clients – upper right */}
            <motion.div
              className="absolute right-0 top-[2%]"
              initial={motionEnabled ? { opacity: 0, y: 20 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.9, delay: 0.35, ease } : undefined}
            >
              <div
                className={`w-[268px] rounded-[24px] border border-violet-300/70 bg-white p-5 ${glassEnabled ? 'backdrop-blur-md' : ''}${motionEnabled ? ' animate-hero-float-up' : ''}`}
                style={{
                  boxShadow:
                    '0 34px 84px -18px rgba(89,23,196,0.34), 0 10px 24px -8px rgba(89,23,196,0.20), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[24px]"
                  style={{ background: 'linear-gradient(90deg, transparent 8%, rgba(124,58,237,0.7) 50%, transparent 92%)' }}
                />
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-[14px]"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #c026d3)',
                      boxShadow: '0 10px 28px -8px rgba(124,58,237,0.55)',
                    }}
                  >
                    <Sparkles className="h-5 w-5 text-white" strokeWidth={2.0} />
                  </div>
                  <div>
                    <div className="text-[9.5px] font-bold uppercase tracking-[0.2em] text-violet-700">For Clients</div>
                    <div className="text-[13.5px] font-bold" style={{ color: '#140832' }}>Browse &amp; Book</div>
                  </div>
                </div>
                <div className="space-y-2">
                  {['LED Screens & Displays', 'Games & Activations', 'Live Production'].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 rounded-[12px] border border-violet-300/65 bg-violet-50/85 px-3 py-2.5"
                    >
                      <div
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600"
                        style={{ boxShadow: '0 0 7px rgba(168,85,247,0.95)' }}
                      />
                      <span className="text-[11.5px] font-semibold" style={{ color: '#211049' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 2: Stats – lower right */}
            <motion.div
              className="absolute bottom-[6%] right-[8%]"
              initial={motionEnabled ? { opacity: 0, y: 20 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.9, delay: 0.55, ease } : undefined}
            >
              <div
                className={`w-[210px] rounded-[20px] border border-fuchsia-300/70 bg-white p-4 ${glassEnabled ? 'backdrop-blur-md' : ''}${motionEnabled ? ' animate-hero-float-down' : ''}`}
                style={{
                  boxShadow:
                    '0 24px 60px -16px rgba(192,38,211,0.34), 0 8px 22px -8px rgba(89,23,196,0.22), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px]"
                  style={{ background: 'linear-gradient(90deg, transparent 8%, rgba(192,38,211,0.6) 50%, transparent 92%)' }}
                />
                <div className="mb-4 text-[9px] font-bold uppercase tracking-[0.22em] text-fuchsia-700">
                  Platform Stats
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {heroStats.map(stat => (
                    <div key={stat.label} className="text-center">
                      <div
                        className="font-display text-[1.2rem] font-black leading-none tracking-[-0.06em]"
                        style={{
                          background: 'linear-gradient(135deg, #140832 0%, #7126e3 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        {stat.value}
                      </div>
                      <div className="mt-1 text-[8px] font-bold uppercase tracking-[0.12em] text-violet-700">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 3: For Providers – middle left */}
            <motion.div
              className="absolute left-0 top-[36%] hidden xl:block"
              initial={motionEnabled ? { opacity: 0, y: 20 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.9, delay: 0.72, ease } : undefined}
            >
              <div
                className={`w-[236px] rounded-[20px] border border-violet-300/70 bg-white p-4 ${glassEnabled ? 'backdrop-blur-md' : ''}${motionEnabled ? ' animate-hero-float-up-sm' : ''}`}
                style={{
                  boxShadow:
                    '0 24px 58px -16px rgba(89,23,196,0.32), 0 8px 22px -8px rgba(89,23,196,0.20), inset 0 1px 0 rgba(255,255,255,0.95)',
                }}
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[20px]"
                  style={{ background: 'linear-gradient(90deg, transparent 8%, rgba(168,85,247,0.55) 50%, transparent 92%)' }}
                />
                <div className="mb-3 flex items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-[12px]"
                    style={{
                      background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                      boxShadow: '0 8px 22px -6px rgba(168,85,247,0.55)',
                    }}
                  >
                    <Building2 className="h-4 w-4 text-white" strokeWidth={2.0} />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-violet-700">For Providers</div>
                    <div className="text-[12.5px] font-bold" style={{ color: '#140832' }}>Grow with Us</div>
                  </div>
                </div>
                <p className="text-[11.5px] font-medium leading-[1.65]" style={{ color: '#31195f' }}>
                  Showcase your services and receive inquiries from premium event organizers.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full bg-emerald-500"
                    style={{ boxShadow: '0 0 8px rgba(16,185,129,0.95)' }}
                  />
                  <span className="text-[10px] font-bold text-emerald-700">30+ Active Vendors</span>
                </div>
              </div>
            </motion.div>

          </div>}
        </div>
      </div>
    </section>
  )
}
