import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { useUser } from '../../contexts/UserContext'
import ThemeToggle from '../theme/ThemeToggle'

const NAV = [{ to: '/', l: 'Home' },{ to: '/products', l: 'Products' },{ to: '/customers', l: 'Customers' },{ to: '/gallery', l: 'Gallery' },{ to: '/about', l: 'About' }]

export default function Navbar() {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
  const { isAuth } = useAuth()
  const { isLoggedIn, currentUser, logout } = useUser()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => { const fn = () => setScrolled(window.scrollY > 40); window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn) }, [])
  useEffect(() => { setOpen(false) }, [pathname])
  const active = (p: string) => p === '/' ? pathname === '/' : pathname.startsWith(p)

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-3">
      <nav className={`relative max-w-6xl mx-auto rounded-2xl px-5 py-2.5 transition-all duration-700 ${scrolled ? isDark ? 'bg-void-900/70 backdrop-blur-2xl border border-purple-500/20 shadow-[0_8px_40px_rgba(0,0,0,0.5)]' : 'bg-white/80 backdrop-blur-2xl border border-violet-200/40 shadow-lg shadow-violet-500/5' : 'bg-transparent border border-transparent'}`}>
        {scrolled && <div className="absolute inset-x-4 top-0 h-px" style={{ background: isDark ? 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), rgba(236,72,153,0.2), transparent)' : 'linear-gradient(90deg, transparent, rgba(124,58,237,0.2), transparent)' }} />}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-prism-violet/30 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-xs font-display">BL</span>
            </div>
            <span className={`hidden sm:block text-[13px] font-bold tracking-[0.2em] uppercase font-display ${isDark ? 'text-white' : 'text-gray-900'}`}>Bike <span className={isDark ? 'text-prism-violet' : 'text-violet-600'}>Land</span></span>
          </Link>
          <div className={`hidden lg:flex items-center gap-0.5 rounded-xl p-1 border ${isDark ? 'bg-purple-500/[0.07] border-purple-500/20' : 'bg-violet-50/50 border-violet-100/50'}`}>
            {NAV.map(l => (
              <Link key={l.to} to={l.to} className={`relative px-4 py-2 rounded-lg text-[13px] font-medium transition-all ${active(l.to) ? isDark ? 'text-prism-violet' : 'text-violet-600' : isDark ? 'text-purple-200/80 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                {active(l.to) && <motion.div layoutId="nav-pill" className={`absolute inset-0 rounded-lg border ${isDark ? 'bg-prism-violet/15 border-prism-violet/30' : 'bg-violet-50 border-violet-200/50'}`} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
                <span className="relative z-10">{l.l}</span>
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className={`text-[11px] font-medium hidden sm:block ${isDark ? 'text-purple-200/80' : 'text-gray-500'}`}>{currentUser?.name.split(' ')[0]}</span>
                <button onClick={logout} className={`text-[10px] font-mono px-2 py-1.5 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-300/80 hover:text-red-400' : 'bg-gray-100 text-gray-400 hover:text-red-500'}`}>Logout</button>
              </div>
            ) : (
              <Link to="/user-login" className={`text-[11px] font-medium px-3 py-2 rounded-lg transition-all ${isDark ? 'bg-purple-500/10 text-purple-200/80 hover:text-prism-violet border border-purple-500/20' : 'bg-violet-50 text-violet-600 hover:bg-violet-100 border border-violet-200'}`}>Login</Link>
            )}
            {isAuth && <Link to="/admin" className={`text-[10px] font-mono px-2 py-1.5 rounded-lg ${isDark ? 'bg-prism-pink/15 text-prism-pink border border-prism-pink/30' : 'bg-pink-50 text-pink-600 border border-pink-200'}`}>Admin</Link>}
            <Link to="/contact" className="btn-primary !px-4 !py-2 !rounded-xl !text-xs !gap-1.5"><span>Book</span></Link>
            <button onClick={() => setOpen(!open)} className={`lg:hidden w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-purple-500/10 border border-purple-500/25 text-purple-200/90' : 'bg-violet-50 border border-violet-200 text-gray-500'}`} aria-label="Menu">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">{open ? <path d="M4 4l8 8M4 12l8-8" /> : <path d="M2 5h12M2 8h12M2 11h12" />}</svg>
            </button>
          </div>
        </div>
        <AnimatePresence>{open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="lg:hidden overflow-hidden">
            <div className={`pt-3 pb-2 space-y-1 border-t mt-2.5 ${isDark ? 'border-purple-500/20' : 'border-violet-100'}`}>
              {NAV.map(l => <Link key={l.to} to={l.to} className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${active(l.to) ? isDark ? 'text-prism-violet bg-prism-violet/15' : 'text-violet-600 bg-violet-50' : isDark ? 'text-purple-200/80' : 'text-gray-500'}`}>{l.l}</Link>)}
            </div>
          </motion.div>
        )}</AnimatePresence>
      </nav>
    </header>
  )
}
