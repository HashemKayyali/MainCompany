import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, ZoomIn } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
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
  const [direction, setDirection] = useState(1)

  const isVideoActive = hasVideo && active === 0
  const activeImageIndex = hasVideo ? active - 1 : active

  const navigate = (next: number) => {
    const clamped = Math.max(0, Math.min(next, totalItems - 1))
    setDirection(next > active ? 1 : -1)
    setActive(clamped)
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 24 : -24 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -24 : 24 }),
  }

  return (
    <div className="space-y-3">
      {/* Main viewer */}
      <div
        className={`group relative aspect-[4/3] overflow-hidden rounded-[20px] ${
          isDark
            ? 'bg-[linear-gradient(180deg,rgba(12,10,28,0.92),rgba(8,8,20,0.88))] border border-white/[0.07]'
            : 'bg-slate-100 border border-slate-200/60'
        }`}
      >
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {isVideoActive ? (
            <motion.div
              key="video"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <FramedVideo
                media={videoUrl}
                className="h-full w-full object-cover"
                fallbackTransform={{ fit: 'cover' }}
                autoPlay
                muted
                loop
                playsInline
              />
              {/* Playing badge */}
              <div
                className={`absolute left-3 top-3 z-20 inline-flex min-h-[28px] items-center gap-1.5 rounded-full px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.16em] backdrop-blur-md ${
                  isDark
                    ? 'border border-white/12 bg-black/55 text-white/80'
                    : 'border border-white/60 bg-white/70 text-gray-700'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
                Live Preview
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`img-${activeImageIndex}`}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {images[activeImageIndex] && (
                <FramedImage
                  media={images[activeImageIndex]}
                  alt={`${name} photo ${activeImageIndex + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                  fallbackTransform={{ fit: 'cover' }}
                  onError={e => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subtle bottom vignette */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Navigation arrows (visible on hover or when multiple items) */}
        {totalItems > 1 && (
          <>
            <button
              onClick={() => navigate(active - 1)}
              disabled={active === 0}
              className={`absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 ${
                active === 0
                  ? 'pointer-events-none opacity-0'
                  : isDark
                    ? 'border-white/16 bg-black/50 text-white opacity-0 hover:border-white/28 hover:bg-black/65 group-hover:opacity-100'
                    : 'border-white/70 bg-white/70 text-slate-700 opacity-0 hover:bg-white group-hover:opacity-100'
              }`}
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => navigate(active + 1)}
              disabled={active === totalItems - 1}
              className={`absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-200 ${
                active === totalItems - 1
                  ? 'pointer-events-none opacity-0'
                  : isDark
                    ? 'border-white/16 bg-black/50 text-white opacity-0 hover:border-white/28 hover:bg-black/65 group-hover:opacity-100'
                    : 'border-white/70 bg-white/70 text-slate-700 opacity-0 hover:bg-white group-hover:opacity-100'
              }`}
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Image counter */}
        {totalItems > 1 && !isVideoActive && (
          <div
            className={`absolute bottom-3 right-3 z-20 rounded-full px-2.5 py-1 text-[10px] font-semibold backdrop-blur-md ${
              isDark
                ? 'border border-white/12 bg-black/50 text-white/75'
                : 'border border-white/60 bg-white/70 text-gray-600'
            }`}
          >
            {active + 1 + (hasVideo ? -1 : 0)}/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {totalItems > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {hasVideo && (
            <button
              onClick={() => navigate(0)}
              aria-label="Play video"
              className={`relative h-[52px] w-[72px] shrink-0 overflow-hidden rounded-[12px] border-2 transition-all duration-200 ${
                active === 0
                  ? isDark
                    ? 'border-violet-400/70 shadow-[0_0_14px_rgba(124,58,237,0.4)] opacity-100'
                    : 'border-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.25)] opacity-100'
                  : isDark
                    ? 'border-white/12 opacity-55 hover:opacity-85 hover:border-white/22'
                    : 'border-slate-200 opacity-60 hover:opacity-90 hover:border-violet-300'
              }`}
            >
              <FramedVideo
                media={videoUrl}
                className="h-full w-full object-cover"
                fallbackTransform={{ fit: 'cover' }}
                muted
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90">
                  <Play size={10} className="text-slate-900 ml-0.5" fill="currentColor" strokeWidth={0} />
                </div>
              </div>
            </button>
          )}

          {images.map((img, i) => {
            const itemIndex = hasVideo ? i + 1 : i
            const isActive = active === itemIndex

            return (
              <button
                key={i}
                onClick={() => navigate(itemIndex)}
                aria-label={`View photo ${i + 1}`}
                className={`relative h-[52px] w-[72px] shrink-0 overflow-hidden rounded-[12px] border-2 transition-all duration-200 ${
                  isActive
                    ? isDark
                      ? 'border-violet-400/70 shadow-[0_0_14px_rgba(124,58,237,0.4)] opacity-100'
                      : 'border-violet-500 shadow-[0_0_10px_rgba(124,58,237,0.25)] opacity-100'
                    : isDark
                      ? 'border-white/12 opacity-55 hover:opacity-85 hover:border-white/22'
                      : 'border-slate-200 opacity-60 hover:opacity-90 hover:border-violet-300'
                }`}
              >
                <FramedImage
                  media={img}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                  fallbackTransform={{ fit: 'cover' }}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
