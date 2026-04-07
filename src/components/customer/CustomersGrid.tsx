import { motion } from 'framer-motion'
import type { Customer } from '../../data/customers'
import CustomerCard from './CustomerCard'

export default function CustomersGrid({ customers }: { customers: Customer[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:gap-6">
      {customers.map((c, i) => (
        <motion.div
          key={c.slug}
          initial={{ opacity: 0, scale: 0.94, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ delay: Math.min(i * 0.04, 0.28), duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <CustomerCard customer={c} />
        </motion.div>
      ))}
    </div>
  )
}
