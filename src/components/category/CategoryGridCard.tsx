import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import FramedImage from '../ui/FramedImage'
import { preloadRoute } from '../../utils/route-preload'

export type CategoryGridCardData = {
  name: string
  slug: string
  icon?: string
  image?: string
  count: number
}

/**
 * Shared category card — used on the homepage "Browse by category" section
 * and the /categories index page. The artwork sits "contained" on a soft
 * brand gradient so logo-style category images look intentional, with a clean
 * info footer beneath.
 */
export default function CategoryGridCard({
  category,
  imageLoading = 'lazy',
}: {
  category: CategoryGridCardData
  imageLoading?: 'eager' | 'lazy'
}) {
  const href = `/categories/${encodeURIComponent(category.slug)}`
  const countLabel = category.count > 0 ? `${category.count} service${category.count === 1 ? '' : 's'}` : 'New'

  return (
    <Link
      to={href}
      onMouseEnter={() => preloadRoute(href)}
      onFocus={() => preloadRoute(href)}
      aria-label={`Explore ${category.name}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-violet-200/70 bg-white outline-none transition-all duration-400 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_28px_56px_-28px_rgba(89,23,196,0.45)] focus-visible:ring-2 focus-visible:ring-violet-400"
      style={{ boxShadow: '0 1px 2px rgba(20,8,50,0.04), 0 14px 34px -24px rgba(89,23,196,0.22)' }}
    >
      {/* gradient ring sheen on hover */}
      <span
        className="pointer-events-none absolute inset-0 z-10 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: 'inset 0 0 0 1.5px rgba(168,85,247,0.55)' }}
        aria-hidden="true"
      />

      {/* Artwork */}
      <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-white to-fuchsia-50/60 p-5">
        <span
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 60% at 50% 30%, rgba(168,85,247,0.10) 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        {category.image ? (
          <FramedImage
            media={category.image}
            alt={category.name}
            width={1000}
            height={800}
            loading={imageLoading}
            fetchPriority="auto"
            sizes="(max-width: 640px) calc(50vw - 20px), (max-width: 1024px) calc(33vw - 24px), 20vw"
            fallbackTransform={{ fit: 'contain' }}
            style={{ objectFit: 'contain', objectPosition: 'center' }}
            className="relative h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.06]"
          />
        ) : (
          <span className="relative text-5xl">{category.icon || '✦'}</span>
        )}

        <span className="absolute left-3 top-3 inline-flex items-center rounded-full border border-violet-200/80 bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-violet-700 backdrop-blur-sm">
          {countLabel}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-violet-100 px-4 py-3.5">
        <span className="min-w-0">
          <span className="block truncate font-sans text-[1.02rem] font-bold tracking-[-0.02em] text-ink-900 sm:text-[1.08rem]">
            {category.name}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-violet-500">Explore</span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-fuchsia-500 group-hover:text-white">
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.4} />
        </span>
      </div>
    </Link>
  )
}
