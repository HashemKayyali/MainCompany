import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { isDark, toggle } = useTheme()
  return (<button onClick={toggle} aria-label="Toggle theme" className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-purple-500/10 border border-purple-500/25 text-purple-100/90 hover:text-prism-violet' : 'bg-gray-100 border border-gray-200 text-gray-500 hover:text-amber-500'} ${className}`}><motion.div initial={false} animate={{ rotate: isDark ? 0 : 180, scale: [1, 0.8, 1] }} transition={{ duration: 0.4 }}>{isDark ? <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="8" cy="8" r="3.5" /><path d="M8 1v1M8 14v1M1 8h1M14 8h1M3.05 3.05l.7.7M12.25 12.25l.7.7M3.05 12.95l.7-.7M12.25 3.75l.7-.7" /></svg> : <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 9.5A6 6 0 116.5 2 4.5 4.5 0 0014 9.5z" /></svg>}</motion.div></button>)
}
