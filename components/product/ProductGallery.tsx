import { useState } from 'react'
import { Play } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

interface Props {
  images: string[]
  name: string
  videoUrl?: string
}

export default function ProductGallery({ images, name, videoUrl }: Props) {
  const { isDark } = useTheme()

  // If video exists, it's "slot 0", images shift by 1
  const hasVideo = !!videoUrl
  const totalItems = (hasVideo ? 1 : 0) + images.length
  const [active, setActive] = useState(0) // 0 = video (if exists), otherwise first image

  const isVideoActive = hasVideo && active === 0
  const activeImageIndex = hasVideo ? active - 1 : active

  return (
    <div>
      {/* ── Main display ── */}
      <div className={`rounded-2xl overflow-hidden aspect-video relative ${isDark ? 'bg-void-800' : 'bg-gray-100'}`}>
        {/* Video */}
        {hasVideo && (
          <video
            src={videoUrl}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isVideoActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            autoPlay
            muted
            loop
            playsInline
          />
        )}

        {/* Image */}
        {!isVideoActive && images[activeImageIndex] && (
          <img
            src={images[activeImageIndex]}
            alt={`${name} — photo ${activeImageIndex + 1}`}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}

        {/* Video playing indicator */}
        {isVideoActive && (
          <div className={`absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider backdrop-blur-md ${
            isDark ? 'bg-black/50 text-white/80 border border-white/10' : 'bg-white/70 text-gray-700 border border-gray-200'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            Playing
          </div>
        )}
      </div>

      {/* ── Thumbnails ── */}
      {totalItems > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {/* Video thumbnail */}
          {hasVideo && (
            <button
              onClick={() => setActive(0)}
              aria-label="Play video"
              className={`relative w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                active === 0
                  ? 'border-prism-violet/50 opacity-100'
                  : isDark ? 'border-purple-500/25 opacity-60 hover:opacity-90' : 'border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <video src={videoUrl} className="w-full h-full object-cover" muted preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play size={12} className="text-white" fill="white" strokeWidth={0} />
              </div>
            </button>
          )}

          {/* Image thumbnails */}
          {images.map((img, i) => {
            const itemIndex = hasVideo ? i + 1 : i
            return (
              <button
                key={i}
                onClick={() => setActive(itemIndex)}
                aria-label={`View photo ${i + 1}`}
                className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  active === itemIndex
                    ? 'border-prism-violet/50 opacity-100'
                    : isDark ? 'border-purple-500/25 opacity-60 hover:opacity-90' : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" loading="lazy" className="w-full h-full object-cover" />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
