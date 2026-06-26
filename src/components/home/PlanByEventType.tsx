import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, GraduationCap, PartyPopper, Rocket, Store, Trophy } from 'lucide-react'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import SectionHeader from './SectionHeader'

const EVENT_TYPES = [
  {
    key: 'corporate',
    label: 'Corporate Activations',
    description: 'Team-building, brand days, and employee engagement setups.',
    icon: Building2,
    to: '/products',
  },
  {
    key: 'exhibitions',
    label: 'Exhibitions & Booths',
    description: 'Booths, displays, screens, and traffic-stopping activations.',
    icon: Store,
    to: '/products',
  },
  {
    key: 'private',
    label: 'Private Parties',
    description: 'Games, photo ops, and entertainment for birthdays and celebrations.',
    icon: PartyPopper,
    to: '/products',
  },
  {
    key: 'gaming',
    label: 'Gaming Zones',
    description: 'VR, arcade, racing, and competitive game stations.',
    icon: Trophy,
    to: '/products',
  },
  {
    key: 'university',
    label: 'University Events',
    description: 'Campus activations, orientation days, and student entertainment.',
    icon: GraduationCap,
    to: '/products',
  },
  {
    key: 'launches',
    label: 'Brand Launches',
    description: 'Product reveals, red carpets, and premium production support.',
    icon: Rocket,
    to: '/products',
  },
]

export default function PlanByEventType() {
  const headerReveal = useReveal({ distance: 14, duration: 0.4 })
  const { containerProps, itemProps } = useRevealGroup({
    distance: 12,
    duration: 0.34,
    stagger: 0.04,
  })

  return (
    <section className="site-section bg-white/60">
      <div className="site-container">
        <motion.div {...headerReveal}>
          <SectionHeader
            eyebrow="Event Planner"
            title="Plan by Event Type"
            description="Find the right setup faster by choosing the type of event you’re preparing."
          />
        </motion.div>

        <motion.div
          {...containerProps}
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {EVENT_TYPES.map(item => {
            const Icon = item.icon
            return (
              <motion.div key={item.key} {...itemProps}>
                <Link
                  to={item.to}
                  className="group flex h-full items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 transition-colors group-hover:bg-brand-50 group-hover:text-brand-600">
                    <Icon className="h-6 w-6" strokeWidth={1.8} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display text-[1.08rem] font-bold tracking-[-0.02em] text-slate-900">
                        {item.label}
                      </h3>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
                    </div>
                    <p className="mt-1 text-[13px] leading-[1.6] text-slate-500">{item.description}</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
