import { useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { cn } from '../../utils/cn'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'

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
  const ref = useRef<HTMLButtonElement>(null)
  const motionEnabled = useMotionEnabled()
  const isInView = useInView(ref, { once: true, margin: '0px 0px -8% 0px' })
  const [loaded, setLoaded] = useState(false)

  // Reveal as soon as it loads when motion is disabled; otherwise wait until
  // it scrolls into view so the gallery fades in progressively.
  const show = loaded && (!motionEnabled || isInView)

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={alt || `Open image ${index + 1}`}
      className="group relative mb-4 block w-full break-inside-avoid overflow-hidden rounded-[16px] border border-violet-200/60 bg-violet-50 outline-none transition-shadow duration-300 hover:shadow-[0_24px_50px_-26px_rgba(89,23,196,0.5)] focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
    >
      <img
        src={src}
        alt={alt || ''}
        width={900}
        height={675}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-auto w-full object-cover transition-all duration-700 ease-out',
          show ? 'scale-100 opacity-100 blur-0' : 'scale-[1.03] opacity-0 blur-[6px]'
        )}
      />
      {/* hover overlay */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(13,4,36,0.45) 100%)' }}
        aria-hidden="true"
      />
    </button>
  )
}

/**
 * Responsive masonry image gallery with a progressive scroll fade-in.
 * Pass a fresh `key` (e.g. the album slug) when the image set changes so the
 * reveal animation replays for the new images.
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
  if (images.length === 0) return null

  return (
    <div className={cn('columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4', className)}>
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
