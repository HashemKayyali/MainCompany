import { memo, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
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

const LogoCell = memo(function LogoCell({ customer, isDark }: { customer: Customer; isDark: boolean }) {
  return (
    <div
      className={`group relative mx-1.5 flex h-[68px] w-[130px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-[14px] border px-3 transition-all duration-300 sm:mx-2 sm:h-[72px] sm:w-[148px] lg:mx-2.5 lg:h-[76px] lg:w-[160px] ${
        isDark
          ? 'border-white/[0.07] bg-white/[0.025] hover:border-violet-400/[0.20] hover:bg-white/[0.05]'
          : 'border-violet-100/70 bg-white/70 hover:border-violet-200/90 hover:bg-white hover:shadow-[0_6px_20px_rgba(124,58,237,0.10)]'
      }`}
      style={
        isDark
          ? { boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }
          : undefined
      }
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-[14px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: isDark
            ? 'linear-gradient(90deg, transparent 10%, rgba(167,139,250,0.55) 50%, transparent 90%)'
            : 'linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.22) 50%, transparent 90%)',
        }}
      />

      <div className="flex h-8 w-full items-center justify-center">
        <FramedImage
          media={customer.logo}
          alt={customer.name}
          loading="lazy"
          sizes="(max-width: 640px) 100px, 125px"
          className={`h-full max-h-7 w-auto max-w-[76%] object-contain transition-all duration-300 ${
            isDark
              ? 'opacity-54 group-hover:opacity-88'
              : 'opacity-50 mix-blend-multiply group-hover:opacity-78'
          }`}
          fallbackTransform={{ fit: 'contain' }}
        />
      </div>

      <div
        className={`text-center text-[9px] font-semibold uppercase tracking-[0.10em] transition-colors duration-300 ${
          isDark
            ? 'text-white/26 group-hover:text-white/52'
            : 'text-gray-400/80 group-hover:text-gray-600'
        }`}
      >
        {customer.name}
      </div>
    </div>
  )
})

export default function LogoCloud() {
  const { isDark } = useTheme()
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
          className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <div className="mb-3 flex items-center gap-2.5">
              <span className="section-label">// Partnerships</span>
              <div
                className="h-px w-8"
                style={{
                  background: isDark ? 'rgba(97,40,178,0.28)' : 'rgba(124,58,237,0.22)',
                }}
              />
            </div>
            <h2 className={`section-title !mt-0 !text-left ${!isDark ? 'text-gray-900' : ''}`}>
              Trusted by leading brands, organizations, and institutions
            </h2>
            <p
              className={`mt-3 max-w-lg text-[0.90rem] leading-relaxed ${
                isDark ? 'text-purple-100/48' : 'text-gray-500'
              }`}
            >
              A growing network of premium brands that rely on our marketplace to power world-class events.
            </p>
          </div>

          <Link
            to="/customers"
            className={`inline-flex shrink-0 items-center gap-2.5 self-start rounded-[13px] border px-5 py-2.5 text-[11.5px] font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:self-auto ${
              isDark
                ? 'border-white/[0.10] bg-white/[0.05] text-white/82 hover:border-violet-400/24 hover:bg-white/[0.08] hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-700 shadow-sm'
            }`}
          >
            All {customers.length} partners
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </motion.div>

        <motion.div
          dir="ltr"
          {...shellReveal}
          className={`relative overflow-hidden rounded-[22px] border py-6 sm:py-7 ${
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(10,8,26,0.82),rgba(6,6,18,0.74))] shadow-[0_22px_64px_rgba(2,2,14,0.24),inset_0_1px_0_rgba(255,255,255,0.03)]'
              : 'border-violet-100/80 bg-white/80 shadow-[0_16px_48px_rgba(124,58,237,0.07)]'
          }`}
        >
          {isDark && (
            <>
              <div
                className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full blur-[42px]"
                style={{ background: 'rgba(124,58,237,0.06)' }}
                aria-hidden="true"
              />
              <div
                className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full blur-[42px]"
                style={{ background: 'rgba(6,182,212,0.05)' }}
                aria-hidden="true"
              />
            </>
          )}

          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 sm:w-32"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, rgba(8,6,20,0.88) 0%, transparent 100%)'
                : 'linear-gradient(90deg, rgba(248,246,255,0.95) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 sm:w-32"
            style={{
              background: isDark
                ? 'linear-gradient(270deg, rgba(8,6,20,0.88) 0%, transparent 100%)'
                : 'linear-gradient(270deg, rgba(248,246,255,0.95) 0%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          <div className="logo-cloud-track mb-3 overflow-hidden sm:mb-3.5">
            <div className="logo-cloud-row logo-cloud-row--fwd" aria-hidden="true">
              {loopA.map((customer, index) => (
                <div key={`a-${customer.slug}-${index}`} className="relative">
                  <LogoCell customer={customer} isDark={isDark} />
                </div>
              ))}
            </div>
          </div>

          <div className="logo-cloud-track overflow-hidden">
            <div className="logo-cloud-row logo-cloud-row--rev" aria-hidden="true">
              {loopB.map((customer, index) => (
                <div key={`b-${customer.slug}-${index}`} className="relative">
                  <LogoCell customer={customer} isDark={isDark} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
