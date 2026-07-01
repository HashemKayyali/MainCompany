import { useMemo } from 'react'
import { useGalleryData, useProductsData } from '../../contexts/DataContext'
import { preloadRoute } from '../../utils/route-preload'
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

export default function GalleryPreview() {
  const { galleryAlbums } = useGalleryData()
  const { products } = useProductsData()

  const shots = useMemo<BentoGalleryItem[]>(() => {
    const seen = new Set<string>()
    const out: GalleryShot[] = []
    for (const album of galleryAlbums) {
      for (const src of [album.cover, ...(album.images || [])]) {
        if (src && !seen.has(src)) {
          seen.add(src)
          out.push({ src, title: album.title })
        }
      }
    }

    // If the gallery albums are still loading, empty, or too small, keep the homepage
    // preview alive with real service media so the section never appears blank.
    if (out.length < 8) {
      for (const product of products) {
        for (const src of [product.heroImage, ...(product.gallery || [])]) {
          if (src && !seen.has(src)) {
            seen.add(src)
            out.push({ src, title: product.name })
          }
          if (out.length >= 16) break
        }
        if (out.length >= 16) break
      }
    }

    return out.slice(0, 16).map((shot, index) => ({
      id: `${shot.src}-${index}`,
      title: shot.title || 'Gallery highlight',
      url: shot.src,
      span: tilePattern[index % tilePattern.length],
    }))
  }, [galleryAlbums, products])

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

      <BentoGallery imageItems={shots} eager />

      <div className="site-container-wide">
        <ViewAllButton to="/gallery" onMouseEnter={() => preloadRoute('/gallery')}>
          View full gallery
        </ViewAllButton>
      </div>
    </section>
  )
}
