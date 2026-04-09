import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import CustomersGrid from '../components/customer/CustomersGrid'
import Hero from '../components/home/Hero'
import FeaturedProducts from '../components/home/FeaturedProducts'
import HomeSectionBackground from '../components/home/HomeSectionBackground'
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
      {/* Hero — untouched */}
      <Hero />

      {/* ── All below-hero content wrapped in ambient background ── */}
      <HomeSectionBackground>

        <StatsStrip />
        <OfferSection />
        <FeaturedProducts />

        {/* ── Partners / Customers ── */}
        <section className="site-section">
          <div className="site-container">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
              className="mb-10 sm:mb-12"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-3 flex items-center gap-2.5">
                    <span className="section-label">// Partnerships</span>
                    <div
                      className="h-px w-8"
                      style={{
                        background: isDark ? 'rgba(124,58,237,0.28)' : 'rgba(124,58,237,0.25)',
                      }}
                    />
                  </div>
                  <h2 className={`section-title !mt-0 ${!isDark ? 'text-gray-900' : ''}`}>
                    Trusted by industry{' '}
                    <span className="text-glow">leaders</span>
                  </h2>
                  <p
                    className={`mt-3 max-w-lg text-[0.93rem] leading-relaxed ${
                      isDark ? 'text-purple-100/52' : 'text-gray-500'
                    }`}
                  >
                    A growing network of premium brands that rely on our marketplace to power world-class events.
                  </p>
                </div>

                <Link
                  to="/customers"
                  className="btn-outline group inline-flex shrink-0 items-center gap-2 self-start sm:self-auto"
                >
                  <span>All {customers.length} partners</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </Link>
              </div>
            </motion.div>

            <CustomersGrid customers={customers.slice(0, 12)} />
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="site-section">
          <div className="mx-auto max-w-4xl px-4 sm:px-5">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease }}
            >
              <div
                className={`relative overflow-hidden rounded-[28px] border px-6 py-11 text-center sm:px-10 sm:py-16 ${
                  isDark
                    ? 'border-white/[0.08] bg-[linear-gradient(165deg,rgba(16,12,36,0.90),rgba(8,8,22,0.72))]'
                    : 'border-violet-100 bg-white'
                }`}
                style={
                  isDark
                    ? {
                        backdropFilter: 'blur(22px)',
                        WebkitBackdropFilter: 'blur(22px)',
                        boxShadow:
                          '0 30px 80px rgba(2,6,18,0.38), inset 0 1px 0 rgba(255,255,255,0.05)',
                      }
                    : { boxShadow: '0 20px 56px rgba(15,23,42,0.07)' }
                }
              >
                {/* Background glows */}
                {isDark && (
                  <>
                    <div
                      className="pointer-events-none absolute -top-20 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full blur-3xl"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(124,58,237,0.24) 0%, transparent 70%)',
                      }}
                    />
                    <div
                      className="pointer-events-none absolute -bottom-16 left-1/2 h-36 w-72 -translate-x-1/2 rounded-full blur-3xl"
                      style={{
                        background:
                          'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.5) 50%, transparent 90%)',
                      }}
                    />
                  </>
                )}

                <div className="relative">
                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div
                      className="flex h-13 w-13 items-center justify-center rounded-[18px]"
                      style={{
                        background:
                          'linear-gradient(135deg, rgba(124,58,237,0.32), rgba(236,72,153,0.26), rgba(6,182,212,0.20))',
                        border: '1px solid rgba(167,139,250,0.22)',
                        boxShadow: isDark ? '0 8px 24px rgba(124,58,237,0.2)' : 'none',
                      }}
                    >
                      <Sparkles
                        className={`h-5 w-5 ${isDark ? 'text-violet-300' : 'text-violet-600'}`}
                        strokeWidth={1.9}
                      />
                    </div>
                  </div>

                  <span className="section-label">// Get Started</span>
                  <h2 className={`mt-2 section-title ${!isDark ? 'text-gray-900' : ''}`}>
                    Let us make your{' '}
                    <span className="text-glow">next event unforgettable</span>
                  </h2>
                  <p
                    className={`mx-auto mt-4 max-w-lg text-[0.9rem] leading-relaxed ${
                      isDark ? 'text-purple-200/52' : 'text-gray-500'
                    }`}
                  >
                    Tell us about your event and we handle everything — from planning to execution.
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/contact"
                      className="btn-primary !min-h-[48px] !rounded-[16px] !px-8 !text-[12px]"
                    >
                      Plan Your Event
                    </Link>
                    <a
                      href={social.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline !min-h-[48px] !rounded-[16px] !px-8 !text-[12px]"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </HomeSectionBackground>
    </>
  )
}
