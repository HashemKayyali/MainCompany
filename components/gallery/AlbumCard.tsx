import { useTheme } from '../../contexts/ThemeContext'
import type { GalleryAlbum } from '../../data/gallery'
export default function AlbumCard({ album, onClick }: { album: GalleryAlbum; onClick: () => void }) {
  const { isDark } = useTheme()
  return (
    <button onClick={onClick} aria-label={`View album: ${album.title}`} className={`group text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-1 w-full ${isDark ? 'bg-purple-500/[0.06] border border-purple-500/20 hover:border-prism-violet/30' : 'bg-white border border-gray-200 hover:border-violet-300 shadow-sm'}`}>
      <div className="aspect-video overflow-hidden bg-gray-800"><img src={album.cover} alt={album.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>
      <div className="p-4"><h3 className={`font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{album.title}</h3><p className={`text-xs mt-1 ${isDark ? 'text-purple-300/80' : 'text-gray-400'}`}>{album.images.length} photos</p></div>
    </button>
  )
}
