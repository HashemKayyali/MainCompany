import { motion } from 'framer-motion'
import type { Customer } from '../../data/customers'
import CustomerCard from './CustomerCard'

export default function CustomersGrid({ customers }: { customers: Customer[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4 xl:grid-cols-6">
      {customers.map((c, i) => (
        <motion.div
          key={c.slug}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.03, duration: 0.4 }}
          className="h-full"
        >
          <CustomerCard customer={c} />
        </motion.div>
      ))}
    </div>
  )
}
