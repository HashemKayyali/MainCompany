import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import CustomersGrid from '../components/customer/CustomersGrid'
import Hero from '../components/home/Hero'
import OfferSection from '../components/home/OfferSection'
import StatsStrip from '../components/home/StatsStrip'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { social } from '../data/social'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1] as const

export default function HomePage() {
  usePageMeta({
    title: 'Home',
    description:
      'Premium event services marketplace in Jordan for discovering, comparing, and booking trusted vendors across categories.',
  })

  const { customers } = useData()
  const { isDark } = useTheme()

  return (
    <>
      <Hero />
      <StatsStrip />
      <OfferSection />

      <section className={`site-section relative overflow-hidden ${isDark ? 'border-y border-white/[0.04]' : 'border-y border-gray-100 bg-gray-50/50'}`}>
        {/* Cinematic ambient background */}
        {isDark && <div className="pointer-events-none absolute inset-0 bg-[#04060e]" />}
        <div 
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background: isDark 
              ? 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(34,211,238,0.05) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.05) 0%, transparent 60%)'
          }}
        />
        
        <div className="site-container relative py-12 sm:py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="relative mb-12 text-center sm:mb-16 md:mb-20"
          >
            <div className={`mx-auto mb-5 inline-flex h-8 items-center rounded-full border px-3.5 text-[10.5px] font-bold uppercase tracking-widest ${
              isDark ? 'border-white/10 bg-white/5 text-purple-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]' 
                     : 'border-violet-200 bg-white text-violet-600 shadow-sm'
            }`}>
              <span className={`mr-2.5 inline-block h-1.5 w-1.5 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-violet-500'} animate-pulse`} style={{ boxShadow: isDark ? '0 0 10px rgba(34,211,238,0.8)' : '' }} />
              Global Partnerships
            </div>
            <h2 className={`font-display text-[2.2rem] font-bold tracking-tight sm:text-[3rem] md:text-[3.5rem] leading-[1.05] ${!isDark ? 'text-gray-900' : 'text-white'}`}>
              Trusted by industry <span className="text-glow">leaders</span>
            </h2>
            <p className={`mt-5 text-[1.05rem] sm:text-[1.15rem] max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-purple-100/60' : 'text-gray-500'}`}>
              Join an elite network of premium brands defining the future of world-class events, productions, and immersive experiences across the region.
            </p>
          </motion.div>

          <CustomersGrid customers={customers.slice(0, 12)} />

          <div className="mt-16 text-center sm:mt-24">
            <Link
              to="/customers"
              className={`group inline-flex items-center justify-center gap-3 rounded-[16px] border px-7 py-4 text-[0.95rem] font-bold tracking-wide transition-all duration-500 ${
                isDark 
                  ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] text-white/90 hover:border-white/20 hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.1),rgba(255,255,255,0.03))] hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.3)]' 
                  : 'border-violet-200 bg-white text-violet-700 shadow-sm hover:border-violet-300 hover:bg-violet-50'
              }`}
            >
              <span>Explore all {customers.length} partners</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1.5 group-hover:text-cyan-400">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <section className="site-section relative overflow-hidden">
        <div className="relative mx-auto max-w-5xl px-3.5 sm:px-4.5">
          <div className="section-shell px-3.5 py-6 text-center sm:px-5 sm:py-7">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.18),transparent_34%),radial-gradient(circle_at_18%_100%,rgba(236,72,153,0.12),transparent_28%),radial-gradient(circle_at_84%_18%,rgba(34,211,238,0.10),transparent_26%)]" />

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease }}
              className="relative"
            >
              <span className="section-label">// Signature Planning Flow</span>
              <h2
                className={`mt-2 font-display text-[1.9rem] font-extrabold tracking-tight leading-[0.95] sm:text-[2.35rem] lg:text-[2.85rem] ${
                  !isDark ? 'text-gray-900' : ''
                }`}
              >
                Let us make your
                <br />
                <span className="text-glow">next event unforgettable</span>
              </h2>
              <p
                className={`mt-2.5 mx-auto max-w-xl text-[0.84rem] ${
                  isDark ? 'text-purple-200/70' : 'text-gray-500'
                }`}
              >
                Tell us about your event. We handle everything.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Link to="/contact" className="btn-primary">
                  Plan Your Event
                </Link>
                <a
                  href={social.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline"
                >
                  WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
