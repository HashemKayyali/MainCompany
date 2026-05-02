import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, ArrowUpRight } from 'lucide-react'
import Hero from '../components/home/Hero'
import FeaturedProducts from '../components/home/FeaturedProducts'
import LogoCloud from '../components/home/LogoCloud'
import OfferSection from '../components/home/OfferSection'
import StatsStrip from '../components/home/StatsStrip'
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

  const ctaReveal = useReveal({ distance: 18, duration: 0.42, margin: '0px 0px 16% 0px' })

  return (
    <>
      <Hero />

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
              className="relative overflow-hidden rounded-[32px] border border-violet-200/70 bg-white px-6 py-12 text-center sm:px-12 sm:py-20"
              style={{
                boxShadow:
                  '0 32px 80px -24px rgba(124,58,237,0.32), 0 12px 28px -10px rgba(124,58,237,0.18), inset 0 1px 0 rgba(255,255,255,0.95)',
              }}
            >
              {/* Background accents */}
              <div
                className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, rgba(168,85,247,0.32) 0%, rgba(124,58,237,0.10) 40%, transparent 70%)',
                }}
              />
              <div
                className="pointer-events-none absolute -bottom-20 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full blur-3xl"
                style={{
                  background:
                    'radial-gradient(circle, rgba(217,70,239,0.16) 0%, transparent 70%)',
                }}
              />
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 8%, rgba(168,85,247,0.45) 50%, transparent 92%)',
                }}
              />

              {/* Decorative dot grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(rgba(124,58,237,0.20) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                  maskImage:
                    'radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 80%)',
                  WebkitMaskImage:
                    'radial-gradient(ellipse 60% 60% at 50% 50%, black 30%, transparent 80%)',
                }}
              />

              <div className="relative">
                <div className="mb-6 flex justify-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-[18px]"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed, #a855f7 50%, #c026d3)',
                      boxShadow: '0 14px 36px -8px rgba(124,58,237,0.55)',
                    }}
                  >
                    <Sparkles className="h-6 w-6 text-white" strokeWidth={2.0} />
                  </div>
                </div>

                <span className="section-label">Get Started</span>
                <h2 className="mt-3 section-title">
                  Let us make your{' '}
                  <span className="text-glow">next event unforgettable</span>
                </h2>
                <p
                  className="mx-auto mt-5 max-w-xl text-[0.96rem] leading-[1.75]"
                  style={{ color: 'rgba(61, 35, 112, 0.78)' }}
                >
                  Tell us about your event and we'll handle everything — from planning and curation
                  to flawless execution on the day.
                </p>

                <div className="mt-9 flex flex-wrap justify-center gap-3">
                  <Link
                    to="/contact"
                    onMouseEnter={() => preloadRoute('/contact')}
                    onFocus={() => preloadRoute('/contact')}
                    className="btn-primary !min-h-[50px] !rounded-[16px] !px-9 !text-[12px]"
                  >
                    Plan Your Event
                    <ArrowUpRight className="h-4 w-4" strokeWidth={2.2} />
                  </Link>
                  <a
                    href={social.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline !min-h-[50px] !rounded-[16px] !px-9 !text-[12px]"
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
