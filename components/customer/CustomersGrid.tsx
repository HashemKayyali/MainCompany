import { motion } from 'framer-motion'
import type { Customer } from '../../data/customers'
import CustomerCard from './CustomerCard'

export default function CustomersGrid({ customers }: { customers: Customer[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {customers.map((c, i) => (
        <motion.div
          key={c.slug}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.03, duration: 0.4 }}
          className="w-[150px] sm:w-[165px] md:w-[175px] lg:w-[185px]"
        >
          <CustomerCard customer={c} />
        </motion.div>
      ))}
    </div>
  )
}