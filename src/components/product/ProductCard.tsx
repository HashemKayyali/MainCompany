import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'

export default function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { isDark } = useTheme()
  return (
    <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}>
      <div className={`group relative rounded-2xl overflow-hidden transition-all duration-700 hover:-translate-y-2 ${isDark ? 'bg-purple-500/[0.06] border border-purple-500/15 hover:border-prism-violet/40' : 'bg-white border border-violet-100/60 hover:border-violet-300 shadow-sm hover:shadow-xl hover:shadow-violet-100/40'}`}>
        <div className={`absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none ${isDark ? 'bg-gradient-to-b from-prism-violet/20 via-transparent to-prism-pink/[0.02]' : ''}`} />
        <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-void-800 to-void-900">
          <img src={product.heroImage} alt={product.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-[1.2s]" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-t from-void-950/80 via-void-950/20 to-transparent' : 'bg-gradient-to-t from-white/40 to-transparent'}`} />
          <div className="absolute top-3 left-3">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r ${product.badgeColor} text-white shadow-lg`}>{product.badge}</span>
          </div>
        </div>
        <div className="relative p-5">
          <h3 className={`text-lg font-display font-bold transition-colors duration-500 ${isDark ? 'text-white/90 group-hover:text-prism-violet' : 'text-gray-900 group-hover:text-violet-600'}`}>{product.name}</h3>
          <p className={`text-[13px] mt-2 leading-relaxed line-clamp-2 ${isDark ? 'text-purple-300/70' : 'text-gray-500'}`}>{product.shortDescription}</p>
          <div className={`flex items-center gap-3 mt-4 py-3 border-t ${isDark ? 'border-purple-500/15' : 'border-violet-50'}`}>
            <span className={`text-xl font-display font-extrabold ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.rentalPricePerDay}</span>
            <span className={`text-[11px] font-mono ${isDark ? 'text-cyan-400/60' : 'text-gray-400'}`}>{product.currency}/day</span>
          </div>
          <div className="flex gap-2 mt-3">
            <Link to={`/products/${product.slug}`} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-center transition-all ${isDark ? 'text-purple-200/80 bg-purple-500/[0.08] border border-purple-500/20 hover:text-prism-violet hover:border-prism-violet/40' : 'text-gray-500 bg-gray-50 border border-gray-200 hover:text-violet-600 hover:border-violet-300'}`}>Details</Link>
            <Link to={`/contact?product=${product.slug}`} className="px-4 py-2.5 rounded-xl text-[13px] font-bold bg-gradient-to-r from-prism-violet to-prism-pink text-white hover:shadow-lg hover:shadow-prism-violet/30 transition-all">Request Quote</Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
