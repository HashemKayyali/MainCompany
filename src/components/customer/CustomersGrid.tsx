import { motion } from 'framer-motion'
import type { Customer } from '../../data/customers'
import CustomerCard from './CustomerCard'

export default function CustomersGrid({ customers }: { customers: Customer[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 lg:gap-8 xl:grid-cols-6 xl:gap-10">
      {customers.map((c, i) => (
        <motion.div
          key={c.slug}
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <CustomerCard customer={c} />
        </motion.div>
      ))}
    </div>
  )
}
