import { useEffect, useMemo, useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useUser } from '../../contexts/UserContext'
import SearchDialog from '../ui/SearchDialog'

const NAV = [
  { to: '/', l: 'Home' },
  { to: '/products', l: 'Products' },
  { to: '/customers', l: 'Customers' },
  { to: '/gallery', l: 'Gallery' },
  { to: '/about', l: 'About' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
  const { isAuth } = useAuth()
  const { isLoggedIn, currentUser, logout } = useUser()

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // ✅ Ctrl/Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(v => !v) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { setOpen(false); setUserMenu(false) }, [pathname])

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false) }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenu) return
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [userMenu])

  const active = (p: string) => (p === '/' ? pathname === '/' : pathname.startsWith(p))

  const focus = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  const shell = useMemo(() => {
    const base = isDark ? 'bg-void-900/45 border-white/10' : 'bg-white/55 border-violet-200/60'
    const strong = isDark
      ? 'bg-void-900/72 border-purple-500/20 shadow-[0_12px_55px_rgba(0,0,0,0.55)]'
      : 'bg-white/82 border-violet-200/70 shadow-lg shadow-violet-500/10'
    return scrolled ? strong : base
  }, [scrolled, isDark])

  const linkBase = 'relative px-3.5 h-10 inline-flex items-center justify-center rounded-xl text-[13px] font-medium transition-all'
  const linkText = (isActive: boolean) => isActive
    ? isDark ? 'text-white' : 'text-gray-900'
    : isDark ? 'text-purple-100/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'

  const actionBtn = 'h-10 px-3 rounded-xl text-[12px] font-medium transition-all inline-flex items-center justify-center'
  const iconBtn = (extra: string) => `w-10 h-10 rounded-xl inline-flex items-center justify-center transition-all ${extra}`

  const userInitial = (currentUser?.name?.trim()?.[0] || 'U').toUpperCase()
  const firstName = currentUser?.name?.split(' ')[0] || 'User'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="px-4 pt-4">
        <nav className="relative max-w-7xl mx-auto">
          <div
            className="absolute -inset-px rounded-2xl pointer-events-none opacity-70"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, rgba(124,58,237,0.35), rgba(236,72,153,0.22), rgba(245,158,11,0.18))'
                : 'linear-gradient(90deg, rgba(124,58,237,0.22), rgba(236,72,153,0.16), rgba(245,158,11,0.12))',
            }}
          />

          <div className={`relative rounded-2xl border backdrop-blur-2xl ${shell}`}>
            <div className="px-4 sm:px-5 py-3">
              <div className="flex items-center justify-between gap-3">

                {/* ══ Left: Brand ══ */}
                <Link to="/" className={`flex items-center gap-3 min-w-0 flex-1 lg:flex-none ${focus}`}>
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-prism-violet/25 flex-none">
                    <span className="text-white font-black text-xs font-display">BL</span>
                  </div>
                  <div className="leading-none min-w-0">
                    <div className={`font-bold uppercase font-display truncate ${isDark ? 'text-white' : 'text-gray-900'} text-[11px] sm:text-[12px] tracking-[0.18em] sm:tracking-[0.22em]`}>
                      Bike <span className={isDark ? 'text-prism-violet' : 'text-violet-600'}>Land</span>
                    </div>
                    <div className={`truncate mt-1 ${isDark ? 'text-purple-200/60' : 'text-gray-400'} text-[9.5px] sm:text-[10px]`}>
                      Rentals • Events • Experiences
                    </div>
                  </div>
                </Link>

                {/* ══ Center: Nav (desktop) ══ */}
                <div className="hidden lg:flex items-center justify-center flex-1">
                  <div className={`px-2 py-1 rounded-2xl border ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white/60 border-violet-200/60'}`}>
                    <div className="flex items-center gap-1">
                      {NAV.map(l => {
                        const isA = active(l.to)
                        return (
                          <Link key={l.to} to={l.to} className={`${linkBase} ${linkText(isA)} ${focus}`} aria-current={isA ? 'page' : undefined}>
                            {isA && (
                              <motion.div
                                layoutId="nav-active"
                                className={`absolute inset-0 rounded-xl ${isDark ? 'bg-white/[0.06]' : 'bg-violet-50'}`}
                                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                              />
                            )}
                            <span className="relative z-10">{l.l}</span>
                            {isA && (
                              <motion.span
                                layoutId="nav-underline"
                                className="absolute -bottom-1 left-3 right-3 h-[2px] rounded-full"
                                style={{
                                  background: isDark
                                    ? 'linear-gradient(90deg, rgba(124,58,237,0.9), rgba(236,72,153,0.75))'
                                    : 'linear-gradient(90deg, rgba(124,58,237,0.85), rgba(236,72,153,0.65))',
                                }}
                              />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* ══ Right: Actions ══ */}
                <div className="flex items-center gap-2 min-w-[180px] justify-end flex-none">
                  <div className="hidden sm:flex items-center gap-2">
                    {/* Search */}
                    <button
                      onClick={() => setSearchOpen(true)}
                      className={`${iconBtn(isDark ? 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] text-purple-100' : 'bg-white/70 border border-violet-200/60 hover:bg-white text-gray-800')} ${focus}`}
                      aria-label="Search (Ctrl+K)"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" /></svg>
                    </button>

                    {/* ══ User area ══ */}
                    {isLoggedIn ? (
                      <div ref={userMenuRef} className="relative">
                        {/* User chip — dropdown trigger */}
                        <button
                          onClick={() => setUserMenu(v => !v)}
                          className={`h-10 pl-2 pr-3 rounded-2xl border inline-flex items-center gap-2 transition-all ${
                            userMenu
                              ? isDark ? 'bg-white/[0.07] border-purple-500/30' : 'bg-violet-50 border-violet-300'
                              : isDark ? 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]' : 'bg-white/70 border-violet-200/60 hover:bg-white'
                          } ${focus}`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                            isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-100' : 'bg-violet-50 border-violet-200 text-violet-700'
                          }`}>
                            <span className="text-[11px] font-bold">{userInitial}</span>
                          </div>
                          <span className={`text-[12px] font-medium hidden md:block ${isDark ? 'text-purple-100/80' : 'text-gray-700'}`}>
                            {firstName}
                          </span>
                          <motion.svg
                            width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
                            animate={{ rotate: userMenu ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className={isDark ? 'text-purple-300/40' : 'text-gray-400'}
                          >
                            <path d="M2.5 3.5L5 6.5L7.5 3.5" />
                          </motion.svg>
                        </button>

                        {/* ══ User dropdown ══ */}
                        <AnimatePresence>
                          {userMenu && (
                            <motion.div
                              initial={{ opacity: 0, y: -6, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.96 }}
                              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                              className={`absolute right-0 top-[calc(100%+8px)] w-56 rounded-2xl border overflow-hidden ${
                                isDark
                                  ? 'bg-void-900/95 border-purple-500/20 shadow-[0_16px_50px_rgba(0,0,0,0.6)]'
                                  : 'bg-white border-violet-200/80 shadow-xl shadow-violet-500/10'
                              }`}
                              style={{ backdropFilter: 'blur(24px)' }}
                            >
                              {/* Header */}
                              <div className={`px-4 py-3 border-b ${isDark ? 'border-purple-500/15' : 'border-violet-100'}`}>
                                <div className={`text-[13px] font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {currentUser?.name || 'User'}
                                </div>
                                <div className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-purple-200/40' : 'text-gray-400'}`}>
                                  {currentUser?.email || ''}
                                </div>
                              </div>

                              {/* Links */}
                              <div className="p-1.5">
                                {/* Profile */}
                                <Link
                                  to="/profile"
                                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                                    isDark ? 'text-purple-100/70 hover:text-white hover:bg-white/[0.06]' : 'text-gray-600 hover:text-gray-900 hover:bg-violet-50'
                                  }`}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="opacity-60">
                                    <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
                                    <path d="M20 21c0-3.9-3.6-7-8-7s-8 3.1-8 7" />
                                  </svg>
                                  Profile
                                </Link>

                                {/* Admin Panel — only for admins */}
                                {isAuth && (
                                  <Link
                                    to="/admin"
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                                      isDark ? 'text-purple-100/70 hover:text-white hover:bg-white/[0.06]' : 'text-gray-600 hover:text-gray-900 hover:bg-violet-50'
                                    }`}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="opacity-60">
                                      <path d="M12 3.5 19 6.7v6.7c0 4.2-3 7.7-7 8.9-4-1.2-7-4.7-7-8.9V6.7L12 3.5Z" />
                                      <path d="M9.5 12.2 11.2 14l3.5-4" />
                                    </svg>
                                    Admin Panel
                                  </Link>
                                )}

                                {/* Divider */}
                                <div className={`my-1 mx-2 h-px ${isDark ? 'bg-purple-500/12' : 'bg-violet-100'}`} />

                                {/* Logout */}
                                <button
                                  onClick={() => { setUserMenu(false); logout() }}
                                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-colors ${
                                    isDark ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/10' : 'text-red-500/70 hover:text-red-600 hover:bg-red-50'
                                  }`}
                                >
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="opacity-60">
                                    <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4M16 17l5-5-5-5M21 12H9" />
                                  </svg>
                                  Logout
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        to="/user-login"
                        className={`${actionBtn} ${focus} ${isDark ? 'bg-white/[0.04] border border-white/10 text-purple-100/80 hover:text-white hover:bg-white/[0.06]' : 'bg-white/70 border border-violet-200/60 text-gray-800 hover:bg-white'}`}
                      >
                        Login
                      </Link>
                    )}

                    {/* CTA */}
                    <Link to="/contact" className={`btn-primary !h-10 !px-4 !rounded-2xl !text-[12px] ${focus}`}>
                      Book
                    </Link>
                  </div>

                  {/* Mobile actions */}
                  <div className="sm:hidden flex items-center gap-2 flex-none">
                    <Link to="/contact" className={`btn-primary !h-10 !px-3 !rounded-2xl !text-[12px] ${focus}`}>
                      Book
                    </Link>
                  </div>

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setOpen(v => !v)}
                    className={`${iconBtn(isDark ? 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] text-purple-100' : 'bg-white/70 border border-violet-200/60 hover:bg-white text-gray-800')} ${focus} lg:hidden flex-none`}
                    aria-label="Menu"
                    aria-expanded={open}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      {open ? <path d="M5 5l8 8M5 13l8-8" /> : <path d="M3 6h12M3 9h12M3 12h12" />}
                    </svg>
                  </button>
                </div>
              </div>

              {/* ══ Mobile dropdown ══ */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="lg:hidden overflow-hidden"
                  >
                    <div className={`mt-3 rounded-2xl border p-2 backdrop-blur-2xl ${isDark ? 'bg-void-900/75 border-white/10' : 'bg-white/85 border-violet-200/60'}`}>
                      <div className="grid grid-cols-2 gap-2">
                        {NAV.map(l => (
                          <Link
                            key={l.to}
                            to={l.to}
                            className={`h-11 rounded-2xl px-4 inline-flex items-center justify-center text-[13px] font-medium transition-colors ${focus} ${
                              active(l.to)
                                ? isDark ? 'bg-white/[0.08] text-white' : 'bg-violet-50 text-gray-900'
                                : isDark ? 'bg-white/[0.03] text-purple-100/80 hover:text-white hover:bg-white/[0.06]' : 'bg-white/70 text-gray-700 hover:text-gray-900 hover:bg-white'
                            }`}
                          >
                            {l.l}
                          </Link>
                        ))}
                      </div>

                      <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-violet-200/50'}`}>
                        <div className="flex items-center justify-between gap-2">
                          {isLoggedIn ? (
                            <div className="flex items-center gap-2 flex-1">
                              <Link to="/profile" className={`${actionBtn} ${focus} gap-2 ${isDark ? 'bg-white/[0.04] border border-white/10 text-purple-100/80' : 'bg-white/70 border border-violet-200/60 text-gray-700'}`}>
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold ${isDark ? 'bg-purple-500/15 text-purple-200' : 'bg-violet-50 text-violet-700'}`}>
                                  {userInitial}
                                </div>
                                {firstName}
                              </Link>

                              {isAuth && (
                                <Link to="/admin" className={`${actionBtn} ${focus} ${isDark ? 'bg-prism-pink/15 border border-prism-pink/30 text-prism-pink' : 'bg-pink-50 border border-pink-200 text-pink-700'}`}>
                                  Admin
                                </Link>
                              )}

                              <button
                                onClick={logout}
                                className={`${actionBtn} ${focus} ml-auto ${isDark ? 'text-red-400/60 hover:text-red-400' : 'text-red-500/60 hover:text-red-600'}`}
                              >
                                Logout
                              </button>
                            </div>
                          ) : (
                            <Link to="/user-login" className={`${actionBtn} ${focus} ${isDark ? 'bg-white/[0.04] border border-white/10 text-purple-100/80 hover:text-white' : 'bg-white/70 border border-violet-200/60 text-gray-800 hover:bg-white'}`}>
                              Login
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </nav>
      </div>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
