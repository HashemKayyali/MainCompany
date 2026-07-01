import { useEffect, useMemo, useRef } from 'react'
import { useCategoriesData, useProductsData } from '../../contexts/DataContext'
import { preloadRoute } from '../../utils/route-preload'
import CategoryGridCard, { type CategoryGridCardData } from '../category/CategoryGridCard'
import Reveal from './Reveal'
import SectionHeading, { ViewAllButton } from './SectionHeading'

export default function BrowseCategories() {
  const { categories } = useCategoriesData()
  const { getProductsByCategory } = useProductsData()
  const sectionRef = useRef<HTMLElement | null>(null)

  const items = useMemo<CategoryGridCardData[]>(
    () =>
      categories
        .filter(category => category.slug.trim().length > 0)
        .map(category => ({
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          image: category.image,
          count: getProductsByCategory(category.id).length,
        }))
        .sort((a, b) => b.count - a.count),
    [categories, getProductsByCategory]
  )

  useEffect(() => {
    if (typeof window === 'undefined' || window.location.hash !== '#categories') return

    const scrollToSection = () => {
      if (!sectionRef.current) return
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const header = document.querySelector('header')
      const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0
      const top = window.scrollY + sectionRef.current.getBoundingClientRect().top - headerHeight - 16
      const targetTop = Math.max(0, top)
      window.__appLenis?.scrollTo(targetTop, { immediate: prefersReducedMotion, force: true })
      window.scrollTo({ top: targetTop, left: 0, behavior: 'auto' })
    }

    const timeouts = [0, 250, 750, 1500].map(delay => window.setTimeout(scrollToSection, delay))
    return () => timeouts.forEach(timeout => window.clearTimeout(timeout))
  }, [])

  if (items.length === 0) return null

  return (
    <section ref={sectionRef} id="categories" className="relative scroll-mt-[calc(var(--app-navbar-height)+1rem)] py-[clamp(3rem,6vw,5rem)]">
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ background: 'radial-gradient(80% 60% at 50% 0%, rgba(168,85,247,0.10) 0%, transparent 60%)' }}
        aria-hidden="true"
      />
      <div className="site-container-wide">
        <SectionHeading
          eyebrow="Browse by category"
          title="What are you planning?"
          description="Explore service categories built for every kind of event. Open any category to see available services, packages, and providers."
          className="mb-12"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.slice(0, 10).map((category, index) => (
            <Reveal key={category.slug} delay={Math.min(index * 0.05, 0.35)} y={22} className="h-full">
              <CategoryGridCard category={category} imageLoading="lazy" />
            </Reveal>
          ))}
        </div>

        <ViewAllButton to="/categories" onMouseEnter={() => preloadRoute('/categories')}>
          View all categories
        </ViewAllButton>
      </div>
    </section>
  )
}
