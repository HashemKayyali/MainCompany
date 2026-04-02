import { motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import type { GalleryAlbum } from '../../data/gallery'
import FramedImage from '../ui/FramedImage'

export default function GalleryGrid({
  albums,
  onAlbumClick,
}: {
  albums: GalleryAlbum[]
  onAlbumClick: (a: GalleryAlbum) => void
}) {
  const { isDark } = useTheme()

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {albums.map((album, i) => (
        <motion.div
          key={album.slug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
        >
          <button
            onClick={() => onAlbumClick(album)}
            aria-label={`View album: ${album.title}`}
            className={`group w-full overflow-hidden rounded-[16px] text-left transition-all hover:-translate-y-0.5 ${
              isDark
                ? 'border border-purple-500/20 bg-purple-500/[0.06] hover:border-prism-violet/30'
                : 'border border-gray-200 bg-white shadow-sm hover:border-violet-300'
            }`}
          >
            <div className="aspect-[16/10] overflow-hidden">
              <FramedImage
                media={album.cover}
                alt={album.title}
                loading="lazy"
                className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                fallbackTransform={{ fit: 'cover' }}
                onError={e => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>
            <div className="p-2.5">
              <h3 className={`font-display text-[0.88rem] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{album.title}</h3>
              <p className={`mt-0.5 text-[10px] ${isDark ? 'text-purple-300/80' : 'text-gray-400'}`}>{album.images.length} photos</p>
            </div>
          </button>
        </motion.div>
      ))}
    </div>
  )
}
