import { useState } from 'react'
import { motion } from 'framer-motion'
import { galleryAlbums, galleryCategories, type GalleryAlbum } from '../data/gallery'
import { useTheme } from '../contexts/ThemeContext'
import GalleryGrid from '../components/gallery/GalleryGrid'
import Lightbox from '../components/gallery/Lightbox'
import Chip from '../components/ui/Chip'
export default function GalleryPage() {
  const { isDark } = useTheme(); const [cat, setCat] = useState('All'); const [album, setAlbum] = useState<GalleryAlbum | null>(null)
  const filtered = cat === 'All' ? galleryAlbums : galleryAlbums.filter(a => a.category === cat)
  return (<section className="pt-32 pb-24"><div className="max-w-7xl mx-auto px-6">
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-12"><span className="section-label">// Visual Story</span><h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>Event <span className="text-glow">Gallery</span></h1></motion.div>
    <div className="flex flex-wrap gap-2 mb-10">{galleryCategories.map(c => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
    <GalleryGrid albums={filtered} onAlbumClick={a => setAlbum(a)} />
    {album && <Lightbox images={album.images} open={!!album} onClose={() => setAlbum(null)} />}
  </div></section>)
}
