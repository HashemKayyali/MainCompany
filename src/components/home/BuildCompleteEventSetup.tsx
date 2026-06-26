import { motion } from 'framer-motion'
import {
  Clapperboard,
  Gamepad2,
  PartyPopper,
  Settings,
} from 'lucide-react'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import SectionHeader from './SectionHeader'

const GROUPS = [
  {
    key: 'entertainment',
    title: 'Entertainment',
    items: ['VR experiences', 'Arcade games', 'Racing simulators', 'Basketball games'],
    icon: Gamepad2,
  },
  {
    key: 'production',
    title: 'Production',
    items: ['LED screens', 'Lighting', 'Sound systems', 'Staging'],
    icon: Clapperboard,
  },
  {
    key: 'activations',
    title: 'Brand Activations',
    items: ['Booths', 'Displays', 'Interactive experiences', 'Photo ops'],
    icon: PartyPopper,
  },
  {
    key: 'support',
    title: 'Event Support',
    items: ['Photography', 'Setup help', 'Custom quote services', 'On-site support'],
    icon: Settings,
  },
]

export default function BuildCompleteEventSetup() {
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
            eyebrow="Mix & Match"
            title="Build a Complete Event Setup"
            description="Mix rentals, games, screens, booths, and services into one request."
          />
        </motion.div>

        <motion.div
          {...containerProps}
          className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {GROUPS.map(group => {
            const Icon = group.icon
            return (
              <motion.div key={group.key} {...itemProps}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                  </div>
                  <h3 className="mt-4 font-display text-[1.1rem] font-bold tracking-[-0.02em] text-slate-900">
                    {group.title}
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {group.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-[13px] text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
