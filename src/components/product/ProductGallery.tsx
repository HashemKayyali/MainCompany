import { useState } from 'react'
import { Play } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import FramedImage from '../ui/FramedImage'
import FramedVideo from '../ui/FramedVideo'

interface Props {
  images: string[]
  name: string
  videoUrl?: string
}

export default function ProductGallery({ images, name, videoUrl }: Props) {
  const { isDark } = useTheme()

  const hasVideo = !!videoUrl
  const totalItems = (hasVideo ? 1 : 0) + images.length
  const [active, setActive] = useState(0)

  const isVideoActive = hasVideo && active === 0
  const activeImageIndex = hasVideo ? active - 1 : active

  return (
    <div>
      <div className={`relative aspect-video overflow-hidden rounded-[18px] ${isDark ? 'bg-void-800' : 'bg-gray-100'}`}>
        {hasVideo && (
          <FramedVideo
            media={videoUrl}
            className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${
              isVideoActive ? 'z-10 opacity-100' : 'z-0 opacity-0'
            }`}
            fallbackTransform={{ fit: 'cover' }}
            autoPlay
            muted
            loop
            playsInline
          />
        )}

        {!isVideoActive && images[activeImageIndex] && (
          <FramedImage
            media={images[activeImageIndex]}
            alt={`${name} photo ${activeImageIndex + 1}`}
            loading="lazy"
            className="h-full w-full"
            fallbackTransform={{ fit: 'contain' }}
            onError={e => {
              ;(e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        )}

        {isVideoActive && (
          <div
            className={`absolute left-2.5 top-2.5 z-20 inline-flex items-center gap-1.5 rounded-full px-2.25 py-0.75 text-[9px] font-semibold uppercase tracking-wider backdrop-blur-md ${
              isDark ? 'border border-white/10 bg-black/50 text-white/80' : 'border border-gray-200 bg-white/70 text-gray-700'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
            Playing
          </div>
        )}
      </div>

      {totalItems > 1 && (
        <div className="mt-2.5 flex gap-1.5 overflow-x-auto pb-1">
          {hasVideo && (
            <button
              onClick={() => setActive(0)}
              aria-label="Play video"
              className={`relative h-11 w-14 shrink-0 overflow-hidden rounded-[12px] border-2 transition-all ${
                active === 0
                  ? 'border-prism-violet/50 opacity-100'
                  : isDark
                    ? 'border-purple-500/25 opacity-60 hover:opacity-90'
                    : 'border-gray-200 opacity-70 hover:opacity-100'
              }`}
            >
              <FramedVideo media={videoUrl} className="h-full w-full" fallbackTransform={{ fit: 'cover' }} muted preload="metadata" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Play size={11} className="text-white" fill="white" strokeWidth={0} />
              </div>
            </button>
          )}

          {images.map((img, i) => {
            const itemIndex = hasVideo ? i + 1 : i
            return (
              <button
                key={i}
                onClick={() => setActive(itemIndex)}
                aria-label={`View photo ${i + 1}`}
                className={`h-11 w-14 shrink-0 overflow-hidden rounded-[12px] border-2 transition-all ${
                  active === itemIndex
                    ? 'border-prism-violet/50 opacity-100'
                    : isDark
                      ? 'border-purple-500/25 opacity-60 hover:opacity-90'
                      : 'border-gray-200 opacity-70 hover:opacity-100'
                }`}
              >
                <FramedImage media={img} alt="" loading="lazy" className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
