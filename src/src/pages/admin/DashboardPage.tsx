import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '../../contexts/UserContext'

type Stat = {
  icon: string
  label: string
  value: number
  to: string
  gradient: string
  glow: string
}

export default function DashboardPage() {
  const { products, parts, customers, categories, galleryAlbums, loading, refreshAll } = useData()
  const { currentUser, isAdmin } = useUser()
  const { isDark } = useTheme()

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const card = isDark ? 'bg-purple-500/[0.07] border border-purple-500/20' : 'bg-white border border-gray-200 shadow-sm'

  const firstName = useMemo(() => {
    const name = (currentUser?.name || 'Admin').trim()
    const f = name.split(' ')[0]
    return f || 'Admin'
  }, [currentUser?.name])

  const stats: Stat[] = [
    { icon: '🚲', label: 'Products', value: products.length, to: '/admin/products', gradient: 'from-purple-600 to-pink-500', glow: 'shadow-purple-500/20' },
    { icon: '🔧', label: 'Parts', value: parts.length, to: '/admin/parts', gradient: 'from-amber-500 to-orange-500', glow: 'shadow-amber-500/20' },
    { icon: '👥', label: 'Customers', value: customers.length, to: '/admin/customers', gradient: 'from-cyan-500 to-blue-500', glow: 'shadow-cyan-500/20' },
    { icon: '📂', label: 'Categories', value: categories.length, to: '/admin/categories', gradient: 'from-lime-500 to-green-500', glow: 'shadow-lime-500/20' },
    { icon: '📸', label: 'Gallery Albums', value: galleryAlbums.length, to: '/admin/gallery', gradient: 'from-fuchsia-500 to-pink-500', glow: 'shadow-fuchsia-500/20' },
    // لا نضرب شكل الداشبورد لو ما عندك قائمة admins حالياً
    { icon: '🔐', label: 'Admins', value: isAdmin ? 1 : 0, to: '/admin/admins', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-pink-500/20' },
  ]

  const actions = [
    { label: 'Add Product', to: '/admin/products', icon: '🚲' },
    { label: 'Add Part', to: '/admin/parts', icon: '🔧' },
    { label: 'Add Customer', to: '/admin/customers', icon: '👥' },
    { label: 'Add Category', to: '/admin/categories', icon: '📂' },
    { label: 'Add Album', to: '/admin/gallery', icon: '📸' },
  ]

  return (
    <div className="space-y-8">
      {/* Header + Refresh (مرة واحدة) */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className={`font-display text-3xl font-bold ${txt}`}>
            Welcome back, <span className="text-glow">{firstName}</span>
          </h1>
          <p className={`text-sm mt-1 ${sub}`}>Here’s an overview of your Bike Land data.</p>
        </div>

        <button
          onClick={() => refreshAll()}
          disabled={loading}
          className={[
            'px-4 py-2 rounded-xl text-[12px] font-medium border transition',
            loading ? 'opacity-60 cursor-not-allowed' : 'hover:-translate-y-[1px]',
            isDark
              ? 'border-cyan-400/25 bg-cyan-400/10 hover:bg-cyan-400/15 text-cyan-300'
              : 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-700',
          ].join(' ')}
        >
          <span className="mr-2">🔄</span>
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map(s => (
          <Link
            key={s.label}
            to={s.to}
            className={[
              'relative rounded-2xl p-5 overflow-hidden transition-all group border hover:-translate-y-1',
              isDark ? 'bg-purple-500/[0.07] border-purple-500/20 hover:border-purple-500/40' : 'bg-white border-gray-200 hover:shadow-lg',
              isDark ? s.glow : '',
            ].join(' ')}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.06] transition-opacity`} />

            <div className="flex items-start justify-between">
              <span className="text-2xl">{s.icon}</span>
              <span
                className={[
                  'text-[10px] font-mono px-2 py-1 rounded-full border',
                  isDark ? 'border-purple-500/20 text-purple-200/70 bg-purple-500/[0.06]' : 'border-gray-200 text-gray-500 bg-gray-50',
                ].join(' ')}
              >
                View
              </span>
            </div>

            <div className={`mt-3 text-3xl font-display font-bold ${txt}`}>{s.value}</div>
            <div className={`text-[11px] font-mono uppercase tracking-wider mt-1 ${sub}`}>{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick Actions (بدون Refresh/View Site) */}
      <div className={`rounded-2xl p-6 ${card}`}>
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className={`font-display font-bold text-lg ${txt}`}>⚡ Quick Actions</h2>
          <span className={`text-[12px] ${sub}`}>{loading ? 'Syncing…' : 'Ready'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map(a => (
            <Link
              key={a.label}
              to={a.to}
              className={[
                'flex items-center gap-3 p-3 rounded-xl border transition',
                isDark
                  ? 'bg-purple-500/[0.06] hover:bg-purple-500/15 border-purple-500/20 hover:border-purple-500/40'
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-100',
              ].join(' ')}
            >
              <span>{a.icon}</span>
              <span className={`text-sm font-medium ${isDark ? 'text-purple-100' : 'text-gray-700'}`}>{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}