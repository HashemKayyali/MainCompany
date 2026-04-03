import { type CSSProperties, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'
import AnimatedBackground from '../theme/AnimatedBackground'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'

export default function PageContainer({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  useSmoothScroll()

  const pageShellStyle = {
    '--app-header-offset': 'var(--app-navbar-height)',
  } as CSSProperties

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-xl focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>

      <AnimatedBackground position="absolute" className="z-0 overflow-hidden" />

      <div
        className="relative z-10 flex min-h-screen min-w-0 flex-col"
        style={pageShellStyle}
      >
        <Navbar />

        <motion.main
          id="main-content"
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 min-w-0 overflow-y-visible"
          style={{ paddingTop: 'var(--app-header-offset)' }}
        >
          {children}
        </motion.main>

        <Footer />
      </div>
    </div>
  )
}