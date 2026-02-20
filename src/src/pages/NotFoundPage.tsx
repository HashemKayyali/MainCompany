import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
export default function NotFoundPage() {
  const { isDark } = useTheme()
  return <section className="min-h-[100dvh] flex items-center justify-center px-6"><motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center"><h1 className={`text-[120px] font-display font-extrabold leading-none ${isDark ? 'text-glow' : 'text-violet-200'}`}>404</h1><p className={`text-xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'} -mt-6`}>Page Not Found</p><Link to="/" className="btn-primary mt-6 inline-flex">Back Home</Link></motion.div></section>
}
