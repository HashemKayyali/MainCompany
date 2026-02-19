import { useState } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../contexts/DataContext'
import { galleryAlbums as staticAlbums, type GalleryAlbum } from '../data/gallery'
import { useTheme } from '../contexts/ThemeContext'
import GalleryGrid from '../components/gallery/GalleryGrid'
import Lightbox from '../components/gallery/Lightbox'
import Chip from '../components/ui/Chip'

export default function GalleryPage() {
  const { galleryAlbums } = useData()
  const { isDark } = useTheme()
  const [cat, setCat] = useState('All')
  const [album, setAlbum] = useState<GalleryAlbum | null>(null)

  // Use DB albums if available, fallback to static
  const albums = galleryAlbums.length > 0 ? galleryAlbums : staticAlbums
  const categories = ['All', ...Array.from(new Set(albums.map(a => a.category).filter(Boolean)))]
  const filtered = cat === 'All' ? albums : albums.filter(a => a.category === cat)

  return (
    <section className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <span className="section-label">// Visual Story</span>
          <h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
            Event <span className="text-glow">Gallery</span>
          </h1>
        </motion.div>
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map(c => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>
          ))}
        </div>
        <GalleryGrid albums={filtered} onAlbumClick={a => setAlbum(a)} />
        {filtered.length === 0 && (
          <div className={`text-center py-20 font-display text-lg ${isDark ? 'text-purple-300/50' : 'text-gray-300'}`}>
            No albums match this filter.
          </div>
        )}
        {album && <Lightbox images={album.images} open={!!album} onClose={() => setAlbum(null)} />}
      </div>
    </section>
  )
}
