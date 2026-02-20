import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { socialLinks } from '../data/social'

const ease = [0.16, 1, 0.3, 1] as const

const TAGS = ['Malls', 'Schools', 'Corporate', 'Community']

const EXPERIENCES = [
  {
    title: 'Bike Blender',
    desc: 'Fresh smoothies blended by the audience — zero boredom, max hype.',
    icon: '🥤',
  },
  {
    title: 'LED Race',
    desc: 'Head-to-head sprints with towering LEDs, countdowns, and big-screen energy.',
    icon: '🏁',
  },
  {
    title: 'On-site operation & safety',
    desc: 'Trained crew, queue flow, and clear safety briefings — we run it end-to-end.',
    icon: '🛡️',
  },
  {
    title: 'Custom branding',
    desc: 'Wraps, leaderboards, cups, and signage tailored to your brand.',
    icon: '✨',
  },
]

const HOW = [
  { title: 'Plan & branding', icon: '🧩' },
  { title: 'Live show & racing', icon: '🎬' },
  { title: 'Wrap-up & recap', icon: '✅' },
]

const HIGHLIGHTS = [
  { label: 'Insured & supervised', icon: '✓' },
  { label: 'Arabic & English MC', icon: '🌍' },
  { label: 'Setup in 45–60 min', icon: '⏱️' },
  { label: 'Hygiene-first stations', icon: '🧼' },
]

const STATS = [
  { n: '30+', l: 'Partners' },
  { n: '+10', l: 'Core products' },
  { n: '100%', l: 'Customizable' },
]

export default function AboutPage() {
  const { isDark } = useTheme()
  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/75' : 'text-gray-500'

  const anim = (d = 0) => ({
    initial: { opacity: 0, y: 24 } as const,
    whileInView: { opacity: 1, y: 0 } as const,
    viewport: { once: true, margin: '-80px' } as const,
    transition: { duration: 0.65, delay: d, ease },
  })

  return (
    <section className="pt-32 pb-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* ── Header */}
        <motion.div {...anim(0)} className="max-w-3xl">
          <span className="section-label">// About</span>

          <h1 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold mt-4 tracking-tight leading-[0.95] ${txt}`}>
            Who <span className="text-glow">we are</span>
          </h1>

          <p className={`mt-6 text-lg leading-relaxed ${sub}`}>
            We design pedal-powered experiences that stop crowds, spark smiles, and get people moving.
            Our two hero attractions — <span className={isDark ? 'text-white' : 'text-gray-800'}>Bike Blender</span> and{' '}
            <span className={isDark ? 'text-white' : 'text-gray-800'}>LED Race</span> — are built to be safe, portable, and brandable for malls,
            schools, corporate activations, and community events.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {TAGS.map((t) => (
              <span
                key={t}
                className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-[11px] font-semibold border backdrop-blur-xl ${
                  isDark
                    ? 'bg-white/[0.04] border-white/12 text-white/70'
                    : 'bg-white/70 border-violet-200/70 text-gray-700'
                }`}
              >
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Our experiences */}
        <motion.div {...anim(0.08)} className="mt-16">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <span className="section-label">// Experiences</span>
              <h2 className={`section-title !text-left ${txt}`}>
                Our <span className="text-glow">experiences</span>
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EXPERIENCES.map((c) => (
              <div
                key={c.title}
                className={`glass rounded-2xl border p-6 relative overflow-hidden ${
                  isDark ? 'border-white/10' : 'border-violet-200/60'
                }`}
              >
                <div
                  className="absolute -inset-1 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: isDark
                      ? 'radial-gradient(circle at 30% 20%, rgba(34,211,238,0.12), transparent 55%), radial-gradient(circle at 80% 80%, rgba(124,58,237,0.16), transparent 55%)'
                      : 'radial-gradient(circle at 50% 40%, rgba(124,58,237,0.10), transparent 65%)',
                  }}
                />
                <div className="relative flex items-start gap-4">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${
                      isDark
                        ? 'bg-cyan-400/10 border-cyan-300/20 text-cyan-200'
                        : 'bg-cyan-50 border-cyan-200 text-cyan-700'
                    }`}
                  >
                    <span className="text-lg">{c.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className={`font-display font-extrabold text-lg ${txt}`}>{c.title}</h3>
                    <p className={`mt-1.5 text-sm leading-relaxed ${sub}`}>{c.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── How it works */}
        <motion.div {...anim(0.14)} className="mt-16">
          <span className="section-label">// Process</span>
          <h2 className={`section-title !text-left mb-8 ${txt}`}>
            How it <span className="text-glow">works</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {HOW.map((s, i) => (
              <div
                key={s.title}
                className={`glass rounded-2xl border p-5 flex items-center gap-3 ${
                  isDark ? 'border-white/10' : 'border-violet-200/60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                    isDark
                      ? 'bg-prism-violet/12 border-prism-violet/25 text-purple-200'
                      : 'bg-violet-50 border-violet-200 text-violet-700'
                  }`}
                >
                  <span className="text-base">{s.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className={`text-[12px] font-mono tracking-[0.18em] uppercase ${isDark ? 'text-purple-300/60' : 'text-gray-400'}`}>
                    Step {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className={`font-semibold ${txt}`}>{s.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.label}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-xl ${
                  isDark
                    ? 'bg-white/[0.03] border-white/10 text-white/70'
                    : 'bg-white/70 border-violet-200/60 text-gray-700'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isDark ? 'bg-cyan-400/15 text-cyan-200' : 'bg-cyan-50 text-cyan-700'
                  }`}
                >
                  {h.icon}
                </span>
                <span className="text-[12px] font-semibold">{h.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Social */}
        <motion.div {...anim(0.2)} className="mt-10 flex flex-wrap gap-2.5">
          {socialLinks.map((s) => (
            <a
              key={s.platform}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline !rounded-full !px-5 !py-2.5 !text-[13px]"
            >
              {s.platform}
            </a>
          ))}
        </motion.div>

        {/* ── Stats */}
        <motion.div {...anim(0.28)} className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((st) => (
            <div
              key={st.l}
              className={`glass rounded-2xl border p-6 text-center ${
                isDark ? 'border-white/10' : 'border-violet-200/60'
              }`}
            >
              <div className={`text-3xl font-display font-extrabold ${txt}`}>{st.n}</div>
              <div className={`mt-2 text-[11px] font-mono tracking-[0.22em] uppercase ${isDark ? 'text-purple-300/60' : 'text-gray-400'}`}>
                {st.l}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}