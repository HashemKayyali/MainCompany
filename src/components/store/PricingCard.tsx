import { Check, Zap, PackageCheck } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
import { useSpotlight, SpotlightOverlay } from '../ui/spotlight-card'

const INCLUDED = [
  { label: 'Setup and dismantling on eligible services', icon: PackageCheck },
  { label: 'On-site staff confirmed after review', icon: null },
  { label: 'Insured equipment on eligible services', icon: null },
  { label: 'Custom branding depends on service scope', icon: null },
]

export default function PricingCard({ product }: { product: Product }) {
  const { isDark } = useTheme()
  const spotlight = useSpotlight()

  return (
    <div
      {...spotlight.handlers}
      className={`relative overflow-hidden rounded-[22px] ${
        isDark
          ? 'border border-violet-500/22 bg-[linear-gradient(165deg,rgba(16,13,36,0.98),rgba(10,9,26,0.99))] shadow-[0_24px_56px_rgba(2,4,14,0.42),inset_0_1px_0_rgba(255,255,255,0.05)]'
          : 'border border-violet-100/90 bg-white shadow-[0_12px_36px_rgba(124,58,237,0.1)]'
      }`}
    >
      <SpotlightOverlay ref={spotlight.overlayRef} color="rgba(124,58,237,0.09)" size={280} />

      {/* ── Premium gradient header ── */}
      <div
        className={`relative px-5 pb-5 pt-5 ${
          isDark
            ? 'border-b border-white/[0.07] bg-[linear-gradient(135deg,rgba(124,58,237,0.24)_0%,rgba(184,50,225,0.14)_45%,rgba(34,211,238,0.09)_100%)]'
            : 'border-b border-violet-100 bg-[linear-gradient(135deg,rgba(124,58,237,0.07)_0%,rgba(236,72,153,0.04)_50%,rgba(6,182,212,0.03)_100%)]'
        }`}
      >
        {/* Shimmer line at very top */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <span
              className={`text-[9.5px] font-bold uppercase tracking-[0.2em] ${
                isDark ? 'text-violet-300/80' : 'text-violet-500'
              }`}
            >
              Rental Request Pricing
            </span>

            {product.showPrice === false ? (
              <div className="mt-2">
                <div
                  className={`font-sans text-[2rem] font-black leading-none tracking-[-0.04em] ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Custom
                </div>
                <div className={`mt-1.5 text-[12px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Request reviewed by Eventies team
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <div className={`text-[10px] font-semibold uppercase tracking-[0.12em] mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Starting from
                </div>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-sans text-[2.6rem] font-black leading-none tracking-[-0.05em] ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {product.rentalPricePerDay}
                  </span>
                  <div className="pb-1">
                    <div className={`text-[1rem] font-bold leading-none ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {product.currency}
                    </div>
                    <div className={`mt-1 text-[10px] font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      per day
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Availability badge */}
          <div
            className={`shrink-0 rounded-[12px] px-3 py-2.5 text-center ${
              isDark
                ? 'border border-emerald-500/22 bg-emerald-500/[0.11]'
                : 'border border-emerald-200 bg-emerald-50'
            }`}
          >
            <div
              className={`flex items-center gap-1.5 text-[8.5px] font-bold uppercase tracking-[0.16em] ${
                isDark ? 'text-emerald-400/80' : 'text-emerald-600/80'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.7)]" />
              Reviewed
            </div>
            <div className={`mt-1 text-[11.5px] font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-600'}`}>
              After review
            </div>
          </div>
        </div>
      </div>

      {/* ── Included features ── */}
      <div className="p-5 space-y-4">
        <div>
          <div
            className={`mb-3.5 flex items-center gap-2 text-[9.5px] font-bold uppercase tracking-[0.18em] ${
              isDark ? 'text-slate-500' : 'text-slate-400'
            }`}
          >
            <Zap size={10} className={isDark ? 'text-cyan-400/70' : 'text-violet-500/80'} />
            What's included
          </div>
          <div className="space-y-2.5">
            {INCLUDED.map(({ label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                    isDark
                      ? 'bg-violet-500/20 text-violet-300'
                      : 'bg-violet-100 text-violet-600'
                  }`}
                >
                  <Check size={9.5} strokeWidth={3} />
                </span>
                <span className={`text-[12.5px] leading-5 ${isDark ? 'text-slate-300/85' : 'text-slate-600'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div
          className={`rounded-[13px] px-3.5 py-3 text-[11.5px] leading-[1.65] ${
            isDark
              ? 'bg-cyan-500/[0.07] border border-cyan-500/15 text-cyan-100/65'
              : 'bg-cyan-50/80 border border-cyan-100 text-cyan-800/80'
          }`}
        >
          Use the actions below to start a rental request or purchase quote request without leaving this page. Final availability, pricing, setup, delivery, shipping, and scope are confirmed after review.
        </div>
      </div>
    </div>
  )
}
