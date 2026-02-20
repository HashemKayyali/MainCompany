import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '../../contexts/UserContext'
import Sidebar from '../../components/admin/Sidebar'

function usePageTitle(pathname: string) {
  return useMemo(() => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.startsWith('/admin/products')) return 'Products'
    if (pathname.startsWith('/admin/parts')) return 'Parts'
    if (pathname.startsWith('/admin/customers')) return 'Customers'
    if (pathname.startsWith('/admin/categories')) return 'Categories'
    if (pathname.startsWith('/admin/gallery')) return 'Gallery'
    if (pathname.startsWith('/admin/admins')) return 'Admins'
    return 'Admin'
  }, [pathname])
}

export default function AdminLayout() {
  const { isDark } = useTheme()
  const { currentUser, logout, isAdmin } = useUser()
  const { pathname } = useLocation()
  const title = usePageTitle(pathname)

  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  const bg = isDark ? 'bg-void-950 text-white' : 'bg-gray-50 text-gray-900'
  const border = isDark ? 'border-purple-500/15' : 'border-gray-200'
  const topbarBg = isDark ? 'bg-void-950/70' : 'bg-white/70'

  const displayName = currentUser?.name?.trim() || 'Admin'
  const avatarLetter = displayName.charAt(0).toUpperCase()

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* Topbar (واحد فقط لكل الأدمن) */}
      <header className={`sticky top-0 z-30 backdrop-blur border-b ${border} ${topbarBg}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          {/* Mobile menu */}
          <button
            onClick={() => setOpen(true)}
            className={`md:hidden w-10 h-10 rounded-xl border transition ${
              isDark ? 'border-purple-500/20 hover:bg-purple-500/10' : 'border-gray-200 hover:bg-gray-50'
            }`}
            aria-label="Open sidebar"
          >
            ☰
          </button>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className={`font-display text-lg sm:text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h1>
              
             
               
              
            </div>

            <p className={`text-[12px] mt-0.5 truncate ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>
              Manage content, products, customers and gallery
            </p>
          </div>

          {/* Actions (بدون تكرار) */}
          <Link
            to="/"
            className={`hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-[12px] font-medium border transition ${
              isDark ? 'border-purple-500/20 text-purple-200/80 hover:bg-purple-500/10' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            View Site
          </Link>

          {/* User */}
          <div className={`flex items-center gap-2 pl-3 ml-1 border-l ${border}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center text-white text-xs font-bold">
              {avatarLetter}
            </div>

            <div className="hidden sm:block leading-4">
              <p className={`text-[12px] font-medium ${isDark ? 'text-purple-100' : 'text-gray-800'}`}>{displayName}</p>
              <p className={`text-[11px] ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>Administrator</p>
            </div>

            <button
              onClick={logout}
              className={`ml-1 px-3.5 py-2 rounded-xl text-[12px] font-medium transition ${
                isDark ? 'text-red-300/90 hover:bg-red-400/10' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <Sidebar variant="desktop" />
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="absolute left-0 top-0 bottom-0 w-[280px]">
              <Sidebar variant="drawer" onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        {/* Content */}
        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}