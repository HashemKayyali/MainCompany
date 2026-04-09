import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Building2, Sparkles } from 'lucide-react'
import { usePerfMode } from '../../hooks/usePerfMode'

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

  return (
    <section className="relative isolate flex min-h-screen flex-col overflow-hidden">

      {/* ════ BACKGROUND SYSTEM ════ */}

      {/* Layer 0 – deep dark base */}
      <div className="absolute inset-0 -z-40 bg-[#030610]" />

      {/* Layer 1 – hero image (subdued atmosphere) */}
      <div className="absolute inset-0 -z-30">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/hero-bg-event.png')",
            opacity: 1.18,
          }}
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
          <motion.div
            className="pointer-events-none absolute -z-20"
            animate={motionEnabled ? { opacity: [0.32, 0.52, 0.32], scale: [1, 1.07, 1] } : {}}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              left: '-5%', top: '-10%',
              width: '60%', height: '70%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.30) 0%, rgba(124,58,237,0.10) 40%, transparent 68%)',
              filter: 'blur(72px)',
            }}
          />

          {/* Cyan orb – upper right */}
          <motion.div
            className="pointer-events-none absolute -z-20"
            animate={motionEnabled ? { opacity: [0.18, 0.34, 0.18], scale: [1, 1.09, 1] } : {}}
            transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
            style={{
              right: '-8%', top: '-15%',
              width: '50%', height: '60%',
              background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0.07) 38%, transparent 65%)',
              filter: 'blur(64px)',
            }}
          />

          {/* Pink orb – lower center */}
          <motion.div
            className="pointer-events-none absolute -z-20"
            animate={motionEnabled ? { opacity: [0.14, 0.26, 0.14], scale: [1, 1.06, 1] } : {}}
            transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
            style={{
              left: '25%', bottom: '0%',
              width: '50%', height: '50%',
              background: 'radial-gradient(circle, rgba(236,72,153,0.20) 0%, rgba(236,72,153,0.06) 40%, transparent 68%)',
              filter: 'blur(80px)',
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

      {/* Layer 4 – bottom fade to page background */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-52"
        style={{ background: 'linear-gradient(to top, #04040c 0%, transparent 100%)' }}
      />

      {/* ════ HERO CONTENT ════ */}
      <div
        className="site-container relative z-20 flex flex-1 flex-col"
        style={{ paddingTop: 'calc(var(--app-navbar-height, 72px) + clamp(0.75rem, 3vw, 4.5rem))' }}
      >
        <div className="grid flex-1 grid-cols-1 items-center gap-10 pb-20 sm:pb-28 lg:grid-cols-[1fr_0.58fr] lg:gap-6 lg:pb-32 xl:gap-12">

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
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/22 bg-violet-500/10 px-3 py-1.5 backdrop-blur-md sm:gap-2.5 sm:px-4 sm:py-2">
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
            <h1 className="font-display text-[clamp(2.7rem,6.2vw,5.1rem)] font-black leading-[0.88] tracking-[-0.07em] text-white">
              <span className="block opacity-90">Book Everything</span>
              <span className="relative mt-2 block">
                <span
                  className="relative bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(95deg, #c4b5fd 0%, #f0abfc 30%, #67e8f9 65%, #c4b5fd 100%)',
                  }}
                >
                  Your Event Needs
                </span>
                <span
                  className="pointer-events-none absolute inset-x-0 -bottom-2 h-8 rounded-full blur-2xl"
                  style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.45), rgba(236,72,153,0.30), rgba(34,211,238,0.20))' }}
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
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.05] px-3.5 py-1.5 backdrop-blur-md"
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
                className="btn-primary group relative !min-h-[50px] !overflow-hidden !rounded-[18px] !px-6 !text-[12px]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[200%]" />
                Explore Services
                <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-[50px] items-center gap-2 rounded-[18px] border border-white/[0.13] bg-white/[0.07] px-6 text-[12px] font-semibold tracking-[0.01em] text-white backdrop-blur-md transition-all hover:border-white/[0.22] hover:bg-white/[0.12]"
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
              <motion.div
                animate={motionEnabled ? { y: [0, -10, 0] } : {}}
                transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                className="w-[258px] rounded-[24px] border border-white/[0.1] bg-[rgba(8,6,22,0.76)] p-5 backdrop-blur-xl"
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
              </motion.div>
            </motion.div>

            {/* Card 2: Stats – lower right */}
            <motion.div
              className="absolute bottom-[6%] right-[8%]"
              initial={motionEnabled ? { opacity: 0 } : false}
              animate={motionEnabled ? { opacity: 1 } : undefined}
              transition={motionEnabled ? { duration: 0.9, delay: 0.55, ease } : undefined}
            >
              <motion.div
                animate={motionEnabled ? { y: [0, 9, 0] } : {}}
                transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                className="w-[200px] rounded-[20px] border border-cyan-400/[0.12] bg-[rgba(5,20,32,0.72)] p-4 backdrop-blur-xl"
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
              </motion.div>
            </motion.div>

            {/* Card 3: For Providers – middle left */}
            <motion.div
              className="absolute left-0 top-[36%]"
              initial={motionEnabled ? { opacity: 0 } : false}
              animate={motionEnabled ? { opacity: 1 } : undefined}
              transition={motionEnabled ? { duration: 0.9, delay: 0.72, ease } : undefined}
            >
              <motion.div
                animate={motionEnabled ? { y: [0, -7, 0] } : {}}
                transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                className="w-[226px] rounded-[20px] border border-white/[0.08] bg-[rgba(6,8,22,0.68)] p-4 backdrop-blur-xl"
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
              </motion.div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
