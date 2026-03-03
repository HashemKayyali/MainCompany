import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { useData } from '../../contexts/DataContext'
import { social, socialLinks } from '../../data/social'

const ease = [0.16, 1, 0.3, 1] as const

export default function Footer() {
  const { isDark } = useTheme()
  const { products } = useData()
  const reduceMotion = useReducedMotion()

  const sub = isDark ? 'text-purple-200/70' : 'text-gray-600'
  const soft = isDark ? 'text-white/55' : 'text-gray-500'
  const hov = isDark ? 'hover:text-cyan-200' : 'hover:text-violet-700'

  const pages = useMemo(
    () => [
      { to: '/', l: 'Home' },
      { to: '/products', l: 'Products' },
      { to: '/customers', l: 'Customers' },
      { to: '/gallery', l: 'Gallery' },
      { to: '/about', l: 'About' },
      { to: '/contact', l: 'Contact' },
    ],
    []
  )

  const topProducts = useMemo(() => (products || []).slice(0, 6), [products])

  return (
    <footer className="relative overflow-hidden" role="contentinfo" aria-label="Site footer">
      {/* Arcade / nebula frame */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Base */}
        <div className={`absolute inset-0 ${isDark ? 'bg-black/15' : 'bg-white/30'}`} />
        {/* Glow */}
        <div
          className="absolute -top-28 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full opacity-90"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 50% 35%, rgba(124,58,237,0.22) 0%, rgba(236,72,153,0.12) 34%, transparent 72%)'
              : 'radial-gradient(ellipse at 50% 35%, rgba(124,58,237,0.10) 0%, transparent 70%)',
          }}
        />
        {/* Neon grid */}
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
              : 'linear-gradient(rgba(17,24,39,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,24,39,0.05) 1px, transparent 1px)',
            backgroundSize: '96px 96px',
            maskImage: 'radial-gradient(circle at 50% 10%, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(circle at 50% 10%, black 0%, transparent 70%)',
          }}
        />
        {/* Scan line */}
        <motion.div
          className="absolute left-0 right-0 h-[2px] opacity-55"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(34,211,238,0.28), rgba(236,72,153,0.20), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.14), transparent)',
          }}
          animate={reduceMotion ? {} : { top: ['8%', '92%', '8%'] }}
          transition={reduceMotion ? { duration: 0 } : { duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Top border glow */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-80"
          style={{
            background: isDark
              ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.35), rgba(34,211,238,0.22), transparent)'
              : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.18), transparent)',
          }}
        />
      </div>

      <div className={`relative border-t ${isDark ? 'border-white/10' : 'border-violet-200/60'}`}>
        <div className="max-w-7xl mx-auto px-6 py-14">
          {/* Top row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-prism-violet/25">
                  <span className="text-white font-black text-[11px] font-display">BL</span>
                </div>
                <div className="leading-none">
                  <div className={`text-[12px] font-bold tracking-[0.22em] uppercase font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Bike <span className={isDark ? 'text-prism-violet' : 'text-violet-600'}>Land</span>
                  </div>
                  <div className={`text-[10px] mt-1 font-mono tracking-[0.16em] uppercase ${soft}`}>
                    arcade • vr • led
                  </div>
                </div>
              </Link>

              <p className={`text-sm leading-relaxed ${sub}`}>
                Interactive cycling experiences for events across Jordan — built to look amazing and feel competitive.
              </p>

              {/* Mini chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { t: 'Fast setup', c: isDark ? 'text-cyan-200 border-cyan-400/25' : 'text-violet-700 border-violet-200/70' },
                  { t: 'Custom themes', c: isDark ? 'text-purple-200 border-purple-500/25' : 'text-violet-700 border-violet-200/70' },
                  { t: 'Crowd magnet', c: isDark ? 'text-pink-200 border-pink-400/25' : 'text-violet-700 border-violet-200/70' },
                ].map((x, i) => (
                  <motion.div
                    key={x.t}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.7, delay: 0.05 * i, ease }}
                    className={`px-3 py-2 rounded-2xl border backdrop-blur-2xl bg-white/[0.04] text-[10px] font-mono tracking-[0.20em] uppercase ${x.c}`}
                  >
                    {x.t}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Pages */}
            <div>
              <h4 className={`text-[10px] font-mono font-medium mb-3 uppercase tracking-[0.22em] ${soft}`}>Pages</h4>
              <nav className="space-y-2.5">
                {pages.map((lnk, i) => (
                  <motion.div
                    key={lnk.to}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, delay: 0.03 * i, ease }}
                  >
                    <Link
                      to={lnk.to}
                      className={`inline-flex items-center gap-2 text-sm ${sub} ${hov} transition-colors`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-purple-400/60' : 'bg-violet-400/60'}`}
                      />
                      {lnk.l}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Products */}
            <div>
              <h4 className={`text-[10px] font-mono font-medium mb-3 uppercase tracking-[0.22em] ${soft}`}>Products</h4>
              <nav className="space-y-2.5">
                {topProducts.map((p, i) => (
                  <motion.div
                    key={p.slug}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, delay: 0.03 * i, ease }}
                  >
                    <Link
                      to={`/products/${p.slug}`}
                      className={`inline-flex items-center gap-2 text-sm ${sub} ${hov} transition-colors`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-cyan-400/60' : 'bg-violet-400/60'}`}
                      />
                      {p.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </div>

            {/* Connect */}
            <div>
              <h4 className={`text-[10px] font-mono font-medium mb-3 uppercase tracking-[0.22em] ${soft}`}>Connect</h4>
              <div className="space-y-2.5">
                <a href={`mailto:${social.email}`} className={`inline-flex items-center gap-2 text-sm ${sub} ${hov} transition-colors`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-pink-400/60' : 'bg-violet-400/60'}`} />
                  {social.email}
                </a>
                <a href={`tel:${social.phone}`} className={`inline-flex items-center gap-2 text-sm ${sub} ${hov} transition-colors`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-amber-400/60' : 'bg-violet-400/60'}`} />
                  {social.phoneFormatted}
                </a>

                <div className="pt-2 grid grid-cols-2 gap-2">
                  {socialLinks.map((s, i) => (
                    <motion.a
                      key={s.platform}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.55, delay: 0.03 * i, ease }}
                      className={`h-10 px-3 rounded-2xl border backdrop-blur-2xl inline-flex items-center justify-center text-[12px] font-medium transition-all ${
                        isDark
                          ? 'bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]'
                          : 'bg-white/70 border-violet-200/60 text-gray-700 hover:text-gray-900 hover:bg-white'
                      }`}
                      aria-label={`Follow us on ${s.platform}`}
                    >
                      {s.platform}
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className={`mt-12 pt-6 border-t ${isDark ? 'border-white/10' : 'border-violet-200/50'} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}>
            <p className={`text-[11px] font-mono tracking-[0.12em] uppercase ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
              © {new Date().getFullYear()} Bike Land Jordan
            </p>

            <div className="flex items-center gap-3">
              <Link to="/contact" className="btn-primary !h-10 !px-4 !rounded-2xl !text-[12px]">
                Book an Event
              </Link>
              <Link
                to="/products"
                className={`h-10 px-4 rounded-2xl border inline-flex items-center justify-center text-[12px] font-medium transition-all ${
                  isDark
                    ? 'bg-white/[0.03] border-white/10 text-white/70 hover:text-white hover:bg-white/[0.06]'
                    : 'bg-white/70 border-violet-200/60 text-gray-700 hover:text-gray-900 hover:bg-white'
                }`}
              >
                Explore
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Small local shimmer animation */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          * { scroll-behavior: auto; }
        }
      `}</style>
    </footer>
  )
}
