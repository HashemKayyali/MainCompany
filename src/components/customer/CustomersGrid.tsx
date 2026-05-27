import { motion } from 'framer-motion'
import type { Customer } from '../../data/customers'
import { useRevealGroup } from '../../hooks/useReveal'
import CustomerCard from './CustomerCard'

export default function CustomersGrid({ customers }: { customers: Customer[] }) {
  const { containerProps, itemProps } = useRevealGroup({
    distance: 12,
    stagger: 0.014,
    delayChildren: 0,
    margin: '0px 0px 10% 0px',
  })

  return (
    <motion.div
      {...containerProps}
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 xl:gap-5"
    >
      {customers.map(c => (
        <motion.div key={c.slug} {...itemProps} className="h-full min-w-0">
          <CustomerCard customer={c} />
        </motion.div>
      ))}
    </motion.div>
  )
}
