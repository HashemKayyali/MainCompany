import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ImageIcon, Images } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { galleryAlbums as staticAlbums, type GalleryAlbum } from '../data/gallery'
import { usePageMeta } from '../hooks/usePageMeta'
import FramedImage from '../components/ui/FramedImage'
import { ImageGallery, type GalleryImage } from '../components/ui/image-gallery'
import Lightbox from '../components/gallery/Lightbox'
import EventiesHero from '../components/layout/EventiesHero'
import SectionHeading from '../components/home/SectionHeading'

const GALLERY_FALLBACK_IMAGES = [
  '/images/hero-bg-event.webp',
  '/images/Corporate.webp',
  '/images/Exhibitions.webp',
  '/images/Festivals.webp',
  '/images/Brand.webp',
]

function GalleryHeroShowcase({ albums }: { albums: GalleryAlbum[] }) {
  const previewImages = useMemo(() => {
    const images = albums
      .flatMap(album => [album.cover, ...album.images])
      .filter(image => image.trim().length > 0)

    const source = images.length > 0 ? images : GALLERY_FALLBACK_IMAGES
    return [...source, ...GALLERY_FALLBACK_IMAGES].slice(0, 9)
  }, [albums])

  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = previewImages[activeIndex % previewImages.length]
  const tiles = Array.from({ length: 5 }, (_, offset) => previewImages[(activeIndex + offset + 1) % previewImages.length])
  const albumNames = albums.length > 0
    ? albums.slice(0, 3).map(album => album.title)
    : ['Activations', 'Setups', 'Event moments']

  useEffect(() => {
    setActiveIndex(0)
  }, [previewImages])

  useEffect(() => {
    if (previewImages.length < 2) return

    const timer = window.setInterval(() => {
      setActiveIndex(current => (current + 1 + Math.floor(Math.random() * Math.min(3, previewImages.length - 1))) % previewImages.length)
    }, 3200)

    return () => window.clearInterval(timer)
  }, [previewImages.length])

  return (
    <div
      className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-[30px] border border-white/16 bg-white/[0.07] p-3 backdrop-blur-xl"
      style={{ boxShadow: '0 40px 90px -34px rgba(8,3,26,0.8), inset 0 1px 0 rgba(255,255,255,0.18)' }}
    >
      <div className="pointer-events-none absolute -right-16 top-10 h-44 w-44 rounded-full bg-fuchsia-400/24 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-20 left-10 h-52 w-52 rounded-full bg-violet-400/20 blur-3xl" aria-hidden="true" />

      <div className="relative grid h-[420px] gap-3 sm:grid-cols-[1fr_0.52fr]">
        <div className="relative overflow-hidden rounded-[24px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeImage}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.985 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            >
              <FramedImage
                media={activeImage}
                alt="Eventies event gallery preview"
                width={1200}
                height={900}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 1024px) 100vw, 520px"
                fallbackTransform={{ fit: 'cover' }}
                className="h-full w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <span
            className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, rgba(8,3,26,0.16) 0%, transparent 34%, rgba(8,3,26,0.78) 100%)' }}
            aria-hidden="true"
          />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.9)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/90">Live event work</span>
          </span>
          <span className="absolute inset-x-4 bottom-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.12] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-100 backdrop-blur-md">
              <Images className="h-3.5 w-3.5" strokeWidth={2.3} />
              {albums.length || 'Fresh'} albums
            </span>
            <span className="mt-3 block font-display text-[1.35rem] font-bold leading-tight text-white">
              Photos from real Eventies setups
            </span>
          </span>
        </div>

        <div className="hidden grid-cols-1 grid-rows-3 gap-3 sm:grid">
          {tiles.slice(0, 3).map((image, index) => (
            <motion.div
              key={`${image}-${index}-${activeIndex}`}
              className="relative overflow-hidden rounded-[18px] border border-white/12 bg-white/[0.06]"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <FramedImage
                media={image}
                alt=""
                width={800}
                height={600}
                loading="lazy"
                sizes="(max-width: 640px) 50vw, 260px"
                fallbackTransform={{ fit: 'cover' }}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/56 via-transparent to-transparent" aria-hidden="true" />
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-2">
        {tiles.map((image, index) => (
          <div key={`${image}-strip-${index}-${activeIndex}`} className="relative aspect-[4/3] overflow-hidden rounded-[12px] border border-white/12 bg-white/[0.06]">
            <FramedImage
              media={image}
              alt=""
              width={480}
              height={360}
              loading="lazy"
              sizes="96px"
              fallbackTransform={{ fit: 'cover' }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 px-2 pb-1 pt-3">
        {albumNames.map(name => (
          <span key={name} className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/80">
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function GalleryPage() {
  const { galleryAlbums } = useData()
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

  const selected = useMemo(() => albums.find(album => album.slug === selectedSlug) ?? null, [albums, selectedSlug])

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
        rightSlot={<GalleryHeroShowcase albums={albums} />}
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
                {albums.map(album => {
                  const isActive = album.slug === selectedSlug
                  return (
                    <button
                      key={album.slug}
                      type="button"
                      onClick={() => setSelectedSlug(album.slug)}
                      aria-pressed={isActive}
                      className={`group relative aspect-[16/10] w-[180px] shrink-0 overflow-hidden rounded-[18px] border text-left outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 sm:w-[210px] ${
                        isActive
                          ? 'border-transparent ring-2 ring-violet-500 ring-offset-2'
                          : 'border-violet-200/70 hover:-translate-y-0.5 hover:border-violet-300'
                      }`}
                    >
                      <FramedImage
                        media={album.cover}
                        alt={album.title}
                        width={640}
                        height={400}
                        loading="lazy"
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
                    <motion.div
                      key={selected.slug}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <ImageGallery
                        images={galleryImages}
                        onImageClick={index => setLightbox({ open: true, index })}
                      />
                    </motion.div>
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
