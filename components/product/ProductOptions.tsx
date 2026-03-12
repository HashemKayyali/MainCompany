import { useTheme } from '../../contexts/ThemeContext'
import type { QuickOption } from '../../data/products/types'
export default function ProductOptions({ options }: { options: QuickOption[] }) {
  const { isDark } = useTheme()
  return <div className="flex flex-wrap gap-3">{options.map(opt => (<div key={opt.label} className="glass !rounded-xl px-4 py-3"><div className={`text-[11px] mb-2 font-medium uppercase tracking-wider ${isDark ? 'text-purple-300/80' : 'text-gray-400'}`}>{opt.label}</div><div className="flex flex-wrap gap-1.5">{opt.values.map(v => <span key={v} className={`px-2.5 py-1 rounded-lg text-sm font-medium ${isDark ? 'bg-purple-500/10 text-purple-100/90' : 'bg-gray-100 text-gray-700'}`}>{v}</span>)}</div></div>))}</div>
}
