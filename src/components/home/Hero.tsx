import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
const ease = [0.16, 1, 0.3, 1]

export default function Hero() {
  const { isDark } = useTheme()
  return (
    <section className="relative min-h-[100dvh] flex items-center overflow-hidden">
      {/* Radial glow behind hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[1000px] h-[800px] rounded-full pointer-events-none"
        style={{ background: isDark ? 'radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, rgba(236,72,153,0.06) 40%, transparent 70%)' : 'radial-gradient(ellipse, rgba(124,58,237,0.06) 0%, transparent 60%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 py-32 sm:py-40 w-full">
        <div className="max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0)' }} transition={{ duration: 0.8, delay: 0.1, ease }}>
            <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-full mb-8 ${isDark ? 'bg-prism-violet/15 border border-prism-violet/30' : 'bg-violet-50 border border-violet-200/60'}`}>
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-cyan-400 opacity-75" /><span className={`relative rounded-full h-2 w-2 ${isDark ? 'bg-cyan-400' : 'bg-violet-500'}`} /></span>
              <span className={`text-[12px] font-medium font-mono tracking-wide ${isDark ? 'text-cyan-300' : 'text-violet-700'}`}>Available for Events 2025</span>
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0)' }} transition={{ duration: 1, delay: 0.2, ease }}
            className={`font-display text-[clamp(2.8rem,7.5vw,6rem)] font-extrabold leading-[0.92] tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <span className="block">Cycling Meets</span>
            <span className="block text-glow mt-1">Pure Magic</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45, ease }}
            className={`mt-7 text-lg sm:text-xl leading-relaxed max-w-lg ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>
            Interactive bike-powered activations for events.{' '}
            <span className={isDark ? 'text-cyan-200' : 'text-gray-700'}>LED races, smoothie bikes, VR cycling</span>{' '}and more across Jordan.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease }} className="mt-10 flex flex-wrap gap-3">
            <Link to="/products" className="btn-primary group"><span>Explore Products</span> <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 8h6M8 5l3 3-3 3" /></svg></Link>
            <Link to="/contact" className="btn-outline">Book an Event</Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.85 }} className="mt-14 flex items-center gap-10">
            {[{ n: '50+', l: 'Events', c: 'text-purple-400' },{ n: '20+', l: 'Partners', c: 'text-cyan-400' },{ n: '6', l: 'Products', c: 'text-pink-400' }].map((s, i) => (
              <div key={s.l} className="relative">
                <div className={`text-2xl font-display font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{s.n}</div>
                <div className={`text-[10px] font-mono tracking-[0.2em] uppercase mt-1 ${isDark ? s.c : 'text-gray-400'}`}>{s.l}</div>
                {i < 2 && <div className={`absolute right-[-20px] top-1/2 -translate-y-1/2 w-px h-6 ${isDark ? 'bg-purple-500/20' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className={`w-5 h-8 rounded-full border flex items-start justify-center pt-1.5 ${isDark ? 'border-purple-500/25' : 'border-gray-300/60'}`}>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className={`w-1 h-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-violet-500'}`} />
        </div>
      </motion.div>
    </section>
  )
}
