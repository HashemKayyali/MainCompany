import { useTheme } from '../../contexts/ThemeContext'
import type { GalleryAlbum } from '../../data/gallery'
import FramedImage from '../ui/FramedImage'
export default function AlbumCard({ album, onClick }: { album: GalleryAlbum; onClick: () => void }) {
  const { isDark } = useTheme()
  return (
    <button onClick={onClick} aria-label={`View album: ${album.title}`} className={`group w-full overflow-hidden rounded-[18px] text-left transition-all hover:-translate-y-1 ${isDark ? 'border border-purple-500/18 bg-purple-500/[0.05] hover:border-prism-violet/28' : 'border border-gray-200 bg-white hover:border-violet-300 shadow-sm'}`}>
      <div className="aspect-video overflow-hidden bg-gray-800"><FramedImage media={album.cover} alt={album.title} loading="lazy" className="h-full w-full group-hover:scale-105 transition-transform duration-700" fallbackTransform={{ fit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>
      <div className="p-3"><h3 className={`font-display text-[0.92rem] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{album.title}</h3><p className={`mt-1 text-[10px] ${isDark ? 'text-purple-300/76' : 'text-gray-400'}`}>{album.images.length} photos</p></div>
    </button>
  )
}
