import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react'
import Hero from '../components/home/Hero'
import BrowseCategories from '../components/home/BrowseCategories'
import PopularServices from '../components/home/PopularServices'
import { useGalleryData } from '../contexts/DataContext'
import { usePageMeta } from '../hooks/usePageMeta'
import {
  GALLERY_IMAGE_INTENT_EVENT,
  scheduleIdleWork,
  warmGalleryPageAssets,
} from '../lib/gallery-image-warmup'

const HowItWorks = lazy(() => import('../components/home/HowItWorks'))
const EventTypes = lazy(() => import('../components/home/EventTypes'))
const CustomBuildPreview = lazy(() => import('../components/home/CustomBuildPreview'))
const GalleryPreview = lazy(() => import('../components/home/GalleryPreview'))
const FAQ = lazy(() => import('../components/home/FAQ'))
const HomeCTA = lazy(() => import('../components/home/HomeCTA'))
const LogoCloud = lazy(() => import('../components/home/LogoCloud'))

function GalleryDataWarmup({ idleReady }: { idleReady: boolean }) {
  const [intent, setIntent] = useState(false)
  const [idleEnabled, setIdleEnabled] = useState(false)
  const warmupEnabled = intent || idleEnabled
  const { galleryAlbums } = useGalleryData(warmupEnabled)

  useEffect(() => {
    const handleIntent = () => setIntent(true)
    document.addEventListener(GALLERY_IMAGE_INTENT_EVENT, handleIntent)
    return () => document.removeEventListener(GALLERY_IMAGE_INTENT_EVENT, handleIntent)
  }, [])

  useEffect(() => {
    if (!idleReady || idleEnabled) return undefined
    return scheduleIdleWork(() => setIdleEnabled(true))
  }, [idleEnabled, idleReady])

  useEffect(() => {
    if (!intent || galleryAlbums.length === 0) return
    void warmGalleryPageAssets(galleryAlbums, true)
  }, [galleryAlbums, intent])

  return null
}

function DeferredGalleryPreview({ enabled }: { enabled: boolean }) {
  const markerRef = useRef<HTMLDivElement | null>(null)
  const [nearViewport, setNearViewport] = useState(false)

  useEffect(() => {
    if (!enabled || nearViewport) return undefined
    const marker = markerRef.current
    if (!marker || typeof IntersectionObserver === 'undefined') {
      setNearViewport(true)
      return undefined
    }

    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return
      setNearViewport(true)
      observer.disconnect()
    }, { rootMargin: '1200px 0px' })
    observer.observe(marker)
    return () => observer.disconnect()
  }, [enabled, nearViewport])

  return (
    <div ref={markerRef} data-home-image-phase="home-gallery">
      {enabled && nearViewport ? (
        <Suspense fallback={null}>
          <GalleryPreview />
        </Suspense>
      ) : null}
    </div>
  )
}

export default function HomePage() {
  const [productsEnabled, setProductsEnabled] = useState(false)
  const [galleryEnabled, setGalleryEnabled] = useState(false)
  const [galleryIdleReady, setGalleryIdleReady] = useState(false)
  const enableProducts = useCallback(() => setProductsEnabled(true), [])
  const enableGallery = useCallback(() => setGalleryEnabled(true), [])
  const enableGalleryIdleWarmup = useCallback(() => setGalleryIdleReady(true), [])

  useEffect(() => {
    if (!productsEnabled || galleryIdleReady) return undefined
    const timer = window.setTimeout(() => setGalleryIdleReady(true), 7000)
    return () => window.clearTimeout(timer)
  }, [galleryIdleReady, productsEnabled])

  usePageMeta({
    title: 'Eventies | Event Services Marketplace in Jordan',
    description:
      'Explore event rentals, interactive activations, screens, booths, production support, and custom setups across Jordan, then submit a rental or purchase quote request for review.',
    canonical: 'https://www.eventiesjo.com/',
  })

  return (
    <>
      <GalleryDataWarmup idleReady={galleryIdleReady} />
      <Hero />
      <div className="bg-white">
        <div className="home-band home-band--theme">
          <BrowseCategories onUsefulBatchReady={enableProducts} />
        </div>
        <div className="home-band home-band--plain">
          <PopularServices
            enabled={productsEnabled}
            onUsefulBatchReady={enableGallery}
            onBatchComplete={enableGalleryIdleWarmup}
          />
        </div>
        <Suspense fallback={null}>
          <div className="home-band home-band--theme">
            <HowItWorks />
          </div>
          <div className="home-band home-band--plain">
            <EventTypes />
          </div>
          <div className="home-band home-band--theme">
            <CustomBuildPreview />
          </div>
          <div className="home-band home-band--plain">
            <DeferredGalleryPreview enabled={galleryEnabled} />
          </div>
          <div className="home-band home-band--theme">
            <FAQ />
          </div>
          <div className="home-band home-band--plain">
            <HomeCTA />
          </div>
          <div className="home-band home-band--theme">
            <LogoCloud />
          </div>
        </Suspense>
      </div>
    </>
  )
}
