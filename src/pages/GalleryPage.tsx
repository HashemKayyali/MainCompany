import { useEffect, useMemo, useState } from 'react'
import { ImageIcon, Images } from 'lucide-react'
import { useGalleryData } from '../contexts/DataContext'
import { galleryAlbums as staticAlbums } from '../data/gallery'
import { usePageMeta } from '../hooks/usePageMeta'
import FramedImage from '../components/ui/FramedImage'
import { ImageGallery, type GalleryImage } from '../components/ui/image-gallery'
import Lightbox from '../components/gallery/Lightbox'
import EventiesHero from '../components/layout/EventiesHero'
import SectionHeading from '../components/home/SectionHeading'
import { preloadImage } from '../lib/image-delivery'

export default function GalleryPage() {
  // Split hook (batch 3): this page only ensures gallery_albums.
  const { galleryAlbums } = useGalleryData()
  usePageMeta({
    title: 'Event Gallery & Activations in Jordan | Eventies',
    description:
      'Browse albums from Eventies activations, service setups, custom builds, and real event moments across Jordan.',
    canonical: 'https://www.eventiesjo.com/gallery',
  })

  const albums = useMemo(
    () => (galleryAlbums.length > 0 ? galleryAlbums : staticAlbums),
    [galleryAlbums]
  )

  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 })

  useEffect(() => {
    if (albums.length === 0) return
    setSelectedSlug(current => (current && albums.some(album => album.slug === current) ? current : albums[0].slug))
  }, [albums])

  const selected = useMemo(
    () => albums.find(album => album.slug === selectedSlug) ?? albums[0] ?? null,
    [albums, selectedSlug]
  )

  const galleryImages = useMemo<GalleryImage[]>(
    () => (selected?.images ?? []).map((src, index) => ({ src, alt: `${selected?.title} - photo ${index + 1}` })),
    [selected]
  )

  const heroChips = useMemo(
    () => (albums.length > 0
      ? albums.slice(0, 5).map(album => ({ label: album.title, href: '#gallery-work' }))
      : [
          { label: 'Events', href: '#gallery-work' },
          { label: 'Services', href: '#gallery-work' },
          { label: 'Setups', href: '#gallery-work' },
          { label: 'Moments', href: '#gallery-work' },
        ]),
    [albums]
  )

  return (
    <>
      <EventiesHero
        eyebrow="Event Gallery - Jordan"
        title={
          <>
            Real events, real <span>setups</span>.
          </>
        }
        description="Browse albums from Eventies activations, service setups, custom builds, and real event moments across Jordan."
        primaryAction={{ label: 'Browse Albums', href: '#gallery-work' }}
        secondaryAction={{ label: 'Plan an Event', to: '/contact' }}
        chips={heroChips}
        contentClassName="lg:col-span-2"
      />

      <div className="bg-[#f8f3ff]">
      <section id="gallery-work" className="site-section scroll-mt-[96px]">
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Gallery albums"
            title="Browse Eventies event albums"
            description="Choose an album to view real photos from activations, setup moments, service showcases, and completed event work."
            className="mb-10"
          />

          {albums.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-[24px] border border-violet-200/70 bg-white py-20 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-500">
                <ImageIcon className="h-7 w-7" strokeWidth={1.8} />
              </span>
              <p className="mt-4 text-[1.05rem] font-bold text-ink-900">No albums yet</p>
              <p className="mt-1 text-[13px] text-ink-500">Event photo albums will appear here soon.</p>
            </div>
          ) : (
            <>
              <div className="scrollbar-hide -mx-1 flex gap-3 overflow-x-auto px-1 py-2">
                {albums.map((album, index) => {
                  const isActive = album.slug === selected?.slug
                  return (
                    <button
                      key={album.slug}
                      type="button"
                      onClick={() => setSelectedSlug(album.slug)}
                      onMouseEnter={() => { void preloadImage(album.images[0] || album.cover, 'thumbnail', 'gallery-warmup', '210px') }}
                      onFocus={() => { void preloadImage(album.images[0] || album.cover, 'thumbnail', 'gallery-warmup', '210px') }}
                      onTouchStart={() => { void preloadImage(album.images[0] || album.cover, 'thumbnail', 'gallery-warmup', '210px') }}
                      aria-pressed={isActive}
                      className={`group relative aspect-[16/10] w-[180px] shrink-0 overflow-hidden rounded-[18px] border text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 sm:w-[210px] ${
                        isActive
                          ? 'border-transparent ring-2 ring-violet-500 ring-offset-2'
                          : 'border-violet-200/70 hover:-translate-y-0.5 hover:border-violet-300'
                      }`}
                    >
                      <FramedImage
                        media={album.cover}
                        preset="card"
                        alt={album.title}
                        width={640}
                        height={400}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        fetchPriority={isActive ? 'high' : 'auto'}
                        sizes="(max-width: 640px) 180px, 210px"
                        fallbackTransform={{ fit: 'cover' }}
                        className={`absolute inset-0 h-full w-full object-cover transition-transform duration-500 ${
                          isActive ? 'scale-105' : 'group-hover:scale-105'
                        }`}
                      />
                      <span
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(180deg, rgba(13,4,36,0.05) 0%, rgba(13,4,36,0.78) 100%)' }}
                        aria-hidden="true"
                      />
                      <span className="absolute inset-x-0 bottom-0 p-3">
                        <span className="block truncate font-sans text-[13px] font-bold text-white">
                          {album.title}
                        </span>
                        <span className="text-[10.5px] font-semibold text-white/75">
                          {album.images.length} photo{album.images.length === 1 ? '' : 's'}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>

              {selected && (
                <div className="mt-10">
                  <div className="mb-6 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="font-display text-[1.4rem] font-bold text-ink-900 sm:text-[1.65rem]">
                        {selected.title}
                      </h2>
                      <p className="mt-1 text-[12.5px] font-semibold text-violet-600">
                        {selected.images.length} photo{selected.images.length === 1 ? '' : 's'}
                      </p>
                    </div>
                  </div>

                  {galleryImages.length === 0 ? (
                    <div className="rounded-[20px] border border-violet-200/70 bg-white py-16 text-center text-[13px] font-medium text-ink-500">
                      This album has no photos yet.
                    </div>
                  ) : (
                    <div key={selected.slug}>
                      <ImageGallery
                        images={galleryImages}
                        onImageClick={index => setLightbox({ open: true, index })}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {selected && (
          <Lightbox
            images={selected.images}
            initialIndex={lightbox.index}
            open={lightbox.open}
            onClose={() => setLightbox(state => ({ ...state, open: false }))}
          />
        )}
      </section>
      </div>
    </>
  )
}
