import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Play, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { cn } from '../../utils/cn'
import FramedImage from '../ui/FramedImage'
import FramedVideo from '../ui/FramedVideo'

interface Props {
  images: string[]
  name: string
  videoUrl?: string
}

const mobileMainMediaFrame =
  'relative flex h-[clamp(15.75rem,66vw,22.5rem)] w-full items-center justify-center overflow-hidden sm:h-[clamp(17.5rem,54vw,26.5rem)] lg:block lg:h-auto'

const mobileMainMedia =
  'block h-full w-full object-contain lg:h-auto'

const thumbnailMedia =
  'h-full w-full object-contain'

export default function ProductGallery({ images, name, videoUrl }: Props) {
  const { isDark } = useTheme()

  const hasVideo = !!videoUrl
  const totalItems = (hasVideo ? 1 : 0) + images.length
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)
  const [zoomOpen, setZoomOpen] = useState(false)

  const isVideoActive = hasVideo && active === 0
  const activeImageIndex = hasVideo ? active - 1 : active
  const activeImage = !isVideoActive ? images[activeImageIndex] : undefined

  const navigate = (next: number) => {
    const clamped = Math.max(0, Math.min(next, totalItems - 1))
    setDirection(next > active ? 1 : -1)
    setActive(clamped)
  }

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 22 : -22 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -22 : 22 }),
  }

  const zoomOverlay =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {zoomOpen && activeImage && (
              <motion.div
                key="image-zoom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/88 p-4 backdrop-blur-sm sm:p-6"
                onClick={() => setZoomOpen(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] items-center justify-center"
                  onClick={event => event.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setZoomOpen(false)}
                    aria-label="Close enlarged image"
                    className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white shadow-lg transition hover:bg-black/80 sm:right-4 sm:top-4"
                  >
                    <X size={18} strokeWidth={2.3} />
                  </button>
                  <div className="inline-flex max-h-[calc(100dvh-2rem)] max-w-[calc(100vw-2rem)] items-center justify-center overflow-hidden rounded-[20px] border border-white/12 bg-black shadow-[0_28px_80px_-24px_rgba(0,0,0,0.75)]">
                    <FramedImage
                      media={activeImage}
                      alt={`${name} - enlarged photo ${activeImageIndex + 1}`}
                      loading="eager"
                      fetchPriority="high"
                      className="block h-auto max-h-[calc(100dvh-3rem)] w-auto max-w-[calc(100vw-3rem)] object-contain"
                      fallbackTransform={{ fit: 'contain', bgColor: '#000000', bgOpacity: 1 }}
                      style={{ objectFit: 'contain', transform: 'none' }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )
      : null

  return (
    <>
    <div className="grid gap-3 lg:grid-cols-[94px_minmax(0,1fr)] lg:items-start">
      <div
        className={cn(
          'order-2 flex gap-2 overflow-x-auto pb-2 lg:order-1 lg:max-h-[560px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0 lg:pr-1',
          '[scrollbar-width:thin] [scrollbar-color:rgba(124,58,237,0.35)_transparent]',
          '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-2',
          '[&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-300/60'
        )}
        aria-label="Product media thumbnails"
      >
        {hasVideo && (
          <button
            type="button"
            onClick={() => navigate(0)}
            aria-label="Play video"
            className={cn(
              'relative h-[64px] w-[86px] shrink-0 overflow-hidden rounded-[12px] border bg-white transition-all duration-250',
              active === 0
                ? isDark
                  ? 'border-violet-300 shadow-[0_0_0_2px_rgba(167,139,250,0.45)]'
                  : 'border-violet-500 shadow-[0_0_0_2px_rgba(124,58,237,0.18)]'
                : isDark
                  ? 'border-white/[0.10] opacity-65 hover:opacity-95'
                  : 'border-slate-200 opacity-75 hover:border-violet-300 hover:opacity-100'
            )}
          >
            <FramedVideo
              media={videoUrl}
              className="h-full w-full object-cover"
              fallbackTransform={{ fit: 'cover' }}
              muted
              preload="metadata"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/35">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/92 shadow">
                <Play size={10} className="ml-0.5 text-slate-900" fill="currentColor" strokeWidth={0} />
              </div>
            </div>
          </button>
        )}

        {images.map((img, index) => {
          const itemIndex = hasVideo ? index + 1 : index
          const isActive = active === itemIndex

          return (
            <button
              key={`${img}-${index}`}
              type="button"
              onClick={() => navigate(itemIndex)}
              aria-label={`View photo ${index + 1}`}
              className={cn(
                'relative h-[64px] w-[86px] shrink-0 overflow-hidden rounded-[12px] border bg-white transition-all duration-250',
                isActive
                  ? isDark
                    ? 'border-violet-300 shadow-[0_0_0_2px_rgba(167,139,250,0.45)]'
                    : 'border-violet-500 shadow-[0_0_0_2px_rgba(124,58,237,0.18)]'
                  : isDark
                    ? 'border-white/[0.10] opacity-65 hover:opacity-95'
                    : 'border-slate-200 opacity-75 hover:border-violet-300 hover:opacity-100'
              )}
            >
              <FramedImage
                media={img}
                alt=""
                loading="lazy"
                className={thumbnailMedia}
                fallbackTransform={{ fit: 'contain', bgColor: '#ffffff', bgOpacity: 0 }}
                style={{ objectFit: 'contain', transform: 'none' }}
              />
            </button>
          )
        })}
      </div>

      <div
        className={cn(
          'group relative order-1 overflow-hidden rounded-[18px] border lg:order-2',
          isDark
            ? 'border-white/[0.08] bg-white/[0.035] shadow-[0_24px_60px_-42px_rgba(0,0,0,0.8)]'
            : 'border-slate-200/90 bg-white shadow-[0_22px_58px_-44px_rgba(15,23,42,0.44)]'
        )}
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
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className={mobileMainMediaFrame}
            >
              <FramedVideo
                media={videoUrl}
                className={mobileMainMedia}
                fallbackTransform={{ fit: 'contain', bgColor: '#ffffff', bgOpacity: 0 }}
                autoPlay
                muted
                loop
                playsInline
              />
              <div
                className={cn(
                  'absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[9.5px] font-bold uppercase tracking-[0.15em]',
                  isDark
                    ? 'border border-white/12 bg-black/52 text-white/86'
                    : 'border border-slate-200 bg-white/90 text-slate-700 shadow-sm'
                )}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
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
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className={mobileMainMediaFrame}
            >
              {images[activeImageIndex] && (
                <FramedImage
                  media={images[activeImageIndex]}
                  alt={`${name} - photo ${activeImageIndex + 1}`}
                  loading="eager"
                  fetchPriority="high"
                  className={mobileMainMedia}
                  fallbackTransform={{ fit: 'contain', bgColor: '#ffffff', bgOpacity: 0 }}
                  style={{ objectFit: 'contain', transform: 'none' }}
                  onError={event => {
                    ;(event.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {activeImage && (
          <button
            type="button"
            onClick={() => setZoomOpen(true)}
            aria-label="Enlarge image"
            title="Enlarge image"
            className={cn(
              'absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-250',
              isDark
                ? 'border-white/14 bg-black/45 text-white hover:bg-black/60'
                : 'border-slate-200 bg-white/90 text-slate-700 shadow-sm hover:bg-white'
            )}
          >
            <Maximize2 size={15} strokeWidth={2.2} />
          </button>
        )}

        {totalItems > 1 && (
          <div
            className={cn(
              'absolute bottom-3 right-3 z-20 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold',
              isDark
                ? 'border-white/12 bg-black/45 text-white/80'
                : 'border-slate-200 bg-white/90 text-slate-600 shadow-sm'
            )}
          >
            {active + 1} / {totalItems}
          </div>
        )}

      </div>
    </div>
    {zoomOverlay}
    </>
  )
}
