import { useEffect, type CSSProperties, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import HeroBackground from './HeroBackground'
import AnimatedBackground from '../theme/AnimatedBackground'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { usePerfMode } from '../../hooks/usePerfMode'
import { installLinkPreloadListeners, warmCommonRoutes } from '../../utils/route-preload'

const HERO_BACKGROUND_PATHS = new Set([
  '/',
  '/products',
  '/custom-builds',
  '/categories',
  '/customers',
  '/gallery',
  '/about',
  '/contact',
])

export default function PageContainer({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  const { perfLow, saveData } = usePerfMode()
  useSmoothScroll()

  const isHome = pathname === '/'
  const showHeroBackground = HERO_BACKGROUND_PATHS.has(pathname)

  const pageShellStyle = {
    '--app-header-offset': 'var(--app-navbar-height)',
  } as CSSProperties

  useEffect(() => {
    if (perfLow || saveData) return
    warmCommonRoutes()
  }, [perfLow, saveData])

  useEffect(() => {
    if (perfLow || saveData) return undefined
    return installLinkPreloadListeners()
  }, [perfLow, saveData])

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-[100] focus:rounded-xl focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to content
      </a>

      {/* Base page atmosphere stays behind the app. */}
      <AnimatedBackground position="fixed" className="z-0" variant="lightweight" />
      <HeroBackground fixed active={showHeroBackground} className="z-[1]" />
      <div
        className="relative z-10 flex min-h-screen min-w-0 flex-col"
        style={pageShellStyle}
      >
        <Navbar />

        <main
          id="main-content"
          className="flex-1 min-w-0 overflow-y-visible"
          style={{ paddingTop: isHome ? 0 : 'var(--app-header-offset)' }}
        >
          {children}
        </main>

        <Footer />
      </div>
    </div>
  )
}
