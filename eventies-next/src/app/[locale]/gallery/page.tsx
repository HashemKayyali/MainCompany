import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getGalleryAlbums } from '@/server/dal/catalog-extras'
import { buildMetadata } from '@/server/metadata/builders'
import { GalleryGrid, type GalleryImage } from '@/features/gallery/GalleryGrid'

/**
 * CAT-014 — /gallery. Album list resolves server-side (RSC); the image grid is
 * a progressive client island (batches, IO, content-visibility) so the first
 * viewport is fast and nothing reshuffles on data arrival.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale,
    path: '/gallery',
    title: 'Event Gallery & Activations in Jordan | Eventies',
    description:
      'Browse albums from Eventies activations, service setups, custom builds, and real event moments across Jordan.',
  })
}

export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.gallery')
  const albums = [...(await getGalleryAlbums())].sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">{t('heading')}</h1>
        <p className="mt-2 text-ink-600">{t('intro')}</p>
      </header>
      {albums.length === 0 ? (
        <p className="text-ink-500">{t('empty')}</p>
      ) : (
        <div className="space-y-12">
          {albums.map((album) => {
            const images: GalleryImage[] = (album.images ?? [])
              .filter(Boolean)
              .map((url, i) => ({ url, alt: `${album.title} ${i + 1}` }))
            if (images.length === 0) return null
            return (
              <section key={album.id}>
                <h2 className="mb-4 text-xl font-semibold text-ink-900">{album.title}</h2>
                <GalleryGrid images={images} />
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
