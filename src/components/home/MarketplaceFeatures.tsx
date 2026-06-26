import { motion } from 'framer-motion'
import {
  CalendarCheck,
  CheckCircle,
  ClipboardList,
  FileText,
  LayoutGrid,
  MessageSquareQuote,
} from 'lucide-react'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import SectionHeader from './SectionHeader'

const FEATURES = [
  {
    key: 'catalog',
    title: 'Organized Catalog',
    description: 'Everything grouped by category, event type, and use case.',
    icon: LayoutGrid,
  },
  {
    key: 'rental',
    title: 'Rental Requests',
    description: 'Reserve items for your event dates with clear pricing.',
    icon: CalendarCheck,
  },
  {
    key: 'quote',
    title: 'Quote Requests',
    description: 'Ask for custom packages or multiple items in one go.',
    icon: MessageSquareQuote,
  },
  {
    key: 'availability',
    title: 'Availability Check',
    description: 'See what is ready for your event window before requesting.',
    icon: CheckCircle,
  },
  {
    key: 'tracking',
    title: 'Request Tracking',
    description: 'Follow your rental and quote requests from your account.',
    icon: ClipboardList,
  },
  {
    key: 'review',
    title: 'Admin Review',
    description: 'Every request is reviewed so details are confirmed properly.',
    icon: FileText,
  },
]

export default function MarketplaceFeatures() {
  const headerReveal = useReveal({ distance: 14, duration: 0.4 })
  const { containerProps, itemProps } = useRevealGroup({
    distance: 12,
    duration: 0.34,
    stagger: 0.04,
  })

  return (
    <section className="site-section">
      <div className="site-container">
        <motion.div {...headerReveal} className="text-center">
          <SectionHeader
            eyebrow="Why Eventies"
            title="A Smarter Way to Prepare Events"
            align="center"
          />
        </motion.div>

        <motion.div
          {...containerProps}
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURES.map(feature => {
            const Icon = feature.icon
            return (
              <motion.div key={feature.key} {...itemProps}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-600">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-4 font-display text-[1.08rem] font-bold tracking-[-0.02em] text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.6] text-slate-500">
                    {feature.description}
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
