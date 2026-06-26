import { motion } from 'framer-motion'
import { ClipboardList, MousePointerClick, SearchCheck } from 'lucide-react'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import SectionHeader from './SectionHeader'

const STEPS = [
  {
    key: 'browse',
    num: '01',
    title: 'Browse',
    description: 'Explore rentals, services, and event equipment.',
    icon: SearchCheck,
  },
  {
    key: 'choose',
    num: '02',
    title: 'Choose',
    description: 'Check details, images, pricing, and availability.',
    icon: MousePointerClick,
  },
  {
    key: 'request',
    num: '03',
    title: 'Request',
    description: 'Send a rental or quote request for review.',
    icon: ClipboardList,
  },
]

export default function HowItWorks() {
  const headerReveal = useReveal({ distance: 14, duration: 0.4 })
  const { containerProps, itemProps } = useRevealGroup({
    distance: 12,
    duration: 0.34,
    stagger: 0.08,
  })

  return (
    <section className="site-section">
      <div className="site-container">
        <motion.div {...headerReveal} className="text-center">
          <SectionHeader
            eyebrow="Simple Process"
            title="How Eventies Works"
            align="center"
          />
        </motion.div>

        <motion.div
          {...containerProps}
          className="relative mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {/* Connecting line (desktop) */}
          <div
            className="pointer-events-none absolute left-0 right-0 top-[3.25rem] hidden h-px bg-slate-200 sm:block"
            aria-hidden="true"
          />

          {STEPS.map(item => {
            const Icon = item.icon
            return (
              <motion.div key={item.key} {...itemProps} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative z-10 flex h-[6.5rem] w-[6.5rem] items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                      <Icon className="h-7 w-7" strokeWidth={1.8} />
                    </div>
                  </div>
                  <div className="mt-5 inline-flex h-7 items-center rounded-full bg-slate-100 px-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-600">
                    Step {item.num}
                  </div>
                  <h3 className="mt-4 font-display text-[1.25rem] font-bold tracking-[-0.02em] text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-[14px] leading-[1.65] text-slate-500">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
