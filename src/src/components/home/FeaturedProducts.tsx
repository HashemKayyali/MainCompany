import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import ProductCard from '../product/ProductCard'
export default function FeaturedProducts() {
  const { featuredProducts } = useData(); const { isDark } = useTheme()
  return (<section className="py-24 sm:py-32 relative"><div className="relative max-w-7xl mx-auto px-6"><div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-14"><motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}><span className="section-label">// Products</span><h2 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>What We <span className="text-glow">Build</span></h2></motion.div><Link to="/products" className="btn-outline !rounded-full !px-5 !py-2.5 !text-[13px] group">All Products</Link></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{featuredProducts.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}</div></div></section>)
}
