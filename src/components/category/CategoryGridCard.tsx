import { Link } from 'react-router-dom'
import CategoryTileView from '../home/CategoryTileView'
import { preloadRoute } from '../../utils/route-preload'
import { preloadImage } from '../../lib/image-delivery'

export type CategoryGridCardData = {
  name: string
  slug: string
  description?: string
  icon?: string
  image?: string
  count: number
}

export default function CategoryGridCard({
  category,
  imageLoading = 'lazy',
}: {
  category: CategoryGridCardData
  imageLoading?: 'eager' | 'lazy'
}) {
  const href = `/categories/${encodeURIComponent(category.slug)}`

  return (
    <Link
      to={href}
      onMouseEnter={() => { preloadRoute(href); void preloadImage(category.image, 'hero') }}
      onFocus={() => { preloadRoute(href); void preloadImage(category.image, 'hero') }}
      onTouchStart={() => { preloadRoute(href); void preloadImage(category.image, 'hero') }}
      aria-label={`Explore ${category.name}`}
      className="block h-full w-full cursor-pointer text-left outline-none transition-transform duration-400 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f8f3ff]"
    >
      <CategoryTileView
        name={category.name}
        description={category.description}
        image={category.image}
        count={category.count}
        imageLoading={imageLoading}
      />
    </Link>
  )
}
