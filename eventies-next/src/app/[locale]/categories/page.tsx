import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCategories } from '@/server/dal/categories'
import { getProducts } from '@/server/dal/products'
import { buildMetadata } from '@/server/metadata/builders'
import { EventiesHero } from '@/features/catalog/EventiesHero'
import { CategoryGridCard, type CategoryGridItem } from '@/features/catalog/home/CategoryGridCard'
import { Reveal } from '@/components/ui/Reveal'

/** CAT-011 — /categories listing (RSC). EventiesHero + light card grid. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale,
    path: '/categories',
    title: 'Event Service Categories in Jordan | Eventies',
    description:
      'Explore Eventies event services grouped by category — rentals, activations, screens, booths, production support, and custom setups across Jordan.',
  })
}

export default async function CategoriesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.categories')
  const [categories, products] = await Promise.all([getCategories(), getProducts()])

  const countByCategory = new Map<string, number>()
  for (const p of products)
    countByCategory.set(p.categoryId, (countByCategory.get(p.categoryId) ?? 0) + 1)
  const items: CategoryGridItem[] = categories
    .filter((c) => c.slug.trim().length > 0)
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      count: countByCategory.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count)

  const chips = items.slice(0, 5).map((c) => ({ label: c.name, href: `/categories/${c.slug}` }))

  return (
    <div>
      <EventiesHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        description={t('heroDescription')}
        primaryAction={{ label: t('browseAllServices'), href: '/products' }}
        chipsLabel={t('heading')}
        chips={chips}
      />

      <div className="bg-[#f8f3ff]">
        <section className="site-section">
          <div className="site-container-wide">
            {items.length === 0 ? (
              <p className="text-center text-ink-500">{t('empty')}</p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {items.map((c, i) => (
                  <Reveal key={c.slug} delay={Math.min(i * 0.04, 0.32)} y={22} className="h-full">
                    <CategoryGridCard
                      category={c}
                      serviceCount={t('serviceCount', { count: c.count })}
                      exploreLabel={t('viewCategory', { name: c.name })}
                    />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
