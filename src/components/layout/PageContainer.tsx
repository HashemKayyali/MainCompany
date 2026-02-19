import { type ReactNode, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import AnimatedBackground from '../theme/AnimatedBackground'
export default function PageContainer({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (<div className="min-h-screen flex flex-col relative"><AnimatedBackground /><div className="relative z-10 flex flex-col min-h-screen"><Navbar /><motion.main key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex-1">{children}</motion.main><Footer /></div></div>)
}
