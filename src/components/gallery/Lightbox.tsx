import { useState, useEffect, useCallback } from 'react'

export default function Lightbox({ images, open, onClose }: { images: string[]; initialIndex?: number; open: boolean; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const next = useCallback(() => setIdx(i => (i + 1) % images.length), [images.length])
  const prev = useCallback(() => setIdx(i => (i - 1 + images.length) % images.length), [images.length])

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
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center z-10"
        aria-label="Previous image"
      >
        &#8249;
      </button>

      <img
        src={images[idx]}
        alt={`Gallery photo ${idx + 1} of ${images.length}`}
        loading="lazy"
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        onClick={e => e.stopPropagation()}
      />

      <button
        onClick={e => { e.stopPropagation(); next() }}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center z-10"
        aria-label="Next image"
      >
        &#8250;
      </button>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center z-10"
        aria-label="Close lightbox"
      >
        &#x2715;
      </button>

      <div className="absolute bottom-4 text-purple-200/80 text-sm font-mono" aria-live="polite">
        {idx + 1} / {images.length}
      </div>
    </div>
  )
}
