import { getTranslations } from 'next-intl/server'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading, ViewAllButton } from './SectionHeading'
import { CategoryGridCard, type CategoryGridItem } from './CategoryGridCard'

/**
 * CAT-025 — Browse by category (RSC). VERBATIM port of the Vite
 * BrowseCategories: eyebrow/title/description heading, up-to-10 category cards
 * sorted by service count, radial glow backdrop, "View all categories" pill.
 */
export async function BrowseCategories({
  locale,
  items,
}: {
  locale: string
  items: CategoryGridItem[]
}) {
  if (items.length === 0) return null
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  const visible = [...items].sort((a, b) => b.count - a.count).slice(0, 10)

  return (
    <section
      id="categories"
      className="relative scroll-mt-[calc(var(--app-navbar-height)+1rem)] py-[clamp(3rem,6vw,5rem)]"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(80% 60% at 50% 0%, rgba(168,85,247,0.10) 0%, transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="site-container-wide">
        <SectionHeading
          eyebrow={t('browseCategories.eyebrow')}
          title={t('browseCategories.title')}
          description={t('browseCategories.description')}
          className="mb-12"
        />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {visible.map((category, index) => (
            <Reveal
              key={category.slug}
              delay={Math.min(index * 0.05, 0.35)}
              y={22}
              className="h-full"
            >
              <CategoryGridCard
                category={category}
                serviceCount={t('browseCategories.serviceCount', { count: category.count })}
                exploreLabel={category.name}
                imageLoading="eager"
              />
            </Reveal>
          ))}
        </div>

        <ViewAllButton href="/categories">{t('browseCategories.viewAll')}</ViewAllButton>
      </div>
    </section>
  )
}
