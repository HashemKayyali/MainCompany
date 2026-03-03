import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1] as const

const SUGGESTIONS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/products', label: 'Products', icon: '🚴' },
  { to: '/gallery', label: 'Gallery', icon: '📸' },
  { to: '/contact', label: 'Contact', icon: '💬' },
]

export default function NotFoundPage() {
  const { isDark } = useTheme()
  const reduceMotion = useReducedMotion()
  usePageMeta({ title: '404 — Page Not Found', noIndex: true })

  return (
    <section className="min-h-[100dvh] flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.12), transparent 60%)'
            : 'radial-gradient(ellipse at 50% 30%, rgba(124,58,237,0.06), transparent 60%)',
        }}
      />

      {/* Floating particles */}
      {!reduceMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1 h-1 rounded-full ${isDark ? 'bg-purple-400/40' : 'bg-violet-300/40'}`}
              style={{
                left: `${15 + Math.random() * 70}%`,
                top: `${15 + Math.random() * 70}%`,
              }}
              animate={{ y: [0, -15, 0], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
        className="relative text-center max-w-lg"
      >
        {/* Big 404 */}
        <motion.h1
          className={`text-[clamp(100px,20vw,180px)] font-display font-extrabold leading-none ${
            isDark ? 'text-glow' : 'text-violet-200'
          }`}
          animate={reduceMotion ? {} : { scale: [1, 1.02, 1] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          404
        </motion.h1>

        {/* Glowing line */}
        <div className="mx-auto w-32 h-px mb-6 mt-2" style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(34,211,238,0.3), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)',
        }} />

        <h2 className={`text-xl sm:text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'} -mt-2`}>
          Lost in the <span className={isDark ? 'text-cyan-400' : 'text-violet-600'}>arcade</span>?
        </h2>

        <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>
          This page doesn't exist — but plenty of awesome ones do.
        </p>

        {/* Quick links */}
        <div className="mt-8 grid grid-cols-2 gap-2.5">
          {SUGGESTIONS.map((s, i) => (
            <motion.div
              key={s.to}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease }}
            >
              <Link
                to={s.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-white/[0.03] border-white/10 hover:border-purple-500/30 text-purple-100/80 hover:text-white'
                    : 'bg-white/70 border-violet-200/60 hover:border-violet-300 text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="text-lg" aria-hidden="true">{s.icon}</span>
                <span className="text-[13px] font-medium">{s.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <Link to="/" className="btn-primary inline-flex">
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </section>
  )
}
