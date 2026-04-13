import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import Hero from '../components/home/Hero'
import FeaturedProducts from '../components/home/FeaturedProducts'
import LogoCloud from '../components/home/LogoCloud'
import OfferSection from '../components/home/OfferSection'
import StatsStrip from '../components/home/StatsStrip'
import { useTheme } from '../contexts/ThemeContext'
import { social } from '../data/social'
import { usePageMeta } from '../hooks/usePageMeta'
import { useReveal } from '../hooks/useReveal'
import { preloadRoute } from '../utils/route-preload'

export default function HomePage() {
  usePageMeta({
    title: 'Home',
    description:
      'Premium event services marketplace in Jordan for discovering, comparing, and booking trusted vendors across categories.',
  })

  const { isDark } = useTheme()
  const ctaReveal = useReveal({ distance: 18, duration: 0.42, margin: '0px 0px 16% 0px' })

  return (
    <>
      {/* Hero — untouched */}
      <Hero />

      {/* Pull StatsStrip into hero's fade zone for seamless blending */}
      <div className="relative z-10 -mt-24 sm:-mt-28">
        <StatsStrip />
      </div>

      <FeaturedProducts />
      <OfferSection />

      <LogoCloud />

        {/* ── CTA ── */}
        <section className="site-section">
          <div className="mx-auto max-w-4xl px-4 sm:px-5">
            <motion.div {...ctaReveal}>
              <div
                className={`relative overflow-hidden rounded-[28px] border px-6 py-11 text-center sm:px-10 sm:py-16 ${
                  isDark
                    ? 'border-white/[0.08] bg-[linear-gradient(165deg,rgba(16,12,36,0.94),rgba(8,8,22,0.88))]'
                    : 'border-violet-100 bg-white'
                }`}
                style={
                  isDark
                    ? {
                        boxShadow:
                          '0 24px 64px rgba(2,6,18,0.24), inset 0 1px 0 rgba(255,255,255,0.05)',
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
                      onMouseEnter={() => preloadRoute('/contact')}
                      onFocus={() => preloadRoute('/contact')}
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

    </>
  )
}
