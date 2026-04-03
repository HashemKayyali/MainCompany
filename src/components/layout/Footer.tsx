import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Users } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useData } from '../../contexts/DataContext'
import { social, socialLinks } from '../../data/social'

const ease = [0.16, 1, 0.3, 1] as const

export default function Footer() {
  const { isDark } = useTheme()
  const { products } = useData()
  const reduceMotion = useReducedMotion()

  const pages = useMemo(
    () => [
      { to: '/', label: 'Home' },
      { to: '/products', label: 'Products' },
      { to: '/customers', label: 'Customers' },
      { to: '/gallery', label: 'Gallery' },
      { to: '/about', label: 'About' },
      { to: '/contact', label: 'Contact' },
    ],
    []
  )

  const topProducts = useMemo(() => (products || []).slice(0, 5), [products])

  const subtle = isDark ? 'text-purple-100/60' : 'text-gray-500'
  const body = isDark ? 'text-purple-100/72' : 'text-gray-600'
  const linkClass = isDark
    ? 'text-white/76 hover:text-white'
    : 'text-gray-700 hover:text-gray-900'

  return (
    <footer className="relative overflow-hidden pb-5 pt-5 sm:pb-4 sm:pt-4" role="contentinfo" aria-label="Site footer">
      <div
        className="pointer-events-none absolute inset-x-[8%] top-0 h-56 rounded-full blur-3xl"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, rgba(124,58,237,0.14), rgba(236,72,153,0.12), rgba(34,211,238,0.12))'
            : 'linear-gradient(90deg, rgba(124,58,237,0.1), rgba(236,72,153,0.07), rgba(34,211,238,0.08))',
        }}
      />

      <div className="site-container">
        <div className="section-shell px-3.5 py-4.5 sm:px-4 lg:px-4.5 lg:py-5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(124,58,237,0.14),transparent_28%),radial-gradient(circle_at_84%_16%,rgba(34,211,238,0.1),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,0.1),transparent_26%)]" />

          <div className="relative grid gap-4.5 md:grid-cols-2 lg:grid-cols-[1.02fr_0.72fr_0.78fr_0.88fr]">
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.65, ease }}
              className="max-w-md"
            >
              <div className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3.25 py-1.5 backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" strokeWidth={1.8} />
                <span
                  className={`text-[10px] uppercase tracking-[0.2em] ${
                    isDark ? 'text-white/70' : 'text-violet-700'
                  }`}
                >
                  Premium Marketplace
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[14px] border border-white/12 bg-[linear-gradient(145deg,#7c3aed_0%,#d946ef_48%,#22d3ee_115%)] shadow-[0_18px_40px_rgba(76,29,149,0.28)]">
                  <div className="absolute inset-x-2 top-1.5 h-4 rounded-full bg-white/20 blur-md" />
                  <span className="relative text-[11px] font-black tracking-[0.22em] text-white">
                    BL
                  </span>
                </div>

                <div className="leading-none">
                  <div
                    className={`font-display text-[11px] font-bold uppercase tracking-[0.2em] ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Bike <span className="text-violet-300">Land</span>
                  </div>
                    <div className={`mt-1 text-[10px] uppercase tracking-[0.16em] ${subtle}`}>
                    Marketplace / Vendors / Requests
                  </div>
                </div>
              </div>

              <p className={`mt-3 text-[12px] leading-6 sm:text-[12.5px] ${body}`}>
                A premium digital marketplace for discovering, comparing, and booking trusted
                event services with a more polished brand experience from first visit to final
                inquiry.
              </p>

              <div className="mt-3.5 flex flex-wrap gap-1.5">
                {[
                  { label: 'Trusted vendors', icon: ShieldCheck },
                  { label: 'Fast discovery', icon: Sparkles },
                  { label: 'Across Jordan', icon: MapPin },
                ].map((item, index) => {
                  const Icon = item.icon

                  return (
                    <motion.div
                      key={item.label}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.45, delay: 0.06 * index, ease }}
                      className={`inline-flex min-h-[34px] items-center gap-1.75 rounded-full border px-2.5 py-1.25 text-[9px] uppercase tracking-[0.14em] ${
                        isDark
                          ? 'border-white/10 bg-white/[0.04] text-white/74'
                          : 'border-violet-200/70 bg-white/80 text-violet-700'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-violet-300" strokeWidth={1.8} />
                      {item.label}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.04, ease }}
            >
              <div className={`text-[10px] font-mono uppercase tracking-[0.22em] ${subtle}`}>
                Navigate
              </div>
              <div className="mt-2.5 space-y-1.5">
                {pages.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`group flex min-h-[42px] items-center justify-between rounded-[14px] border px-3 py-2 text-[12px] font-medium transition-all ${
                      isDark
                        ? 'border-white/8 bg-white/[0.03] hover:border-violet-300/18 hover:bg-white/[0.05]'
                        : 'border-violet-200/70 bg-white/80 hover:border-violet-300 hover:bg-white'
                    } ${linkClass}`}
                  >
                    <span>{item.label}</span>
                    <ArrowRight
                      className="h-3.5 w-3.5 opacity-50 transition-transform duration-300 group-hover:translate-x-0.5"
                      strokeWidth={1.8}
                    />
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.08, ease }}
            >
              <div className={`text-[10px] font-mono uppercase tracking-[0.22em] ${subtle}`}>
                Featured Services
              </div>
              <div className="mt-2.5 space-y-1.5">
                {topProducts.map((item) => (
                  <Link
                    key={item.slug}
                    to={`/products/${item.slug}`}
                    className={`block rounded-[14px] border px-3 py-2 text-[12px] transition-all ${
                      isDark
                        ? 'border-white/8 bg-white/[0.03] hover:border-cyan-300/18 hover:bg-white/[0.05]'
                        : 'border-violet-200/70 bg-white/80 hover:border-violet-300 hover:bg-white'
                    } ${linkClass}`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className={`mt-1 text-[10px] uppercase tracking-[0.14em] ${subtle}`}>
                      {item.categoryTags?.[0] || 'Marketplace'}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.12, ease }}
            >
              <div className={`text-[10px] font-mono uppercase tracking-[0.22em] ${subtle}`}>
                Connect
              </div>

              <div className="mt-2.5 space-y-2">
                <div
                  className={`rounded-[15px] border px-3 py-2.5 ${
                    isDark ? 'border-white/8 bg-white/[0.03]' : 'border-violet-200/70 bg-white/80'
                  }`}
                >
                  <div className={`text-[10px] uppercase tracking-[0.2em] ${subtle}`}>Email</div>
                  <a
                    href={`mailto:${social.email}`}
                    className={`mt-1.5 block text-[0.92rem] font-medium transition-colors ${linkClass}`}
                  >
                    {social.email}
                  </a>
                </div>

                <div
                  className={`rounded-[15px] border px-3 py-2.5 ${
                    isDark ? 'border-white/8 bg-white/[0.03]' : 'border-violet-200/70 bg-white/80'
                  }`}
                >
                  <div className={`text-[10px] uppercase tracking-[0.2em] ${subtle}`}>Phone</div>
                  <a
                    href={`tel:${social.phone}`}
                    className={`mt-1.5 block text-[0.92rem] font-medium transition-colors ${linkClass}`}
                  >
                    {social.phoneFormatted}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {socialLinks.map((item, index) => (
                    <motion.a
                      key={item.platform}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-80px' }}
                      transition={{ duration: 0.45, delay: 0.04 * index, ease }}
                    className={`inline-flex min-h-[42px] items-center justify-center rounded-[14px] border px-3 text-[11px] font-medium transition-all ${
                        isDark
                          ? 'border-white/8 bg-white/[0.03] text-white/76 hover:border-violet-300/18 hover:bg-white/[0.05] hover:text-white'
                          : 'border-violet-200/70 bg-white/80 text-gray-700 hover:border-violet-300 hover:bg-white hover:text-gray-900'
                      }`}
                      aria-label={`Follow us on ${item.platform}`}
                    >
                      {item.platform}
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div
            className={`relative mt-5 flex flex-col gap-3.5 border-t pt-4 sm:flex-row sm:items-center sm:justify-between ${
              isDark ? 'border-white/8' : 'border-violet-200/60'
            }`}
          >
            <div>
              <p className={`text-[10px] uppercase tracking-[0.14em] ${subtle}`}>
                (c) {new Date().getFullYear()} Bike Land
              </p>
              <p className={`mt-1.5 text-[0.92rem] ${body}`}>
                A more immersive premium experience for exploring and booking event services.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Link to="/products" className="btn-outline">
                Explore Services
              </Link>
              <Link to="/contact" className="btn-primary">
                <Users className="h-4 w-4" strokeWidth={1.9} />
                Plan Your Event
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
