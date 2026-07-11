import { Link } from '@/i18n/navigation'
import { SmartImage } from '@/components/ui/SmartImage'

/**
 * CAT-025 — category grid card (light theme port of the Vite CategoryTileView +
 * CategoryGridCard). The Next public app is light-only, so only the light branch
 * is ported. Server component; image via next/image (SmartImage / Cloudinary).
 */
export type CategoryGridItem = {
  name: string
  slug: string
  description?: string
  image?: string
  count: number
}

export function CategoryGridCard({
  category,
  serviceCount,
  imageLoading = 'lazy',
  exploreLabel,
}: {
  category: CategoryGridItem
  /** already-localized "N Services" string */
  serviceCount: string
  imageLoading?: 'eager' | 'lazy'
  exploreLabel: string
}) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      aria-label={exploreLabel}
      className="block h-full w-full cursor-pointer text-start outline-none transition-transform duration-[400ms] hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f3ff]"
    >
      <div className="group relative flex h-full flex-col overflow-hidden rounded-[18px] border border-black/[0.16] bg-white shadow-[0_24px_58px_-34px_rgba(15,23,42,0.48),0_10px_24px_-17px_rgba(15,23,42,0.22),0_0_0_1px_rgba(255,255,255,0.88)] transition-all duration-[400ms] hover:border-black/[0.26] hover:shadow-[0_28px_64px_-30px_rgba(15,23,42,0.48),0_12px_28px_-18px_rgba(15,23,42,0.26),0_0_0_1px_rgba(255,255,255,0.92)]">
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden">
          {category.image ? (
            <div className="absolute inset-0 scale-100 transition-transform duration-700 ease-out group-hover:scale-[1.06]">
              <SmartImage
                media={category.image}
                alt={category.name}
                fill
                loading={imageLoading}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="h-full w-full select-none object-cover object-center"
              />
            </div>
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]"
              style={{
                background:
                  'linear-gradient(148deg, rgba(124,58,237,0.16), rgba(255,255,255,0.94) 55%, rgba(34,211,238,0.10))',
              }}
            />
          )}
        </div>

        <div
          className="relative z-10 h-px w-full overflow-visible bg-black/[0.10] shadow-[0_6px_12px_-5px_rgba(15,23,42,0.34)] after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-2 after:bg-gradient-to-b after:from-black/[0.07] after:to-transparent"
          aria-hidden="true"
        />

        <div className="flex flex-1 flex-col bg-white px-3.5 py-3 transition-colors duration-300">
          <div className="mb-0.5 text-[9px] font-bold uppercase tracking-[0.20em] text-violet-500/60 transition-colors duration-300 group-hover:text-violet-500/85">
            {serviceCount}
          </div>
          <h3
            dir="auto"
            className="line-clamp-2 min-h-[2.5em] font-sans text-[0.9rem] font-bold leading-tight tracking-[-0.028em] text-slate-900 sm:text-[1.16rem]"
          >
            {category.name}
          </h3>
          {category.description && (
            <p
              dir="auto"
              className="mt-1.5 line-clamp-2 text-[11.5px] font-medium leading-snug text-slate-500"
            >
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
