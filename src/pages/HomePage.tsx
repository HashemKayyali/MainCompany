import Hero from '../components/home/Hero'
import FeaturedProducts from '../components/home/FeaturedProducts'
import LogoCloud from '../components/home/LogoCloud'
import OfferSection from '../components/home/OfferSection'
import StatsStrip from '../components/home/StatsStrip'
import { usePageMeta } from '../hooks/usePageMeta'

export default function HomePage() {
  usePageMeta({
    title: 'Home',
    description:
      'Premium event services marketplace in Jordan for discovering, comparing, and booking trusted vendors across categories.',
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
