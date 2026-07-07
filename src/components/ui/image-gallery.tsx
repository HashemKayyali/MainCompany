import { useEffect } from 'react'
import { cn } from '../../utils/cn'
import FramedImage from './FramedImage'
import { preloadImage, preloadImageWhenIdle } from '../../lib/image-delivery'

export type GalleryImage = { src: string; alt?: string }

function AnimatedImage({
  src,
  alt,
  index,
  onClick,
}: {
  src: string
  alt?: string
  index: number
  onClick?: () => void
}) {
  const preloadFullscreenNow = () => {
    void preloadImage(src, 'fullscreen')
  }

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={preloadFullscreenNow}
      onFocus={preloadFullscreenNow}
      onTouchStart={preloadFullscreenNow}
      aria-label={alt || `Open image ${index + 1}`}
      className={cn(
        'group relative block aspect-[4/5] w-full overflow-hidden rounded-[14px] border border-violet-200/60 bg-violet-50 outline-none',
        'transition-shadow duration-300 hover:shadow-[0_20px_42px_-24px_rgba(89,23,196,0.45)]',
        'focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2',
      )}
    >
      <FramedImage
        media={src}
        preset="thumbnail"
        alt={alt || ''}
        width={480}
        height={600}
        loading={index < 7 ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={index < 2 ? 'high' : 'auto'}
        sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, (max-width: 1279px) 20vw, 14.3vw"
        fallbackTransform={{ fit: 'cover' }}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
      />
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(13,4,36,0.45) 100%)' }}
        aria-hidden="true"
      />
    </button>
  )
}

/**
 * Fast, stable gallery grid.
 *
 * All tiles use the same row height and are rendered in normal row-major grid
 * order. This avoids masonry/multi-column rebalancing, so already-visible
 * photos never jump to another column and desktop columns stay visually even.
 * The first visible row is warmed immediately; the next row is warmed during idle time.
 */
export function ImageGallery({
  images,
  onImageClick,
  className,
}: {
  images: GalleryImage[]
  onImageClick?: (index: number) => void
  className?: string
}) {
  useEffect(() => {
    const uniqueSources = Array.from(
      new Set(images.map(image => image.src).filter(Boolean)),
    )

    // Warm only the first visible row immediately. A second row is queued for
    // idle time; the rest relies on native lazy loading as the user scrolls.
    // This keeps the instant gallery feel without firing hundreds of requests
    // when albums grow large.
    uniqueSources.slice(0, 7).forEach(src => {
      void preloadImage(src, 'thumbnail')
    })
    const cancelIdlePreloads = uniqueSources
      .slice(7, 14)
      .map(src => preloadImageWhenIdle(src, 'thumbnail'))

    return () => cancelIdlePreloads.forEach(cancel => cancel())
  }, [images])

  if (images.length === 0) return null

  return (
    <div
      className={cn(
        'grid grid-cols-2 items-start gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7',
        className,
      )}
    >
      {images.map((image, index) => (
        <AnimatedImage
          key={`${image.src}-${index}`}
          src={image.src}
          alt={image.alt}
          index={index}
          onClick={() => onImageClick?.(index)}
        />
      ))}
    </div>
  )
}

export default ImageGallery
