import BuildCompleteEventSetup from '../components/home/BuildCompleteEventSetup'
import CategoryDiscovery from '../components/home/CategoryDiscovery'
import CompactHero from '../components/home/CompactHero'
import EventInspirationGallery from '../components/home/EventInspirationGallery'
import FAQ from '../components/home/FAQ'
import FinalCTA from '../components/home/FinalCTA'
import ForCompanies from '../components/home/ForCompanies'
import HowItWorks from '../components/home/HowItWorks'
import MarketplaceFeatures from '../components/home/MarketplaceFeatures'
import PlanByEventType from '../components/home/PlanByEventType'
import PopularRentals from '../components/home/PopularRentals'
import ProviderCTA from '../components/home/ProviderCTA'
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
      <CompactHero />
      <CategoryDiscovery />
      <PopularRentals />
      <PlanByEventType />
      <HowItWorks />
      <BuildCompleteEventSetup />
      <MarketplaceFeatures />
      <EventInspirationGallery />
      <ForCompanies />
      <ProviderCTA />
      <FAQ />
      <FinalCTA />
    </>
  )
}
