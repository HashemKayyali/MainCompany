import { useTheme } from '../../contexts/ThemeContext'
import type { Customer } from '../../data/customers'
export default function CustomerCard({ customer }: { customer: Customer }) {
  const { isDark } = useTheme()
  return (<div className="group glass !rounded-xl p-5 flex flex-col items-center gap-3"><div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden ${isDark ? 'bg-purple-500/[0.08] border border-purple-500/25' : 'bg-gray-50 border border-gray-100'}`}><img src={customer.logo} alt={customer.name} loading="lazy" className="w-[60%] h-[60%] object-contain group-hover:scale-110 transition-transform duration-500" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></div><span className={`text-[11px] text-center font-medium ${isDark ? 'text-purple-200/80' : 'text-gray-500'}`}>{customer.name}</span>{customer.category && <span className={`text-[9px] font-mono uppercase tracking-wider ${isDark ? 'text-purple-400/50' : 'text-gray-300'}`}>{customer.category}</span>}</div>)
}
