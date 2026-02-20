import { useState } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import CustomersGrid from '../components/customer/CustomersGrid'
import Chip from '../components/ui/Chip'
export default function CustomersPage() {
  const { customers } = useData(); const { isDark } = useTheme()
  const [search, setSearch] = useState(''); const [cat, setCat] = useState('All')
  const cats = Array.from(new Set(customers.map(c => c.category).filter(Boolean))) as string[]
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) && (cat === 'All' || c.category === cat))
  return (<section className="pt-32 pb-24"><div className="max-w-7xl mx-auto px-6">
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-12"><span className="section-label">// {customers.length} Partners</span><h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>Trusted by <span className="text-glow">Leaders</span></h1></motion.div>
    <div className="max-w-md mb-5"><input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="form-field" /></div>
    <div className="flex flex-wrap gap-2 mb-8"><Chip active={cat === 'All'} onClick={() => setCat('All')}>All</Chip>{cats.map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
    <CustomersGrid customers={filtered} />
  </div></section>)
}
