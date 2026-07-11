import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCustomBuilds } from '@/server/dal/catalog-extras'
import { buildMetadata } from '@/server/metadata/builders'
import { SmartImage } from '@/components/ui/SmartImage'

/** CAT-012 — /custom-builds (RSC). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale,
    path: '/custom-builds',
    title: 'Custom Event Builds & Interactive Experiences | Eventies',
    description:
      'Eventies designs and builds custom interactive experiences, branded activations, games, software, hardware, and event-ready setups for local and international projects.',
  })
}

export default async function CustomBuildsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.customBuilds')
  const builds = (await getCustomBuilds()).filter((b) => b.is_active !== false)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">{t('heading')}</h1>
        <p className="mt-2 max-w-2xl text-ink-600">{t('intro')}</p>
      </header>
      {builds.length === 0 ? (
        <p className="text-ink-500">{t('empty')}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {builds.map((b) => (
            <li
              key={b.id}
              className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-violet-sm"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-50">
                <SmartImage
                  media={b.image_url || b.images?.[0] || ''}
                  alt={b.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-base font-semibold text-ink-900">{b.title}</h2>
                {b.description ? (
                  <p className="mt-1 line-clamp-3 text-sm text-ink-600">{b.description}</p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
