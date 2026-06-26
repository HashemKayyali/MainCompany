import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ImageIcon } from 'lucide-react'
import { useGalleryData, useProductsData } from '../../contexts/DataContext'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import FramedImage from '../ui/FramedImage'
import SectionHeader from './SectionHeader'

export default function EventInspirationGallery() {
  const { galleryAlbums } = useGalleryData()
  const { products } = useProductsData()
  const headerReveal = useReveal({ distance: 14, duration: 0.4 })
  const { containerProps, itemProps } = useRevealGroup({
    distance: 12,
    duration: 0.34,
    stagger: 0.04,
  })

  const hasAlbums = galleryAlbums.length > 0
  const items = hasAlbums
    ? galleryAlbums.slice(0, 6).map(album => ({
        key: album.slug,
        title: album.title,
        image: album.cover,
        href: '/gallery',
      }))
    : products.slice(0, 6).map(product => ({
        key: product.slug,
        title: product.name,
        image: product.heroImage,
        href: `/products/${product.slug}`,
      }))

  if (items.length === 0) return null

  return (
    <section className="site-section bg-white/60">
      <div className="site-container">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <motion.div {...headerReveal}>
            <SectionHeader
              eyebrow="Gallery"
              title="Event Inspiration Gallery"
              description="Explore setups, product shots, and event ideas to shape your next experience."
            />
          </motion.div>

          <Link
            to="/gallery"
            className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-700 shadow-sm transition-all hover:border-brand-300 hover:text-brand-700 sm:inline-flex"
          >
            View gallery
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>

        <motion.div
          {...containerProps}
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4"
        >
          {items.map(item => (
            <motion.div key={item.key} {...itemProps}>
              <Link
                to={item.href}
                className="group relative block aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              >
                {item.image ? (
                  <FramedImage
                    media={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    fallbackTransform={{ fit: 'cover' }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
                    <ImageIcon className="h-8 w-8" strokeWidth={1.5} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-display text-[1rem] font-bold text-white line-clamp-1">
                    {item.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-700 shadow-sm"
          >
            View gallery
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </section>
  )
}
