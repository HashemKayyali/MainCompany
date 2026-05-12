import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useCustomersData } from '../../contexts/DataContext'
import { useReveal } from '../../hooks/useReveal'
import CustomerLogoCardView from '../customer/CustomerLogoCardView'

function splitRows<T>(arr: T[]): [T[], T[]] {
  const mid = Math.ceil(arr.length / 2)
  return [arr.slice(0, mid), arr.slice(mid)]
}

function loopItems<T>(arr: T[], min = 8): T[] {
  if (arr.length === 0) return []
  const result = [...arr]
  while (result.length < min) result.push(...arr)
  return [...result, ...result]
}

// LogoCell delegates to the shared CustomerLogoCardView so the homepage
// marquee and admin previews can never visually drift apart.

export default function LogoCloud() {
  const { customers } = useCustomersData()
  const headerReveal = useReveal({ distance: 16, duration: 0.42, margin: '0px 0px 16% 0px' })
  const shellReveal = useReveal({ distance: 14, duration: 0.38, margin: '0px 0px 14% 0px' })

  const [rowA, rowB] = useMemo(() => splitRows(customers), [customers])
  const loopA = useMemo(() => loopItems(rowA.length > 0 ? rowA : customers, 8), [customers, rowA])
  const loopB = useMemo(() => loopItems(rowB.length > 0 ? rowB : rowA, 8), [rowA, rowB])

  if (customers.length === 0) return null

  return (
    <section className="site-section" dir="rtl">
      <div className="site-container">
        <motion.div
          dir="ltr"
          {...headerReveal}
          className="mb-10 flex flex-col gap-5 sm:mb-12 sm:flex-row sm:items-end sm:justify-between"
        >
          <div className="max-w-2xl">
            <span className="section-label">Partnerships</span>
            <h2 className="section-title !mt-3 !text-left">
              Trusted by leading <span className="text-glow">brands</span>
            </h2>
            <p
              className="mt-4 max-w-lg text-[0.98rem] font-medium leading-[1.7]"
              style={{ color: '#31195f' }}
            >
              A growing network of premium brands that rely on our marketplace to power world-class events.
            </p>
          </div>

          <Link
            to="/customers"
            className="inline-flex shrink-0 items-center gap-2.5 self-start rounded-[14px] border border-violet-300/80 bg-white px-5 py-2.5 text-[11.5px] font-bold text-violet-800 shadow-[0_10px_24px_-10px_rgba(89,23,196,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500 hover:bg-violet-50 hover:text-violet-900 hover:shadow-[0_16px_36px_-12px_rgba(89,23,196,0.38)] sm:self-auto"
          >
            All {customers.length} partners
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
          </Link>
        </motion.div>

        <motion.div
          dir="ltr"
          {...shellReveal}
          className="relative overflow-hidden rounded-[28px] border border-violet-200/70 bg-gradient-to-b from-white via-white to-violet-50/40 py-10 sm:py-12"
          style={{
            boxShadow:
              '0 28px 70px -22px rgba(89,23,196,0.22), 0 8px 20px -8px rgba(89,23,196,0.14), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-[70px]"
            style={{ background: 'rgba(168,85,247,0.20)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-[70px]"
            style={{ background: 'rgba(217,70,239,0.14)' }}
            aria-hidden="true"
          />

          <div className="logo-cloud-track mb-5 overflow-hidden sm:mb-6">
            <div className="logo-cloud-row logo-cloud-row--fwd" aria-hidden="true">
              {loopA.map((customer, index) => (
                <div key={`a-${customer.slug}-${index}`} className="relative">
                  <CustomerLogoCardView customer={customer} variant="marquee" />
                </div>
              ))}
            </div>
          </div>

          <div className="logo-cloud-track overflow-hidden">
            <div className="logo-cloud-row logo-cloud-row--rev" aria-hidden="true">
              {loopB.map((customer, index) => (
                <div key={`b-${customer.slug}-${index}`} className="relative">
                  <CustomerLogoCardView customer={customer} variant="marquee" />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
