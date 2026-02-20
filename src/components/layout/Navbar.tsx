import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useUser } from '../../contexts/UserContext'

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

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const active = (p: string) => (p === '/' ? pathname === '/' : pathname.startsWith(p))

  const focus =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  const shell = useMemo(() => {
    const base = isDark ? 'bg-void-900/45 border-white/10' : 'bg-white/55 border-violet-200/60'
    const strong = isDark
      ? 'bg-void-900/72 border-purple-500/20 shadow-[0_12px_55px_rgba(0,0,0,0.55)]'
      : 'bg-white/82 border-violet-200/70 shadow-lg shadow-violet-500/10'
    return scrolled ? strong : base
  }, [scrolled, isDark])

  const linkBase =
    'relative px-3.5 h-10 inline-flex items-center justify-center rounded-xl text-[13px] font-medium transition-all'
  const linkText = (isActive: boolean) =>
    isActive
      ? isDark
        ? 'text-white'
        : 'text-gray-900'
      : isDark
        ? 'text-purple-100/80 hover:text-white'
        : 'text-gray-600 hover:text-gray-900'

  const actionBtn =
    'h-10 px-3 rounded-xl text-[12px] font-medium transition-all inline-flex items-center justify-center'

  const iconBtn = (extra: string) =>
    `w-10 h-10 rounded-xl inline-flex items-center justify-center transition-all ${extra}`

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
              filter: 'blur(0px)',
            }}
          />

          <div className={`relative rounded-2xl border backdrop-blur-2xl ${shell}`}>
            <div className="px-4 sm:px-5 py-3">
              <div className="flex items-center justify-between gap-3">
                {/* Left: Brand */}
                {/* ✅ تغييرات مهمة:
                   - min-w-0 عشان يسمح بالقص (truncate) بدل ما يزق العناصر
                   - flex-1 على الموبايل عشان ياخذ مساحة من اليمين
                */}
                <Link
                  to="/"
                  className={`flex items-center gap-3 min-w-0 flex-1 lg:flex-none ${focus}`}
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-prism-violet/25 flex-none">
                    <span className="text-white font-black text-xs font-display">BL</span>
                  </div>

                  {/* ✅ هون كان hidden sm:block — شلناه وخليّناه responsive */}
                  <div className="leading-none min-w-0">
                    <div
                      className={`font-bold uppercase font-display truncate ${
                        isDark ? 'text-white' : 'text-gray-900'
                      } text-[11px] sm:text-[12px] tracking-[0.18em] sm:tracking-[0.22em]`}
                    >
                      Bike <span className={isDark ? 'text-prism-violet' : 'text-violet-600'}>Land</span>
                    </div>

                    {/* ✅ السطر الثاني: نخليه يختفي فقط على xs إذا بدك (أنا خليته يظهر بس بحجم أصغر) */}
                    <div
                      className={`truncate mt-1 ${
                        isDark ? 'text-purple-200/60' : 'text-gray-400'
                      } text-[9.5px] sm:text-[10px]`}
                    >
                      Rentals • Events • Experiences
                    </div>
                  </div>
                </Link>

                {/* Center: Nav (desktop) */}
                <div className="hidden lg:flex items-center justify-center flex-1">
                  <div
                    className={`px-2 py-1 rounded-2xl border ${
                      isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white/60 border-violet-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      {NAV.map(l => {
                        const isA = active(l.to)
                        return (
                          <Link key={l.to} to={l.to} className={`${linkBase} ${linkText(isA)} ${focus}`}>
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

                {/* Right: Actions */}
                <div className="flex items-center gap-2 min-w-[180px] justify-end flex-none">
                  {/* Desktop actions */}
                  <div className="hidden sm:flex items-center gap-2">
                    {isLoggedIn ? (
                      <div
                        className={`h-10 pl-2 pr-1 rounded-2xl border inline-flex items-center gap-2 ${
                          isDark ? 'bg-white/[0.03] border-white/10' : 'bg-white/70 border-violet-200/60'
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                            isDark
                              ? 'bg-purple-500/10 border-purple-500/20 text-purple-100'
                              : 'bg-violet-50 border-violet-200 text-violet-700'
                          }`}
                          title={currentUser?.name || 'User'}
                        >
                          <span className="text-[11px] font-bold">{userInitial}</span>
                        </div>
                        <span className={`text-[12px] font-medium hidden md:block ${isDark ? 'text-purple-100/80' : 'text-gray-700'}`}>
                          {firstName}
                        </span>
                        <button
                          onClick={logout}
                          className={`${actionBtn} ${focus} ${
                            isDark ? 'text-purple-100/75 hover:text-red-300' : 'text-gray-600 hover:text-red-600'
                          }`}
                          style={{ paddingLeft: 10, paddingRight: 10 }}
                        >
                          Logout
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/user-login"
                        className={`${actionBtn} ${focus} ${
                          isDark
                            ? 'bg-white/[0.04] border border-white/10 text-purple-100/80 hover:text-white hover:bg-white/[0.06]'
                            : 'bg-white/70 border border-violet-200/60 text-gray-800 hover:bg-white'
                        }`}
                      >
                        Login
                      </Link>
                    )}

                    {isAuth && (
                      <Link
                        to="/admin"
                        className={`${actionBtn} ${focus} ${
                          isDark
                            ? 'bg-prism-pink/15 border border-prism-pink/30 text-prism-pink hover:bg-prism-pink/20'
                            : 'bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100'
                        }`}
                      >
                        Admin
                      </Link>
                    )}

                    <Link to="/contact" className={`btn-primary !h-10 !px-4 !rounded-2xl !text-[12px] ${focus}`}>
                      Book
                    </Link>
                  </div>

                  {/* Mobile: book */}
                  <div className="sm:hidden flex items-center gap-2 flex-none">
                    <Link to="/contact" className={`btn-primary !h-10 !px-3 !rounded-2xl !text-[12px] ${focus}`}>
                      Book
                    </Link>
                  </div>

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setOpen(v => !v)}
                    className={`${iconBtn(
                      isDark
                        ? 'bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] text-purple-100'
                        : 'bg-white/70 border border-violet-200/60 hover:bg-white text-gray-800'
                    )} ${focus} lg:hidden flex-none`}
                    aria-label="Menu"
                    aria-expanded={open}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      {open ? <path d="M5 5l8 8M5 13l8-8" /> : <path d="M3 6h12M3 9h12M3 12h12" />}
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile dropdown */}
              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="lg:hidden overflow-hidden"
                  >
                    <div
                      className={`mt-3 rounded-2xl border p-2 backdrop-blur-2xl ${
                        isDark ? 'bg-void-900/75 border-white/10' : 'bg-white/85 border-violet-200/60'
                      }`}
                    >
                      <div className="grid grid-cols-2 gap-2">
                        {NAV.map(l => (
                          <Link
                            key={l.to}
                            to={l.to}
                            className={`h-11 rounded-2xl px-4 inline-flex items-center justify-center text-[13px] font-medium transition-colors ${focus} ${
                              active(l.to)
                                ? isDark
                                  ? 'bg-white/[0.08] text-white'
                                  : 'bg-violet-50 text-gray-900'
                                : isDark
                                  ? 'bg-white/[0.03] text-purple-100/80 hover:text-white hover:bg-white/[0.06]'
                                  : 'bg-white/70 text-gray-700 hover:text-gray-900 hover:bg-white'
                            }`}
                          >
                            {l.l}
                          </Link>
                        ))}
                      </div>

                      <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-violet-200/50'}`}>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {isAuth && (
                              <Link
                                to="/admin"
                                className={`${actionBtn} ${focus} ${
                                  isDark
                                    ? 'bg-prism-pink/15 border border-prism-pink/30 text-prism-pink'
                                    : 'bg-pink-50 border border-pink-200 text-pink-700'
                                }`}
                              >
                                Admin
                              </Link>
                            )}
                          </div>

                          {isLoggedIn ? (
                            <button
                              onClick={logout}
                              className={`${actionBtn} ${focus} ${
                                isDark
                                  ? 'bg-white/[0.04] border border-white/10 text-purple-100/80 hover:text-red-300'
                                  : 'bg-white/70 border border-violet-200/60 text-gray-700 hover:text-red-600'
                              }`}
                            >
                              Logout
                            </button>
                          ) : (
                            <Link
                              to="/user-login"
                              className={`${actionBtn} ${focus} ${
                                isDark
                                  ? 'bg-white/[0.04] border border-white/10 text-purple-100/80 hover:text-white'
                                  : 'bg-white/70 border border-violet-200/60 text-gray-800 hover:bg-white'
                              }`}
                            >
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
    </header>
  )
}