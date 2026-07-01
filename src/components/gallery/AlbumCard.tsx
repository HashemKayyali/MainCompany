import { memo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import type { GalleryAlbum } from '../../data/gallery'
import FramedImage from '../ui/FramedImage'
import { useSpotlight, SpotlightOverlay } from '../ui/spotlight-card'

const AlbumCard = memo(function AlbumCard({ album, onClick }: { album: GalleryAlbum; onClick: () => void }) {
  const { isDark } = useTheme()
  const spotlight = useSpotlight()
  return (
    <button onClick={onClick} aria-label={`View album: ${album.title}`} {...spotlight.handlers} className={`group relative w-full overflow-hidden rounded-[18px] text-left transition-all hover:-translate-y-1 ${isDark ? 'border border-purple-500/18 bg-purple-500/[0.05] hover:border-prism-violet/28' : 'border border-gray-200 bg-white hover:border-violet-300 shadow-sm'}`}>
      <SpotlightOverlay ref={spotlight.overlayRef} color={isDark ? 'rgba(139,92,246,0.10)' : 'rgba(124,58,237,0.07)'} size={200} />
      <div className="aspect-video overflow-hidden bg-gray-800"><FramedImage media={album.cover} alt={album.title} width={800} height={450} loading="lazy" sizes="(max-width: 640px) calc(100vw - 32px), (max-width: 1024px) calc(50vw - 24px), calc(33vw - 20px)" className="h-full w-full group-hover:scale-105 transition-transform duration-700" fallbackTransform={{ fit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>
      <div className="p-3"><h3 className={`font-sans text-[0.92rem] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{album.title}</h3><p className={`mt-1 text-[10px] ${isDark ? 'text-purple-300/76' : 'text-gray-400'}`}>{album.images.length} photos</p></div>
    </button>
  )
})

export default AlbumCard
