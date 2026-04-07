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

const platformSignals = [
  {
    title: 'For clients',
    body: 'Browse categories, compare options, and request event services with confidence.',
    icon: Sparkles,
    accent: 'violet' as const,
  },
  {
    title: 'For providers',
    body: 'Showcase your company, receive inquiries, and grow inside a premium marketplace.',
    icon: Building2,
    accent: 'cyan' as const,
  },
]

function HeroStat({
  value,
  label,
  motionEnabled,
  index,
}: {
  value: string
  label: string
  motionEnabled: boolean
  index: number
}) {
  return (
    <motion.div
      initial={motionEnabled ? { opacity: 0, y: 16 } : false}
      whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-40px' }}
      transition={motionEnabled ? { duration: 0.45, delay: 0.12 + index * 0.05, ease } : undefined}
      className="relative overflow-hidden rounded-[20px] border border-white/10 bg-black/28 px-4 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-md sm:px-5"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(196,181,253,0.55) 40%, rgba(34,211,238,0.35) 70%, transparent 100%)',
        }}
      />
      <div className="font-display text-[1.45rem] font-black tracking-[-0.05em] text-white">
        {value}
      </div>
      <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200/70">
        {label}
      </div>
    </motion.div>
  )
}

function SignalCard({
  title,
  body,
  Icon,
  motionEnabled,
  delay,
  accent,
}: {
  title: string
  body: string
  Icon: typeof Sparkles
  motionEnabled: boolean
  delay: number
  accent: 'violet' | 'cyan'
}) {
  const iconGradient =
    accent === 'violet'
      ? 'from-violet-500 to-fuchsia-500'
      : 'from-cyan-400 to-violet-500'

  return (
    <motion.div
      initial={motionEnabled ? { opacity: 0, y: 16 } : false}
      whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: '-40px' }}
      transition={motionEnabled ? { duration: 0.48, delay, ease } : undefined}
      className="relative overflow-hidden rounded-[22px] border border-white/10 bg-black/24 p-4 shadow-[0_20px_56px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            accent === 'violet'
              ? 'linear-gradient(90deg, transparent 0%, rgba(167,139,250,0.55) 50%, transparent 100%)'
              : 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.45) 50%, transparent 100%)',
        }}
      />

      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-white/10 bg-white/5">
          <div className={`rounded-full bg-gradient-to-br ${iconGradient} p-[1px]`}>
            <div className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-slate-950">
              <Icon className={`h-4.5 w-4.5 ${accent === 'violet' ? 'text-violet-300' : 'text-cyan-300'}`} />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-200/75 sm:text-[10.5px]">
            {title}
          </div>
          <p className="mt-1.5 text-[0.84rem] leading-[1.55] text-white/78 sm:text-[0.92rem]">
            {body}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export default function Hero() {
  const reducedMotion = useReducedMotion()
  const { perfLow } = usePerfMode()
  const motionEnabled = !reducedMotion && !perfLow

  return (
    <section className="relative isolate min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-30">
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/hero-bg-event.png')" }}
        />
      </div>

      <div className="absolute inset-0 -z-20 bg-[rgba(2,6,23,0.56)]" />

      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 18% 18%, rgba(124,58,237,0.22) 0%, transparent 34%),
            radial-gradient(circle at 82% 18%, rgba(34,211,238,0.16) 0%, transparent 28%),
            linear-gradient(180deg, rgba(2,6,23,0.14) 0%, rgba(2,6,23,0.36) 36%, rgba(2,6,23,0.84) 100%)
          `,
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-t from-[#020617] to-transparent" />

      <div className="site-container relative z-10">
        <div
          className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)]"
          style={{
            paddingTop: 'calc(var(--app-navbar-height, 92px) + clamp(1.2rem, 2.2vw, 2rem))',
            paddingBottom: 'clamp(1.75rem, 3vw, 2.5rem)',
          }}
        >
          <motion.div
            initial={motionEnabled ? { opacity: 0, y: 26 } : false}
            animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
            transition={motionEnabled ? { duration: 0.75, ease } : undefined}
            className="relative z-10 flex min-h-0 max-w-[44rem] flex-col justify-center"
          >
            <motion.div
              initial={motionEnabled ? { opacity: 0, y: -8 } : false}
              animate={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              transition={motionEnabled ? { duration: 0.48, delay: 0.04, ease } : undefined}
              className="mb-4 inline-flex"
            >
              <div className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-violet-300/20 bg-white/10 px-3.25 py-1.75 text-violet-100 backdrop-blur-md sm:px-3.5">
                <span
                  className="h-1.5 w-1.5 rounded-full bg-violet-300"
                  style={{ boxShadow: '0 0 6px rgba(167,139,250,0.9)' }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] sm:text-[10.5px]">
                  Event Services Platform
                </span>
              </div>
            </motion.div>

            <div className="max-w-[22rem] sm:max-w-none">
              <h1 className="font-display text-[clamp(2rem,5.6vw,4.55rem)] font-black leading-[0.92] tracking-[-0.06em] text-white">
                <span className="inline sm:block">Book Everything</span>
                <span className="relative block">
                  <span className="pointer-events-none absolute inset-x-0 bottom-1 h-6 rounded-full bg-[linear-gradient(90deg,rgba(124,58,237,0.34),rgba(236,72,153,0.28),rgba(34,211,238,0.18))] blur-2xl" />
                  <span
                    className="relative bg-clip-text text-transparent"
                    style={{
                      backgroundImage:
                        'linear-gradient(95deg, #c4b5fd 0%, #f0abfc 36%, #67e8f9 78%, #c4b5fd 100%)',
                    }}
                  >
                    Your Event Needs
                  </span>
                </span>
              </h1>
            </div>

            <p className="mt-4 max-w-[38rem] text-[0.95rem] leading-[1.72] text-white/76 sm:mt-5 sm:text-[1.02rem] sm:leading-[1.8]">
              Find and book games, LED screens, performers, booths, rentals, and production
              services from trusted event vendors in one place.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:mt-6 sm:gap-3">
              {journeySteps.map((step, index) => (
                <motion.div
                  key={step.label}
                  initial={motionEnabled ? { opacity: 0, y: 10 } : false}
                  whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={motionEnabled ? { duration: 0.42, delay: 0.08 + index * 0.05, ease } : undefined}
                  className="inline-flex min-h-[34px] items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-white/88 backdrop-blur-md"
                >
                  <span className="text-[10px] font-semibold tracking-[0.12em] text-violet-200/70">
                    {step.num}
                  </span>
                  <span className="text-[0.78rem] font-semibold uppercase tracking-[0.08em]">
                    {step.label}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 sm:mt-6">
              {platformSignals.map((signal, index) => (
                <SignalCard
                  key={signal.title}
                  title={signal.title}
                  body={signal.body}
                  Icon={signal.icon}
                  accent={signal.accent}
                  motionEnabled={motionEnabled}
                  delay={0.16 + index * 0.08}
                />
              ))}
            </div>

            <motion.div
              initial={motionEnabled ? { opacity: 0, y: 14 } : false}
              whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, margin: '-40px' }}
              transition={motionEnabled ? { duration: 0.52, delay: 0.2, ease } : undefined}
              className="mt-5 flex flex-wrap items-center gap-3 sm:mt-6"
            >
              <Link
                to="/products"
                className="btn-primary group relative !min-h-[48px] !overflow-hidden !rounded-[16px] !px-5 !text-[11.5px]"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 transition-transform duration-700 group-hover:translate-x-[200%]" />
                Explore Services
                <ArrowRight className="h-4 w-4" strokeWidth={1.9} />
              </Link>

              <Link
                to="/contact"
                className="btn-outline !min-h-[48px] !rounded-[16px] !border-white/15 !bg-white/10 !px-5 !text-[11.5px] !text-white backdrop-blur-md hover:!bg-white/14"
              >
                Talk to the Team
              </Link>
            </motion.div>

            <div className="mt-6 grid max-w-[26rem] grid-cols-3 gap-3 sm:mt-7 sm:max-w-[29rem]">
              {heroStats.map((stat, index) => (
                <HeroStat
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  motionEnabled={motionEnabled}
                  index={index}
                />
              ))}
            </div>
          </motion.div>

          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  )
}