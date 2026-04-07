import { Check } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'

const INCLUDED = [
  'Equipment setup & dismantling',
  'Professional on-site staff',
  'Full equipment insurance',
  'Custom branding options',
]

export default function PricingCard({ product }: { product: Product }) {
  const { isDark } = useTheme()

  return (
    <div
      className={`overflow-hidden rounded-[22px] ${
        isDark
          ? 'border border-violet-500/20 bg-[linear-gradient(180deg,rgba(16,13,34,0.97),rgba(10,9,24,0.98))]'
          : 'border border-violet-100/80 bg-white shadow-[0_8px_32px_rgba(124,58,237,0.08)]'
      }`}
    >
      {/* Header accent bar */}
      <div
        className={`relative px-5 py-4 ${
          isDark
            ? 'border-b border-violet-500/15 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(34,211,238,0.08))]'
            : 'border-b border-violet-100 bg-gradient-to-r from-violet-50 to-cyan-50/50'
        }`}
      >
        <span
          className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${
            isDark ? 'text-violet-300/80' : 'text-violet-500'
          }`}
        >
          Rental Pricing
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Price display */}
        {product.showPrice === false ? (
          <div
            className={`rounded-[16px] px-4 py-3.5 text-center ${
              isDark
                ? 'border border-violet-500/15 bg-violet-500/[0.07]'
                : 'border border-violet-100 bg-violet-50'
            }`}
          >
            <div className={`text-[11px] font-bold uppercase tracking-[0.16em] mb-1 ${isDark ? 'text-violet-300/70' : 'text-violet-500/80'}`}>
              Custom Quote
            </div>
            <div className={`text-[0.92rem] font-semibold ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
              Pricing reviewed by our team
            </div>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                Starting from
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className={`font-display text-[2.4rem] font-black leading-none tracking-[-0.04em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {product.rentalPricePerDay}
                </span>
                <div>
                  <span className={`text-[1rem] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {product.currency}
                  </span>
                  <div className={`text-[10px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    / day
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`shrink-0 rounded-[12px] px-3 py-2 text-center ${
                isDark
                  ? 'border border-emerald-500/20 bg-emerald-500/10'
                  : 'border border-emerald-200 bg-emerald-50'
              }`}
            >
              <div className={`text-[8.5px] font-bold uppercase tracking-[0.16em] ${isDark ? 'text-emerald-400/80' : 'text-emerald-600/80'}`}>
                Stock
              </div>
              <div className={`mt-0.5 text-[11px] font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Available
              </div>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className={`h-px ${isDark ? 'bg-white/[0.06]' : 'bg-violet-100/60'}`} />

        {/* Included features */}
        <div>
          <div className={`mb-3 text-[9.5px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            What's included
          </div>
          <div className="space-y-2.5">
            {INCLUDED.map(feature => (
              <div key={feature} className="flex items-center gap-2.5">
                <span
                  className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                    isDark
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-violet-100 text-violet-600'
                  }`}
                >
                  <Check size={9} strokeWidth={3} />
                </span>
                <span className={`text-[12px] leading-5 ${isDark ? 'text-slate-300/80' : 'text-slate-600'}`}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div
          className={`rounded-[14px] px-3.5 py-3 text-[11px] leading-[1.65] ${
            isDark
              ? 'bg-cyan-500/[0.07] border border-cyan-500/15 text-cyan-100/68'
              : 'bg-cyan-50 border border-cyan-100 text-cyan-800/80'
          }`}
        >
          Use the actions below to start a rental request or request a direct purchase quote without leaving this page.
        </div>
      </div>
    </div>
  )
}
