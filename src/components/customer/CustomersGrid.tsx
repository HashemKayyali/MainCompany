import { motion } from 'framer-motion'
import type { Customer } from '../../data/customers'
import { getDeferredRenderStyle, useRevealGroup } from '../../hooks/useReveal'
import CustomerCard from './CustomerCard'

export default function CustomersGrid({ customers }: { customers: Customer[] }) {
  const { containerProps, itemProps } = useRevealGroup({
    distance: 14,
    stagger: 0.035,
    delayChildren: 0.02,
    margin: '-20px',
  })

  return (
    <motion.div
      {...containerProps}
      className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      style={getDeferredRenderStyle('720px')}
    >
      {customers.map(c => (
        <motion.div key={c.slug} {...itemProps} className="h-full">
          <CustomerCard customer={c} />
        </motion.div>
      ))}
    </motion.div>
  )
}
