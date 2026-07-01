import { Suspense, lazy } from 'react'
import Hero from '../components/home/Hero'
import BrowseCategories from '../components/home/BrowseCategories'
import PopularServices from '../components/home/PopularServices'
import { usePageMeta } from '../hooks/usePageMeta'

const HowItWorks = lazy(() => import('../components/home/HowItWorks'))
const EventTypes = lazy(() => import('../components/home/EventTypes'))
const CustomBuildPreview = lazy(() => import('../components/home/CustomBuildPreview'))
const GalleryPreview = lazy(() => import('../components/home/GalleryPreview'))
const FAQ = lazy(() => import('../components/home/FAQ'))
const HomeCTA = lazy(() => import('../components/home/HomeCTA'))
const LogoCloud = lazy(() => import('../components/home/LogoCloud'))

export default function HomePage() {
  usePageMeta({
    title: 'Eventies | Event Services Marketplace in Jordan',
    description:
      'Explore event rentals, interactive activations, screens, booths, production support, and custom setups across Jordan, then submit a rental or purchase quote request for review.',
    canonical: 'https://www.eventiesjo.com/',
  })

  return (
    <>
      <Hero />
      <div className="bg-white">
        <div className="home-band home-band--theme">
          <BrowseCategories />
        </div>
        <div className="home-band home-band--plain">
          <PopularServices />
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
            <GalleryPreview />
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
