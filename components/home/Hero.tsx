import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import ParticleCanvas from './ParticleCanvas'

const ease = [0.16, 1, 0.3, 1] as const

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function Sparkle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M12 2l1.2 5.1L18 9l-4.8 1.9L12 16l-1.2-5.1L6 9l4.8-1.9L12 2z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function Bolt({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M13 2L4 14h7l-1 8 10-14h-7l0-6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function Vr({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M7 8h10a3 3 0 013 3v2a3 3 0 01-3 3h-1l-1.4 1.4a1 1 0 01-1.6-.3L12 16H7a3 3 0 01-3-3v-2a3 3 0 013-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9.2 12.1a1.1 1.1 0 102.2 0 1.1 1.1 0 00-2.2 0zM12.6 12.1a1.1 1.1 0 102.2 0 1.1 1.1 0 00-2.2 0z" fill="currentColor" />
    </svg>
  )
}

function FloatingChip({ title, subtitle, icon, tone, delay = 0, className = '', reduceMotion = false }: {
  title: string; subtitle: string; icon: React.ReactNode; tone: 'violet' | 'cyan' | 'pink' | 'amber'; delay?: number; className?: string; reduceMotion?: boolean
}) {
  const toneCls = tone === 'violet' ? 'text-prism-violet border-prism-violet/30' : tone === 'cyan' ? 'text-cyan-300 border-cyan-400/25' : tone === 'pink' ? 'text-prism-pink border-prism-pink/25' : 'text-prism-amber border-prism-amber/25'
  return (
    <motion.div initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0)' }} transition={{ duration: 0.8, delay, ease }} className={className}>
      <motion.div animate={reduceMotion ? {} : { y: [0, -10, 0], rotate: [0, 0.6, 0] }} transition={reduceMotion ? { duration: 0 } : { duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className={`group relative rounded-2xl border backdrop-blur-2xl px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)] ${toneCls}`}
        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' }}>
        <div className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{ background: tone === 'violet' ? 'radial-gradient(circle at 30% 20%, rgba(124,58,237,0.25), transparent 55%)' : tone === 'cyan' ? 'radial-gradient(circle at 30% 20%, rgba(34,211,238,0.22), transparent 55%)' : tone === 'pink' ? 'radial-gradient(circle at 30% 20%, rgba(236,72,153,0.22), transparent 55%)' : 'radial-gradient(circle at 30% 20%, rgba(245,158,11,0.18), transparent 55%)' }} />
        <div className="relative flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl border ${toneCls} flex items-center justify-center bg-white/[0.03]`}><span className="opacity-90">{icon}</span></div>
          <div className="min-w-0">
            <div className="text-[12px] font-semibold text-white/90 truncate">{title}</div>
            <div className="text-[10px] font-mono tracking-[0.18em] uppercase text-white/55 truncate">{subtitle}</div>
          </div>
        </div>
        <div className="absolute -bottom-3 left-6 right-6 h-px opacity-70" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }} />
      </motion.div>
    </motion.div>
  )
}

export default function Hero() {
  const { isDark } = useTheme()
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLElement | null>(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 120, damping: 20 })
  const sy = useSpring(my, { stiffness: 120, damping: 20 })
  const tiltX = useTransform(sy, [-1, 1], [6, -6])
  const tiltY = useTransform(sx, [-1, 1], [-8, 8])
  const floatX = useTransform(sx, [-1, 1], [-16, 16])
  const floatY = useTransform(sy, [-1, 1], [-10, 10])

  useEffect(() => {
    if (reduceMotion) return
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => { const r = el.getBoundingClientRect(); mx.set(clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)); my.set(clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)) }
    const onLeave = () => { mx.set(0); my.set(0) }
    el.addEventListener('mousemove', onMove, { passive: true })
    el.addEventListener('mouseleave', onLeave, { passive: true })
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave) }
  }, [mx, my, reduceMotion])

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex items-center overflow-hidden" aria-label="Hero section">
      {/* ✅ Canvas-based particle field (was 18 motion.divs) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-80" style={{ background: isDark ? 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.18), transparent 55%)' : 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.08), transparent 55%)' }} />
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: isDark ? 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)' : 'linear-gradient(rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.05) 1px, transparent 1px)', backgroundSize: '72px 72px', maskImage: 'radial-gradient(circle at 50% 25%, black 0%, transparent 65%)', WebkitMaskImage: 'radial-gradient(circle at 50% 25%, black 0%, transparent 65%)' }} />
        <ParticleCanvas isDark={isDark} reduceMotion={!!reduceMotion} />
        {/* ✅ CSS scan line instead of motion.div */}
        <div className="scan-line opacity-60" style={{ background: isDark ? 'linear-gradient(90deg, transparent, rgba(34,211,238,0.35), rgba(236,72,153,0.25), transparent)' : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.22), transparent)' }} />
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[1100px] h-[860px] rounded-full pointer-events-none" style={{ background: isDark ? 'radial-gradient(ellipse, rgba(124,58,237,0.16) 0%, rgba(236,72,153,0.08) 38%, transparent 72%)' : 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 62%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 py-28 sm:py-40 w-full">
        <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-12 items-center">
          <div className="max-w-3xl">
            <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0)' }} transition={{ duration: 0.8, delay: 0.1, ease }}>
              <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 backdrop-blur-2xl ${isDark ? 'bg-prism-violet/15 border border-prism-violet/30' : 'bg-violet-50 border border-violet-200/60'}`}>
                <span className="relative flex h-2 w-2" aria-hidden="true"><span className="animate-ping absolute h-full w-full rounded-full bg-cyan-400 opacity-75" /><span className={`relative rounded-full h-2 w-2 ${isDark ? 'bg-cyan-400' : 'bg-violet-500'}`} /></span>
                <span className={`text-[12px] font-medium font-mono tracking-wide ${isDark ? 'text-cyan-300' : 'text-violet-700'}`}>Available for Events {new Date().getFullYear()}</span>
                <motion.span className={`ml-1 inline-flex items-center gap-1 text-[11px] font-mono ${isDark ? 'text-white/55' : 'text-gray-500'}`} animate={reduceMotion ? {} : { opacity: [0.45, 0.85, 0.45] }} transition={reduceMotion ? { duration: 0 } : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}><Sparkle className="w-4 h-4" /> arcade</motion.span>
              </div>
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0)' }} transition={{ duration: 1, delay: 0.2, ease }} className={`font-display text-[clamp(2.8rem,7.5vw,6rem)] font-extrabold leading-[0.92] tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="block">Cycling Meets</span>
              <span className="block text-glow mt-1">Pure Magic</span>
            </motion.h1>

            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45, ease }} className={`mt-7 text-lg sm:text-xl leading-relaxed max-w-lg ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>
              Interactive bike-powered activations for events.{' '}<span className={isDark ? 'text-cyan-200' : 'text-gray-800'}>LED races, smoothie bikes, VR cycling</span>{' '}and more across Jordan.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease }} className="mt-10 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary group"><span>Explore Products</span>
                <motion.svg className="w-4 h-4 relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true" animate={reduceMotion ? {} : { x: [0, 4, 0] }} transition={reduceMotion ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}><path d="M5 8h6M8 5l3 3-3 3" /></motion.svg>
              </Link>
              <Link to="/contact" className="btn-outline">Book an Event</Link>
            </motion.div>

            {/* ✅ Semantic stats */}
            <motion.dl initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.85 }} className="mt-14 flex items-center gap-10" aria-label="Company statistics">
              {[{ n: '50+', l: 'Events', c: 'text-purple-400' }, { n: '20+', l: 'Partners', c: 'text-cyan-400' }, { n: '6', l: 'Products', c: 'text-pink-400' }].map((s, i) => (
                <div key={s.l} className="relative">
                  <dt className="sr-only">{s.l}</dt>
                  <dd className={`text-2xl font-display font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.n}</dd>
                  <span className={`text-[10px] font-mono tracking-[0.2em] uppercase mt-1 block ${isDark ? s.c : 'text-gray-400'}`} aria-hidden="true">{s.l}</span>
                  {i < 2 && <div className={`absolute right-[-20px] top-1/2 -translate-y-1/2 w-px h-6 ${isDark ? 'bg-purple-500/20' : 'bg-gray-200'}`} aria-hidden="true" />}
                </div>
              ))}
            </motion.dl>
          </div>

          {/* Right side — decorative */}
          <div className="relative hidden lg:block" aria-hidden="true">
            <motion.div style={{ rotateX: reduceMotion ? 0 : tiltX, rotateY: reduceMotion ? 0 : tiltY, x: reduceMotion ? 0 : floatX, y: reduceMotion ? 0 : floatY, transformPerspective: 900 }} className="relative">
              <motion.div initial={{ opacity: 0, scale: 0.96, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0)' }} transition={{ duration: 0.9, delay: 0.35, ease }}
                className="relative rounded-[28px] border border-white/10 backdrop-blur-2xl p-6 overflow-hidden"
                style={{ background: isDark ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))' : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))', boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.55)' : '0 20px 60px rgba(124,58,237,0.12)' }}>
                <div className="absolute -inset-1 opacity-70 pointer-events-none" style={{ background: isDark ? 'radial-gradient(circle at 20% 20%, rgba(34,211,238,0.22), transparent 40%), radial-gradient(circle at 80% 30%, rgba(236,72,153,0.18), transparent 45%), radial-gradient(circle at 50% 80%, rgba(124,58,237,0.20), transparent 50%)' : 'radial-gradient(circle at 20% 20%, rgba(124,58,237,0.10), transparent 42%)' }} />
                <div className="relative rounded-2xl overflow-hidden border border-white/10">
                  <div className="h-56" style={{ background: isDark ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(236,72,153,0.18), rgba(34,211,238,0.14))' : 'linear-gradient(135deg, rgba(124,58,237,0.10), rgba(236,72,153,0.08), rgba(34,211,238,0.06))' }} />
                  <motion.div className="absolute inset-0 opacity-70" animate={reduceMotion ? {} : { x: ['-20%', '120%'] }} transition={reduceMotion ? { duration: 0 } : { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }} style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)', width: '60%', skewX: '-20deg' }} />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-xl text-[10px] font-mono tracking-[0.18em] uppercase text-white/80">VR MODE</div>
                    <div className="px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.06] backdrop-blur-xl text-[10px] font-mono tracking-[0.18em] uppercase text-white/60">ARCADE</div>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 grid grid-cols-3 gap-2">
                    {[{ k: 'SPD', v: '27' }, { k: 'RPM', v: '84' }, { k: 'LVL', v: '05' }].map(x => (
                      <div key={x.k} className="rounded-2xl border border-white/10 bg-black/20 backdrop-blur-xl px-3 py-2"><div className="text-[10px] font-mono tracking-[0.18em] text-white/55">{x.k}</div><div className="text-[16px] font-display font-extrabold text-white/90">{x.v}</div></div>
                    ))}
                  </div>
                </div>
                <div className="relative mt-5 flex items-center justify-between">
                  <div><div className={`text-[12px] font-semibold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>Arcade-ready activations</div><div className={`text-[10px] font-mono tracking-[0.18em] uppercase ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Neon • Motion • Score</div></div>
                  <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${isDark ? 'bg-white/[0.05] border-white/10 text-cyan-200' : 'bg-white border-violet-200/60 text-violet-700'}`}><Bolt className="w-5 h-5" /></div>
                </div>
              </motion.div>
              <FloatingChip title="VR Cycling" subtitle="immersive rides" icon={<Vr className="w-5 h-5" />} tone="cyan" delay={0.55} reduceMotion={!!reduceMotion} className="absolute -top-7 -left-6" />
              <FloatingChip title="LED Races" subtitle="reactive lighting" icon={<Sparkle className="w-5 h-5" />} tone="violet" delay={0.7} reduceMotion={!!reduceMotion} className="absolute -right-8 top-14" />
              <FloatingChip title="Arcade Score" subtitle="fast + competitive" icon={<Bolt className="w-5 h-5" />} tone="pink" delay={0.85} reduceMotion={!!reduceMotion} className="absolute -right-4 bottom-10" />
            </motion.div>
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2" aria-hidden="true">
        <div className={`w-5 h-8 rounded-full border flex items-start justify-center pt-1.5 backdrop-blur-2xl ${isDark ? 'border-purple-500/25 bg-black/10' : 'border-gray-300/60 bg-white/40'}`}>
          <motion.div animate={reduceMotion ? {} : { y: [0, 10, 0] }} transition={reduceMotion ? { duration: 0 } : { duration: 1.5, repeat: Infinity }} className={`w-1 h-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-violet-500'}`} />
        </div>
      </motion.div>
    </section>
  )
}
