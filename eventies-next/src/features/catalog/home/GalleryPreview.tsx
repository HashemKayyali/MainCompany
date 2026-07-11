import { getTranslations } from 'next-intl/server'
import { SmartImage } from '@/components/ui/SmartImage'
import { SectionHeading, ViewAllButton } from './SectionHeading'

/**
 * CAT-026 — Gallery preview (RSC). Faithful port of the Vite GalleryPreview
 * bento layout (6-col masonry with the fixed tile pattern). Shots are built
 * server-side from gallery albums (falls back to product images) by the caller.
 */
export type GalleryShot = { url: string; title: string }

const TILE_PATTERN = [
  'col-span-2 row-span-2',
  'col-span-3 row-span-1',
  'col-span-3 row-span-1',
  'col-span-2 row-span-2',
  'col-span-2 row-span-1',
  'col-span-2 row-span-1',
  'col-span-3 row-span-2',
  'col-span-2 row-span-1',
  'col-span-2 row-span-1',
] as const

export async function GalleryPreview({ locale, shots }: { locale: string; shots: GalleryShot[] }) {
  if (shots.length === 0) return null
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  const tiles = shots.slice(0, 9)

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow={t('galleryPreview.eyebrow')}
          title={t('galleryPreview.title')}
          description={t('galleryPreview.description')}
          className="mb-10"
        />
      </div>

      <div className="site-container-wide">
        <div className="grid auto-rows-[110px] grid-cols-6 gap-3 sm:auto-rows-[150px]">
          {tiles.map((shot, index) => (
            <div
              key={`${shot.url}-${index}`}
              className={`group relative overflow-hidden rounded-2xl bg-violet-50 ${TILE_PATTERN[index % TILE_PATTERN.length]}`}
            >
              <SmartImage
                media={shot.url}
                alt={shot.title || t('galleryPreview.highlight')}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="pointer-events-none absolute inset-x-3 bottom-3 line-clamp-2 text-[12px] font-bold text-white opacity-0 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] transition-opacity duration-500 group-hover:opacity-100">
                {shot.title || t('galleryPreview.highlight')}
              </span>
            </div>
          ))}
        </div>

        <ViewAllButton href="/gallery">{t('galleryPreview.viewAll')}</ViewAllButton>
      </div>
    </section>
  )
}
