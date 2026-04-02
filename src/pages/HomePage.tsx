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

      <section className="site-section-compact relative">
        <div className="site-container relative">
          <div className="section-shell px-3.5 py-5 sm:px-4 sm:py-5.5 lg:px-5">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="relative mb-5 text-center"
            >
              <span className="section-label">// Trusted By</span>
              <h2 className={`section-title ${!isDark ? 'text-gray-900' : ''}`}>
                Our <span className="text-glow">Customers</span>
              </h2>
            </motion.div>

            <CustomersGrid customers={customers.slice(0, 12)} />

            <div className="mt-5 text-center">
              <Link
                to="/customers"
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? 'text-prism-violet hover:text-violet-200'
                    : 'text-violet-600 hover:text-violet-500'
                }`}
              >
                View All {customers.length} Customers
              </Link>
            </div>
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
