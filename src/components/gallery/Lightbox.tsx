import { useState, useEffect, useCallback } from 'react'

export default function Lightbox({ images, open, onClose, initialIndex = 0 }: { images: string[]; initialIndex?: number; open: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(initialIndex)
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])

  useEffect(() => {
    if (open) setIdx(Math.min(Math.max(initialIndex, 0), Math.max(images.length - 1, 0)))
  }, [open, initialIndex, images.length])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    if (open) window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [open, onClose, next, prev])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Image gallery — photo ${idx + 1} of ${images.length}`}
    >
      <button
        onClick={e => { e.stopPropagation(); prev() }}
        className="absolute left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/22 sm:left-4"
        style={{ marginTop: 'calc(env(safe-area-inset-top) * 0.25)' }}
        aria-label="Previous image"
      >
        &#8249;
      </button>

      <img
        src={images[idx]}
        alt={`Gallery photo ${idx + 1} of ${images.length}`}
        width={1600}
        height={1200}
        loading="eager"
        decoding="async"
        sizes="100vw"
        className="max-h-[82vh] max-w-[92vw] rounded-[18px] object-contain sm:max-h-[85vh] sm:max-w-[90vw]"
        onClick={e => e.stopPropagation()}
      />

      <button
        onClick={e => { e.stopPropagation(); next() }}
        className="absolute right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/22 sm:right-4"
        style={{ marginTop: 'calc(env(safe-area-inset-top) * 0.25)' }}
        aria-label="Next image"
      >
        &#8250;
      </button>

      <button
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/12 text-white hover:bg-white/22 sm:right-4 sm:top-4"
        style={{ top: 'max(0.75rem, env(safe-area-inset-top))' }}
        aria-label="Close lightbox"
      >
        &#x2715;
      </button>

      <div className="absolute bottom-3 rounded-full bg-black/28 px-3 py-1.5 text-[12px] font-mono text-purple-200/80 sm:bottom-4" style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }} aria-live="polite">
        {idx + 1} / {images.length}
      </div>
    </div>
  )
}
