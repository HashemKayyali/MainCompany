import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCategories } from '@/server/dal/categories'
import { buildMetadata } from '@/server/metadata/builders'
import { SmartImage } from '@/components/ui/SmartImage'
import { Link } from '@/i18n/navigation'

/** CAT-011 — /categories listing (RSC). */
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
  const categories = await getCategories()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">{t('heading')}</h1>
        <p className="mt-2 text-ink-600">{t('intro')}</p>
      </header>
      {categories.length === 0 ? (
        <p className="text-ink-500">{t('empty')}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={`/categories/${c.slug}`}
                className="group block overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-violet-sm transition hover:-translate-y-0.5 hover:shadow-violet-md"
              >
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-ink-50">
                  <SmartImage
                    media={c.image}
                    alt={c.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-sm font-semibold text-ink-900">{c.name}</h2>
                  {c.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-ink-600">{c.description}</p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
