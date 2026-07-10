import { useMemo } from 'react'
import { useGalleryData, useProductsData } from '../../contexts/DataContext'
import { preloadRoute } from '../../utils/route-preload'
import { signalGalleryImageIntent } from '../../lib/gallery-image-warmup'
import BentoGallery, { type BentoGalleryItem } from '../ui/bento-gallery'
import SectionHeading, { ViewAllButton } from './SectionHeading'

type GalleryShot = { src: string; title: string }

const tilePattern = [
  'col-span-2 row-span-2 sm:col-span-2 lg:col-span-2',
  'col-span-3 row-span-1 sm:col-span-3 lg:col-span-3',
  'col-span-3 row-span-1 sm:col-span-3 lg:col-span-3',
  'col-span-2 row-span-2 sm:col-span-2 lg:col-span-2',
  'col-span-2 row-span-1 sm:col-span-2 lg:col-span-2',
  'col-span-2 row-span-1 sm:col-span-2 lg:col-span-2',
  'col-span-3 row-span-2 sm:col-span-3 lg:col-span-3',
  'col-span-2 row-span-1 sm:col-span-2 lg:col-span-2',
  'col-span-2 row-span-1 sm:col-span-2 lg:col-span-2',
] as const

function stableHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mixShots(shots: GalleryShot[]) {
  return [...shots].sort((left, right) => {
    const leftHash = stableHash(`${left.src}|${left.title}`)
    const rightHash = stableHash(`${right.src}|${right.title}`)
    return leftHash - rightHash
  })
}

export default function GalleryPreview() {
  const { galleryAlbums, galleryLoading } = useGalleryData()
  const { products } = useProductsData()

  const shots = useMemo<BentoGalleryItem[]>(() => {
    const seen = new Set<string>()
    const albumShots: GalleryShot[] = []

    for (const album of galleryAlbums) {
      for (const src of [...(album.images || []), album.cover]) {
        if (!src || seen.has(src)) continue
        seen.add(src)
        albumShots.push({ src, title: album.title })
      }
    }

    const sourceShots = albumShots.length > 0
      ? albumShots
      : galleryLoading
        ? []
        : products.flatMap(product =>
          [product.heroImage, ...(product.gallery || [])]
            .filter((src): src is string => Boolean(src))
            .map(src => ({ src, title: product.name }))
        )

    const uniqueFallbackShots = sourceShots.filter(shot => {
      if (albumShots.length > 0) return true
      if (seen.has(shot.src)) return false
      seen.add(shot.src)
      return true
    })

    return mixShots(uniqueFallbackShots).slice(0, 12).map((shot, index) => ({
      id: `${stableHash(shot.src)}-${index}`,
      title: shot.title || 'Gallery highlight',
      url: shot.src,
      span: tilePattern[index % tilePattern.length],
    }))
  }, [galleryAlbums, galleryLoading, products])

  if (shots.length === 0) return null

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow="Gallery"
          title="Event Inspiration Gallery"
          description="Explore setups, service showcases, and event ideas to shape your next experience."
          className="mb-10"
        />
      </div>

      <BentoGallery imageItems={shots} />

      <div className="site-container-wide">
        <ViewAllButton to="/gallery" onMouseEnter={() => {
          preloadRoute('/gallery')
          signalGalleryImageIntent()
        }}>
          View full gallery
        </ViewAllButton>
      </div>
    </section>
  )
}
