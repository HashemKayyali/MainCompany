import { type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import AnimatedBackground from '../theme/AnimatedBackground'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'

export default function PageContainer({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  useSmoothScroll()

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Skip to content — visible on focus for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-xl focus:bg-purple-600 focus:text-white focus:text-sm focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>

      <AnimatedBackground position="absolute" className="z-0" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <motion.main
          id="main-content"
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1"
        >
          {children}
        </motion.main>
        <Footer />
      </div>
    </div>
  )
}
