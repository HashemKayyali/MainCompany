import Hero from '../components/home/Hero'
import FeaturedProducts from '../components/home/FeaturedProducts'
import LogoCloud from '../components/home/LogoCloud'
import OfferSection from '../components/home/OfferSection'
import StatsStrip from '../components/home/StatsStrip'
import { usePageMeta } from '../hooks/usePageMeta'

export default function HomePage() {
  usePageMeta({
    title: 'Event Services & Vendors in Jordan | Eventies',
    description:
      'Discover venues, photographers, catering, booths, equipment, entertainment, and trusted event vendors across Jordan with Eventies.',
    canonical: 'https://www.eventiesjo.com/',
  })

  return (
    <>
      <Hero />

      <div className="relative z-10 -mt-24 sm:-mt-28">
        <StatsStrip />
      </div>

      <FeaturedProducts />
      <OfferSection />
      <LogoCloud />
    </>
  )
}
