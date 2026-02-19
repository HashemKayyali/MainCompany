import { Link } from 'react-router-dom'
import { useData } from '../../contexts/DataContext'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
export default function DashboardPage() {
  const { products, parts, customers, categories, loading, refreshAll } = useData()
  const { user, admins } = useAuth()
  const { isDark } = useTheme()
  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-300/80' : 'text-gray-400'
  const stats = [
    { icon: '🚲', label: 'Products', value: products.length, to: '/admin/products', gradient: 'from-purple-600 to-pink-500', shadow: 'shadow-purple-500/20' },
    { icon: '🔧', label: 'Parts', value: parts.length, to: '/admin/parts', gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
    { icon: '👥', label: 'Customers', value: customers.length, to: '/admin/customers', gradient: 'from-cyan-500 to-blue-500', shadow: 'shadow-cyan-500/20' },
    { icon: '📂', label: 'Categories', value: categories.length, to: '/admin/categories', gradient: 'from-lime-500 to-green-500', shadow: 'shadow-lime-500/20' },
    { icon: '🔐', label: 'Admins', value: admins.length, to: '/admin/admins', gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
  ]
  return (
    <div>
      <div className="mb-8"><h1 className={`font-display text-3xl font-bold ${txt}`}>Welcome back, <span className="text-glow">{user?.name?.split(' ')[0]}</span></h1><p className={`text-sm mt-1 ${sub}`}>Overview of your Bike Land data.</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">{stats.map(s => (
        <Link key={s.label} to={s.to} className={`relative rounded-2xl p-5 transition-all group overflow-hidden hover:-translate-y-1 ${isDark ? 'bg-purple-500/[0.07] border border-purple-500/20 hover:border-purple-500/40' : 'bg-white border border-gray-200 shadow-sm hover:shadow-lg'} ${isDark ? s.shadow : ''}`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity`} />
          <span className="text-2xl block mb-2">{s.icon}</span>
          <div className={`text-3xl font-display font-bold ${txt}`}>{s.value}</div>
          <div className={`text-[11px] font-mono uppercase tracking-wider mt-1 ${sub}`}>{s.label}</div>
        </Link>
      ))}</div>
      <div className={`rounded-2xl p-6 ${isDark ? 'bg-purple-500/[0.07] border border-purple-500/20' : 'bg-white border border-gray-200 shadow-sm'}`}>
        <h2 className={`font-display font-bold text-lg mb-4 ${txt}`}>⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[{ label: '+ Add Product', to: '/admin/products', icon: '🚲' },{ label: '+ Add Part', to: '/admin/parts', icon: '🔧' },{ label: '+ Add Customer', to: '/admin/customers', icon: '👥' },{ label: '+ Add Category', to: '/admin/categories', icon: '📂' }].map(a => (
            <Link key={a.label} to={a.to} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDark ? 'bg-purple-500/[0.07] hover:bg-purple-500/15 border border-purple-500/20 hover:border-purple-500/40' : 'bg-gray-50 hover:bg-gray-100 border border-gray-100'}`}>
              <span>{a.icon}</span>
              <span className={`text-xs font-medium ${isDark ? 'text-purple-200/90' : 'text-gray-600'}`}>{a.label}</span>
            </Link>
          ))}
          <button onClick={() => refreshAll()} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDark ? 'bg-cyan-400/10 hover:bg-cyan-400/15 border border-cyan-400/25 text-cyan-400/90' : 'bg-cyan-50 hover:bg-cyan-100 border border-cyan-100 text-cyan-600'}`}>
            <span>🔄</span>
            <span className="text-xs font-medium">{loading ? 'Loading...' : 'Refresh Data'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
