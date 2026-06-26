import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Store } from 'lucide-react'
import { useReveal } from '../../hooks/useReveal'

export default function ProviderCTA() {
  const reveal = useReveal({ distance: 14, duration: 0.4 })

  return (
    <section className="site-section bg-white/60">
      <div className="site-container">
        <motion.div
          {...reveal}
          className="relative overflow-hidden rounded-[2rem] border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm sm:p-10 lg:p-14"
        >
          <div className="relative z-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm">
                <Store className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h2 className="font-display text-[clamp(1.55rem,3.6vw,2.25rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-slate-900">
                Are You an Event Service Provider?
              </h2>
              <p className="mt-3 max-w-xl text-[1rem] leading-[1.7] text-slate-600">
                Showcase your services, receive qualified requests, and grow your presence through Eventies.
              </p>
            </div>

            <Link
              to="/contact"
              className="btn-primary shrink-0 rounded-xl px-7 py-3 text-[12px]"
            >
              Join as a Provider
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
