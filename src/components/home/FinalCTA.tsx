import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useReveal } from '../../hooks/useReveal'

export default function FinalCTA() {
  const reveal = useReveal({ distance: 14, duration: 0.4 })

  return (
    <section className="site-section">
      <div className="site-container">
        <motion.div
          {...reveal}
          className="relative overflow-hidden rounded-[2rem] bg-slate-900 p-8 text-center shadow-xl sm:p-12 lg:p-16"
        >
          {/* subtle glow */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-full w-full -translate-x-1/2 opacity-30"
            style={{
              background:
                'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(124,58,237,0.35) 0%, transparent 70%)',
            }}
            aria-hidden="true"
          />

          <div className="relative z-10 mx-auto max-w-2xl">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-brand-300">
              <Sparkles className="h-6 w-6" strokeWidth={1.8} />
            </div>
            <h2 className="font-display text-[clamp(1.8rem,4.5vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-white">
              Ready to Plan Your Next Event?
            </h2>
            <p className="mt-4 text-[1rem] leading-[1.75] text-slate-300">
              Explore the marketplace, compare options, and send a single request for everything you need.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-3 text-[12px] font-bold text-slate-900 shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Explore Products
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3 text-[12px] font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Request a Quote
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
