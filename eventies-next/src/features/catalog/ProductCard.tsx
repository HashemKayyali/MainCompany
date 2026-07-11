import { Link } from '@/i18n/navigation'
import { SmartImage } from '@/components/ui/SmartImage'
import type { Product } from '@/shared/types/catalog'

/**
 * CAT-006 — product card (server component). next/image via the Cloudinary
 * loader, `card` grid sizes, explicit ratio box for CLS (IMG-004). Links to
 * the detail page through the locale-aware wrapper.
 */
const CARD_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'

export function ProductCard({ product, featuredLabel }: { product: Product; featuredLabel: string }) {
  const media = product.heroImage || product.gallery?.[0] || ''
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-violet-sm transition hover:-translate-y-0.5 hover:shadow-violet-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-50">
        <SmartImage
          media={media}
          alt={product.name}
          fill
          sizes={CARD_SIZES}
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {product.featured ? (
          <span className="absolute start-2 top-2 rounded-full bg-brand-600 px-2 py-1 text-xs font-medium text-white">
            {featuredLabel}
          </span>
        ) : null}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-ink-900">{product.name}</h3>
        {product.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-sm text-ink-600">{product.shortDescription}</p>
        ) : null}
      </div>
    </Link>
  )
}
