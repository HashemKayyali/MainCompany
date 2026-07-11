'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'

/**
 * CAT-014/015 — progressive gallery grid + lightbox island.
 * - Renders in batches of ~12 as the sentinel enters view (IntersectionObserver),
 *   so the first viewport is fast and nothing reshuffles when more data mounts
 *   (STABLE KEYS = the image URL; order is fixed by the server list).
 * - `content-visibility:auto` on each tile skips off-screen render cost.
 * - Lightbox opens on click, traps focus, closes on Escape/backdrop, and
 *   prefetches ±1 neighbours (IMG-011). Arrow keys respect document direction
 *   (RTL: Left = next). No layout jump — ratio boxes reserve space.
 */

const BATCH = 12

export type GalleryImage = { url: string; alt: string }

export function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [visible, setVisible] = useState(Math.min(BATCH, images.length))
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)

  useEffect(() => {
    if (visible >= images.length) return
    const el = sentinelRef.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(images.length)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible((v) => Math.min(v + BATCH, images.length))
        }
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [visible, images.length])

  const rtl = typeof document !== 'undefined' && document.dir === 'rtl'
  const move = useCallback(
    (delta: number) => setLightbox((i) => (i === null ? i : (i + delta + images.length) % images.length)),
    [images.length]
  )

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null)
      else if (e.key === 'ArrowRight') move(rtl ? -1 : 1)
      else if (e.key === 'ArrowLeft') move(rtl ? 1 : -1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [lightbox, move, rtl])

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.slice(0, visible).map((img, i) => (
          <li key={img.url} style={{ contentVisibility: 'auto', containIntrinsicSize: '260px' }}>
            <button
              type="button"
              onClick={() => setLightbox(i)}
              className="relative block aspect-square w-full overflow-hidden rounded-xl bg-ink-50"
              aria-label={img.alt}
            >
              <SmartImage
                media={img.url}
                alt={img.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition duration-300 hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>
      {visible < images.length ? <div ref={sentinelRef} className="h-10" aria-hidden /> : null}

      {lightbox !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightbox(null)}
        >
          {/* prefetch ±1 neighbours (hidden) */}
          {[lightbox - 1, lightbox + 1].map((n) => {
            const idx = (n + images.length) % images.length
            const neighbour = images[idx]
            return neighbour ? (
              <link key={idx} rel="prefetch" as="image" href={neighbour.url} />
            ) : null
          })}
          <div className="relative max-h-[85vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <SmartImage
              media={images[lightbox]!.url}
              alt={images[lightbox]!.alt}
              width={1600}
              height={1200}
              className="max-h-[85vh] w-auto rounded-lg object-contain"
              priority
            />
            <button
              type="button"
              onClick={() => setLightbox(null)}
              autoFocus
              className="absolute end-2 top-2 rounded-full bg-white/90 px-3 py-1 text-sm font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      ) : null}
    </>
  )
}
