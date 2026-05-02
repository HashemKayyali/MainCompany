import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useCustomersData } from '../../contexts/DataContext'
import type { Customer } from '../../data/customers'
import { useReveal } from '../../hooks/useReveal'
import FramedImage from '../ui/FramedImage'

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

const LogoCell = memo(function LogoCell({ customer }: { customer: Customer }) {
  return (
    <div
      className="group relative mx-1.5 flex h-[68px] w-[130px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[14px] border border-violet-100/85 bg-white/85 px-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/95 hover:bg-white hover:shadow-[0_10px_24px_-8px_rgba(124,58,237,0.22)] sm:mx-2 sm:h-[72px] sm:w-[148px] lg:mx-2.5 lg:h-[76px] lg:w-[160px]"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'linear-gradient(90deg, transparent 10%, rgba(168,85,247,0.5) 50%, transparent 90%)',
        }}
      />

      <div className="flex h-8 w-full items-center justify-center">
        <FramedImage
          media={customer.logo}
          alt={customer.name}
          loading="lazy"
          sizes="(max-width: 640px) 100px, 125px"
          className="h-full max-h-7 w-auto max-w-[76%] object-contain opacity-55 mix-blend-multiply transition-all duration-300 group-hover:opacity-90"
          fallbackTransform={{ fit: 'contain' }}
        />
      </div>

      <div className="text-center text-[9px] font-semibold uppercase tracking-[0.10em] text-violet-700/55 transition-colors duration-300 group-hover:text-violet-800">
        {customer.name}
      </div>
    </div>
  )
})

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
          className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <span className="section-label">Partnerships</span>
            <h2 className="section-title !mt-3 !text-left">
              Trusted by leading <span className="text-glow">brands</span>
            </h2>
            <p
              className="mt-4 max-w-lg text-[0.95rem] leading-[1.7]"
              style={{ color: 'rgba(61, 35, 112, 0.78)' }}
            >
              A growing network of premium brands that rely on our marketplace to power world-class events.
            </p>
          </div>

          <Link
            to="/customers"
            className="inline-flex shrink-0 items-center gap-2.5 self-start rounded-[14px] border border-violet-200/85 bg-white px-5 py-2.5 text-[11.5px] font-semibold text-violet-700 shadow-[0_8px_22px_-10px_rgba(124,58,237,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50/85 hover:text-violet-900 hover:shadow-[0_14px_34px_-12px_rgba(124,58,237,0.32)] sm:self-auto"
          >
            All {customers.length} partners
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </motion.div>

        <motion.div
          dir="ltr"
          {...shellReveal}
          className="relative overflow-hidden rounded-[24px] border border-violet-200/65 bg-white/80 py-7 sm:py-8"
          style={{
            boxShadow:
              '0 22px 64px -22px rgba(124,58,237,0.18), 0 6px 18px -8px rgba(124,58,237,0.10), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-[60px]"
            style={{ background: 'rgba(168,85,247,0.16)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full blur-[60px]"
            style={{ background: 'rgba(217,70,239,0.10)' }}
            aria-hidden="true"
          />

          {/* Edge fades */}
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-32"
            style={{
              background:
                'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-32"
            style={{
              background:
                'linear-gradient(270deg, rgba(255,255,255,0.95) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          <div className="logo-cloud-track mb-3 overflow-hidden sm:mb-3.5">
            <div className="logo-cloud-row logo-cloud-row--fwd" aria-hidden="true">
              {loopA.map((customer, index) => (
                <div key={`a-${customer.slug}-${index}`} className="relative">
                  <LogoCell customer={customer} />
                </div>
              ))}
            </div>
          </div>

          <div className="logo-cloud-track overflow-hidden">
            <div className="logo-cloud-row logo-cloud-row--rev" aria-hidden="true">
              {loopB.map((customer, index) => (
                <div key={`b-${customer.slug}-${index}`} className="relative">
                  <LogoCell customer={customer} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
