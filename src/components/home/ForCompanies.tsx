import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useReveal } from '../../hooks/useReveal'

const BULLETS = [
  'Save search time',
  'Compare options',
  'Request multiple items together',
  'Track everything from your account',
]

export default function ForCompanies() {
  const reveal = useReveal({ distance: 14, duration: 0.4 })

  return (
    <section className="site-section">
      <div className="site-container">
        <motion.div
          {...reveal}
          className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:p-14"
        >
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_0.45fr]">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-700">
                <span className="h-px w-5 bg-brand-500" />
                For Teams
              </span>
              <h2 className="font-display text-[clamp(1.65rem,4vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-slate-900">
                For Companies, Organizers, and Teams
              </h2>
              <p className="mt-4 max-w-xl text-[1rem] leading-[1.75] text-slate-600">
                Prepare activations, booths, exhibitions, university events, and entertainment zones
                faster with one organized request flow.
              </p>

              <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {BULLETS.map(bullet => (
                  <li key={bullet} className="flex items-center gap-2.5 text-[14px] font-medium text-slate-700">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Link
                to="/products"
                className="btn-primary w-full justify-center rounded-xl px-6 py-3 text-[12px] lg:w-auto"
              >
                Start Exploring
                <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
              </Link>
              <Link
                to="/contact"
                className="btn-outline w-full justify-center rounded-xl px-6 py-3 text-[12px] lg:w-auto"
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
