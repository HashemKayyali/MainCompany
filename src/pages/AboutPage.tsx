import { motion } from 'framer-motion'
import {
  Bike,
  Blend,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wand2,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { socialLinks } from '../data/social'
import { usePageMeta } from '../hooks/usePageMeta'
import { useReveal } from '../hooks/useReveal'

const tags = ['Malls', 'Schools', 'Corporate', 'Community']

const experiences = [
  {
    title: 'Bike Blender',
    desc: 'Fresh smoothies blended by the audience, with zero boredom and high-energy engagement.',
    icon: Blend,
  },
  {
    title: 'LED Race',
    desc: 'Head-to-head sprints with countdowns, LED feedback, and a big-screen competitive moment.',
    icon: Trophy,
  },
  {
    title: 'On-site operation & safety',
    desc: 'Trained crew, queue flow, and clear safety briefings handled end-to-end by our team.',
    icon: ShieldCheck,
  },
  {
    title: 'Custom branding',
    desc: 'Wraps, leaderboards, cups, and signage tailored to your brand.',
    icon: Wand2,
  },
]

const processSteps = [
  { title: 'Plan & branding', icon: ClipboardCheck },
  { title: 'Live show & racing', icon: Bike },
  { title: 'Wrap-up & recap', icon: Sparkles },
]

const highlights = [
  { label: 'Insured & supervised', icon: ShieldCheck },
  { label: 'Arabic & English MC', icon: Users },
  { label: 'Setup in 45-60 min', icon: Sparkles },
  { label: 'Hygiene-first stations', icon: ClipboardCheck },
]

const stats = [
  { n: '30+', l: 'Partners' },
  { n: '+10', l: 'Core products' },
  { n: '100%', l: 'Customizable' },
]

export default function AboutPage() {
  const { isDark } = useTheme()

  usePageMeta({
    title: 'About',
    description:
      'Learn about Eventies — a premium event services marketplace connecting clients with trusted vendors for activations, experiences, and events across Jordan.',
  })

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/75' : 'text-gray-500'
  const introReveal = useReveal({ distance: 18, duration: 0.42, margin: '0px 0px 16% 0px' })
  const experiencesReveal = useReveal({ delay: 0.04, distance: 16, duration: 0.4, margin: '0px 0px 16% 0px' })
  const processReveal = useReveal({ delay: 0.08, distance: 16, duration: 0.4, margin: '0px 0px 16% 0px' })
  const socialReveal = useReveal({ delay: 0.1, distance: 14, duration: 0.36, margin: '0px 0px 16% 0px' })
  const statsReveal = useReveal({ delay: 0.12, distance: 14, duration: 0.36, margin: '0px 0px 16% 0px' })

  return (
    <section className="site-section relative">
      <div className="site-container">
        <motion.div {...introReveal} className="max-w-3xl">
          <span className="section-label">// About</span>

          <h1
            className={`mt-2.5 font-display text-[2.25rem] font-extrabold tracking-tight leading-[0.96] sm:text-[2.85rem] lg:text-[3.25rem] ${txt}`}
          >
            Who <span className="text-glow">we are</span>
          </h1>

          <p className={`mt-4 max-w-2xl text-[0.92rem] leading-6 ${sub}`}>
            We design pedal-powered experiences that stop crowds, spark smiles, and get people
            moving. Our two hero attractions,{' '}
            <span className={isDark ? 'text-white' : 'text-gray-800'}>Bike Blender</span> and{' '}
            <span className={isDark ? 'text-white' : 'text-gray-800'}>LED Race</span>, are built
            to be safe, portable, and brandable for malls, schools, corporate activations, and
            community events.
          </p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[10px] font-semibold backdrop-blur-xl ${
                  isDark
                    ? 'border-white/12 bg-white/[0.04] text-white/70'
                    : 'border-violet-200/70 bg-white/70 text-gray-700'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div {...experiencesReveal} className="mt-10">
          <div className="mb-5">
            <span className="section-label">// Experiences</span>
            <h2 className={`section-title !text-left ${txt}`}>
              Our <span className="text-glow">experiences</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {experiences.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.title}
                  className={`glass relative overflow-hidden rounded-[18px] border p-4 ${
                    isDark ? 'border-white/10' : 'border-violet-200/60'
                  }`}
                >
                  <div
                    className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-500 hover:opacity-100"
                    style={{
                      background: isDark
                        ? 'radial-gradient(circle at 30% 20%, rgba(34,211,238,0.12), transparent 55%), radial-gradient(circle at 80% 80%, rgba(124,58,237,0.16), transparent 55%)'
                        : 'radial-gradient(circle at 50% 40%, rgba(124,58,237,0.10), transparent 65%)',
                    }}
                  />

                  <div className="relative flex items-start gap-3.5">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${
                        isDark
                          ? 'border-cyan-300/20 bg-cyan-400/10 text-cyan-200'
                          : 'border-cyan-200 bg-cyan-50 text-cyan-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.9} />
                    </div>

                    <div className="min-w-0">
                      <h3 className={`font-display text-[1.02rem] font-extrabold ${txt}`}>
                        {item.title}
                      </h3>
                      <p className={`mt-1.5 text-sm leading-6 ${sub}`}>{item.desc}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div {...processReveal} className="mt-10">
          <span className="section-label">// Process</span>
          <h2 className={`section-title !text-left mb-5 ${txt}`}>
            How it <span className="text-glow">works</span>
          </h2>

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {processSteps.map((step, index) => {
              const Icon = step.icon

              return (
                <div
                  key={step.title}
                  className={`glass flex items-center gap-3 rounded-[18px] border p-3.5 ${
                    isDark ? 'border-white/10' : 'border-violet-200/60'
                  }`}
                >
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-2xl border ${
                      isDark
                        ? 'border-prism-violet/25 bg-prism-violet/12 text-purple-200'
                        : 'border-violet-200 bg-violet-50 text-violet-700'
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.9} />
                  </div>

                  <div className="min-w-0">
                    <div
                      className={`text-[12px] font-mono tracking-[0.18em] uppercase ${
                        isDark ? 'text-purple-300/60' : 'text-gray-400'
                      }`}
                    >
                      Step {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className={`font-semibold ${txt}`}>{step.title}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {highlights.map((item) => {
              const Icon = item.icon

              return (
                <div
                  key={item.label}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur-xl ${
                    isDark
                      ? 'border-white/10 bg-white/[0.03] text-white/70'
                      : 'border-violet-200/60 bg-white/70 text-gray-700'
                  }`}
                >
                  <span
                    className={`flex h-5.5 w-5.5 items-center justify-center rounded-full ${
                      isDark ? 'bg-cyan-400/15 text-cyan-200' : 'bg-cyan-50 text-cyan-700'
                    }`}
                  >
                    <Icon className="h-3 w-3" strokeWidth={2} />
                  </span>
                  <span className="text-[11px] font-semibold">{item.label}</span>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div {...socialReveal} className="mt-6 flex flex-wrap gap-2">
          {socialLinks.map((item) => (
            <a
              key={item.platform}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline !rounded-full !px-5 !py-2.5 !text-[13px]"
            >
              {item.platform}
            </a>
          ))}
        </motion.div>

        <motion.div {...statsReveal} className="mt-8 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.l}
              className={`glass rounded-[18px] border p-4 text-center ${
                isDark ? 'border-white/10' : 'border-violet-200/60'
              }`}
            >
              <div className={`text-[1.55rem] font-display font-extrabold ${txt}`}>{item.n}</div>
              <div
                className={`mt-1.5 text-[10px] font-mono tracking-[0.22em] uppercase ${
                  isDark ? 'text-purple-300/60' : 'text-gray-400'
                }`}
              >
                {item.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
