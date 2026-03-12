import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'

export default function PricingCard({ product }: { product: Product }) {
  const { isDark } = useTheme()
  const card = isDark ? 'bg-purple-500/[0.07] border border-purple-500/20' : 'bg-white border border-violet-100 shadow-sm'
  const sub = isDark ? 'text-purple-300/80' : 'text-gray-400'
  const txt = isDark ? 'text-white' : 'text-gray-900'
  return (
    <div className={`rounded-2xl overflow-hidden ${card}`}>
      <div className={`px-6 py-4 border-b ${isDark ? 'border-purple-500/20 bg-prism-violet/15' : 'border-violet-50 bg-violet-50/50'}`}>
        <span className={`text-[10px] font-mono uppercase tracking-[0.25em] ${isDark ? 'text-prism-violet' : 'text-violet-600'}`}>Rental Pricing</span>
      </div>
      <div className="p-6 space-y-4">
        {product.showPrice === false ? (
          <div className={`text-sm font-semibold ${isDark ? 'text-purple-200/75' : 'text-gray-500'}`}>Pricing is hidden for this item.</div>
        ) : (
          <>
            <div className="flex items-center justify-between"><div className={`text-sm font-medium ${isDark ? 'text-purple-100/90' : 'text-gray-600'}`}>Per Day</div><div><span className={`text-2xl font-display font-bold ${txt}`}>{product.rentalPricePerDay}</span><span className={`text-sm ml-1 ${sub}`}>{product.currency}</span></div></div>
            <div className={`h-px ${isDark ? 'bg-purple-500/10' : 'bg-violet-50'}`} />
            <div className="flex items-center justify-between"><div className={`text-sm font-medium ${isDark ? 'text-purple-100/90' : 'text-gray-600'}`}>Per Event</div><div><span className={`text-2xl font-display font-bold ${txt}`}>{product.rentalPricePerEvent}</span><span className={`text-sm ml-1 ${sub}`}>{product.currency}</span></div></div>
          </>
        )}
        <div className={`h-px ${isDark ? 'bg-purple-500/10' : 'bg-violet-50'}`} />
        <div className="space-y-1.5">{['Setup & dismantling','On-site staff','Equipment insurance','Full branding option'].map(f => <div key={f} className="flex items-center gap-2"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-prism-violet shrink-0"><path d="M2 6l3 3 5-6" /></svg><span className={`text-xs ${isDark ? 'text-purple-200/80' : 'text-gray-500'}`}>{f}</span></div>)}</div>
        <div className="space-y-2.5 pt-2">
          <Link to={`/contact?product=${product.slug}`} className="btn-primary w-full !rounded-xl !text-[13px] text-center block"><span>Request a Quote</span></Link>
          <a href={`https://wa.me/962788611234?text=${encodeURIComponent('Hi, I would like a quote for ' + product.name)}`} target="_blank" rel="noopener noreferrer" className="btn-outline w-full !rounded-xl !text-[13px] text-center block">WhatsApp</a>
        </div>
      </div>
    </div>
  )
}
