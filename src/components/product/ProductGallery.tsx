import { useState } from 'react'
import { ChevronLeft, ChevronRight, Play, Expand } from 'lucide-react'
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
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  }

  return (
    <div className="space-y-3">
      {/* ── Main viewer ── */}
      <div
        className={`group relative overflow-hidden rounded-[22px] ${
          isDark
            ? 'bg-[linear-gradient(180deg,rgba(12,10,28,0.94),rgba(8,8,22,0.90))] border border-white/[0.08] shadow-[0_32px_64px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.04)]'
            : 'bg-slate-100 border border-slate-200/70 shadow-[0_20px_48px_rgba(124,58,237,0.07)]'
        }`}
        style={{ aspectRatio: '16/10' }}
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
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
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
              {/* Live badge */}
              <div
                className={`absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.16em] backdrop-blur-md ${
                  isDark
                    ? 'border border-white/12 bg-black/55 text-white/85'
                    : 'border border-white/70 bg-white/80 text-gray-700'
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
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              {images[activeImageIndex] && (
                <FramedImage
                  media={images[activeImageIndex]}
                  alt={`${name} — photo ${activeImageIndex + 1}`}
                  loading="eager"
                  fetchPriority="high"
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

        {/* Bottom vignette */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Navigation arrows */}
        {totalItems > 1 && (
          <>
            <button
              onClick={() => navigate(active - 1)}
              disabled={active === 0}
              aria-label="Previous image"
              className={`absolute left-3.5 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 ${
                active === 0
                  ? 'pointer-events-none opacity-0'
                  : isDark
                    ? 'border-white/18 bg-black/55 text-white shadow-lg opacity-0 hover:border-white/32 hover:bg-black/70 group-hover:opacity-100'
                    : 'border-white/80 bg-white/80 text-slate-700 shadow-md opacity-0 hover:bg-white group-hover:opacity-100'
              }`}
            >
              <ChevronLeft size={17} strokeWidth={2.2} />
            </button>
            <button
              onClick={() => navigate(active + 1)}
              disabled={active === totalItems - 1}
              aria-label="Next image"
              className={`absolute right-3.5 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-xl transition-all duration-300 ${
                active === totalItems - 1
                  ? 'pointer-events-none opacity-0'
                  : isDark
                    ? 'border-white/18 bg-black/55 text-white shadow-lg opacity-0 hover:border-white/32 hover:bg-black/70 group-hover:opacity-100'
                    : 'border-white/80 bg-white/80 text-slate-700 shadow-md opacity-0 hover:bg-white group-hover:opacity-100'
              }`}
            >
              <ChevronRight size={17} strokeWidth={2.2} />
            </button>
          </>
        )}

        {/* Bottom bar: counter + dots */}
        {totalItems > 1 && (
          <div className="absolute inset-x-0 bottom-3.5 z-20 flex items-center justify-between px-4">
            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: Math.min(totalItems, 8) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => navigate(i)}
                  aria-label={`View item ${i + 1}`}
                  className={`rounded-full transition-all duration-300 ${
                    i === active
                      ? 'w-5 h-1.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                      : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/65'
                  }`}
                />
              ))}
              {totalItems > 8 && (
                <span className="text-[9px] text-white/50 ml-1">+{totalItems - 8}</span>
              )}
            </div>

            {/* Counter */}
            {!isVideoActive && (
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-semibold backdrop-blur-xl ${
                  isDark
                    ? 'border border-white/14 bg-black/52 text-white/80'
                    : 'border border-white/70 bg-white/75 text-gray-700'
                }`}
              >
                <Expand size={10} strokeWidth={2.5} className="opacity-70" />
                {activeImageIndex + 1} / {images.length}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {totalItems > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {hasVideo && (
            <button
              onClick={() => navigate(0)}
              aria-label="Play video"
              className={`relative h-[58px] w-[82px] shrink-0 overflow-hidden rounded-[13px] transition-all duration-250 ${
                active === 0
                  ? isDark
                    ? 'ring-2 ring-violet-400/70 shadow-[0_0_16px_rgba(124,58,237,0.4)] opacity-100 scale-[1.02]'
                    : 'ring-2 ring-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.28)] opacity-100 scale-[1.02]'
                  : isDark
                    ? 'opacity-45 hover:opacity-78 hover:ring-1 hover:ring-white/22'
                    : 'opacity-55 hover:opacity-88 hover:ring-1 hover:ring-violet-300'
              }`}
            >
              <FramedVideo
                media={videoUrl}
                className="h-full w-full object-cover"
                fallbackTransform={{ fit: 'cover' }}
                muted
                preload="metadata"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/38">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/92 shadow">
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
                className={`relative h-[58px] w-[82px] shrink-0 overflow-hidden rounded-[13px] transition-all duration-250 ${
                  isActive
                    ? isDark
                      ? 'ring-2 ring-violet-400/70 shadow-[0_0_16px_rgba(124,58,237,0.4)] opacity-100 scale-[1.02]'
                      : 'ring-2 ring-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.28)] opacity-100 scale-[1.02]'
                    : isDark
                      ? 'opacity-45 hover:opacity-78 hover:ring-1 hover:ring-white/22'
                      : 'opacity-55 hover:opacity-88 hover:ring-1 hover:ring-violet-300'
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
