import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'

export default function PricingCard({ product }: { product: Product }) {
  const { isDark } = useTheme()
  const card = isDark ? 'bg-purple-500/[0.07] border border-purple-500/20' : 'bg-white border border-violet-100 shadow-sm'
  const sub = isDark ? 'text-purple-300/80' : 'text-gray-400'
  const txt = isDark ? 'text-white' : 'text-gray-900'
  return (
    <div className={`overflow-hidden rounded-[20px] ${card}`}>
      <div className={`border-b px-4 py-3 ${isDark ? 'border-purple-500/20 bg-prism-violet/15' : 'border-violet-50 bg-violet-50/50'}`}>
        <span className={`text-[10px] font-mono uppercase tracking-[0.25em] ${isDark ? 'text-prism-violet' : 'text-violet-600'}`}>Rental Pricing</span>
      </div>
      <div className="space-y-3 p-4">
        {product.showPrice === false ? (
          <div className={`text-sm font-semibold ${isDark ? 'text-purple-200/75' : 'text-gray-500'}`}>Pricing is hidden for this item.</div>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <div className={`text-sm font-medium ${isDark ? 'text-purple-100/90' : 'text-gray-600'}`}>Per Day</div>
            <div>
              <span className={`text-[1.45rem] font-display font-bold ${txt}`}>{product.rentalPricePerDay}</span>
              <span className={`ml-1 text-sm ${sub}`}>{product.currency}</span>
            </div>
          </div>
        )}
        <div className={`h-px ${isDark ? 'bg-purple-500/10' : 'bg-violet-50'}`} />
        <div className="space-y-1.5">{['Setup & dismantling','On-site staff','Equipment insurance','Full branding option'].map(f => <div key={f} className="flex items-center gap-2"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-prism-violet shrink-0"><path d="M2 6l3 3 5-6" /></svg><span className={`text-xs ${isDark ? 'text-purple-200/80' : 'text-gray-500'}`}>{f}</span></div>)}</div>
        <div className={`rounded-[14px] px-3.5 py-2.5 text-[11px] leading-5 ${isDark ? 'bg-white/[0.03] text-purple-200/72' : 'bg-violet-50 text-gray-600'}`}>
          Use the rental and purchase actions below to start the correct request flow without leaving this product page.
        </div>
      </div>
    </div>
  )
}
