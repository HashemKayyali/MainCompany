import { motion } from 'framer-motion'
import type { Customer } from '../../data/customers'
import CustomerCard from './CustomerCard'

export default function CustomersGrid({ customers }: { customers: Customer[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {customers.map((c, i) => (
        <motion.div
          key={c.slug}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ delay: Math.min(i * 0.03, 0.22), duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="h-full"
        >
          <CustomerCard customer={c} />
        </motion.div>
      ))}
    </div>
  )
}
