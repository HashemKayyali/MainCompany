'use client'

import { useState } from 'react'
import { SmartImage } from '@/components/ui/SmartImage'

/**
 * CAT-008 — product detail gallery (client island). Faithful port of the Vite
 * ProductDetails media column: a large main image plus a thumbnail strip with a
 * selected state; clicking a thumbnail switches the main image. Keyboard
 * accessible; RTL-safe (logical props). The first image is the LCP candidate.
 */
export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0)
  const list = images.length > 0 ? images : ['']
  const current = list[Math.min(active, list.length - 1)] ?? ''

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink-50 shadow-[0_20px_50px_-30px_rgba(89,23,196,0.35)]">
        <SmartImage
          key={current}
          media={current}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={active === 0}
          fetchPriority={active === 0 ? 'high' : 'auto'}
          className="object-cover"
        />
      </div>

      {list.length > 1 ? (
        <ul className="mt-3 grid grid-cols-5 gap-2" role="tablist" aria-label={alt}>
          {list.slice(0, 10).map((img, i) => {
            const selected = i === active
            return (
              <li key={`${img}-${i}`}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={`${alt} ${i + 1}`}
                  onClick={() => setActive(i)}
                  className={[
                    'relative block aspect-square w-full overflow-hidden rounded-lg bg-ink-50 outline-none transition',
                    selected
                      ? 'ring-2 ring-brand-600 ring-offset-2'
                      : 'opacity-80 hover:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-400',
                  ].join(' ')}
                >
                  <SmartImage media={img} alt="" fill sizes="120px" className="object-cover" />
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
