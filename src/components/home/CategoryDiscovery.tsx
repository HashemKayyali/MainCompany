import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Camera,
  Gamepad2,
  Joystick,
  Lightbulb,
  MonitorPlay,
  Store,
  Wrench,
} from 'lucide-react'
import { useCategoriesData, useProductsData } from '../../contexts/DataContext'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import CategoryTileView from './CategoryTileView'
import type { Category } from '../../data/products/types'

const DISCOVERY_CATEGORIES: {
  key: string
  label: string
  slug: string
  fallbackTags: string[]
}[] = [
  { key: 'interactive-games', label: 'Interactive Games', slug: 'interactive-games', fallbackTags: ['interactive', 'competitive', 'fitness'] },
  { key: 'virtual-reality', label: 'Virtual Reality', slug: 'virtual-reality', fallbackTags: ['vr', 'immersive'] },
  { key: 'led-screens', label: 'LED Screens', slug: 'led-screens', fallbackTags: ['led'] },
  { key: 'booths-activations', label: 'Booths & Activations', slug: 'booths-activations', fallbackTags: ['branding'] },
  { key: 'lighting-sound', label: 'Lighting & Sound', slug: 'lighting-sound', fallbackTags: ['led', 'show'] },
  { key: 'photography', label: 'Photography', slug: 'photography', fallbackTags: ['photo'] },
  { key: 'arcade-games', label: 'Arcade Games', slug: 'arcade-games', fallbackTags: ['interactive', 'competitive', 'arcade'] },
  { key: 'custom-services', label: 'Custom Services', slug: 'custom-services', fallbackTags: ['branding', 'custom'] },
]

function normalize(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function CategoryDiscovery() {
  const { products } = useProductsData()
  const { categories } = useCategoriesData()
  const headerReveal = useReveal({ distance: 14, duration: 0.4 })
  const { containerProps, itemProps } = useRevealGroup({
    distance: 12,
    duration: 0.34,
    stagger: 0.04,
  })

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>()
    for (const category of categories) {
      map.set(normalize(category.slug), category)
      map.set(normalize(category.name), category)
    }
    return map
  }, [categories])

  const items = useMemo(
    () =>
      DISCOVERY_CATEGORIES.map(category => {
        const matched = categoryMap.get(normalize(category.slug)) ?? categoryMap.get(normalize(category.label))
        const fallbackSet = new Set(category.fallbackTags.map(normalize))

        const count = matched
          ? products.filter(p => p.categoryId === matched.id).length
          : products.filter(p =>
              (p.categoryTags ?? []).some(tag => fallbackSet.has(normalize(tag)))
            ).length

        return {
          ...category,
          id: matched?.id ?? category.key,
          name: matched?.name ?? category.label,
          slug: matched?.slug ?? category.slug,
          image: matched?.image,
          count,
          href: matched ? `/categories/${encodeURIComponent(matched.slug)}` : '/products',
        }
      }),
    [categoryMap, products]
  )

  return (
    <section id="categories" className="site-section scroll-mt-[calc(var(--app-navbar-height)+1rem)]">
      <div className="site-container">
        <motion.div {...headerReveal}>
          <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-700">
            <span className="h-px w-5 bg-brand-500" />
            Browse by Category
          </span>
          <h2 className="font-display text-[clamp(1.65rem,4vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-slate-900">
            What are you planning?
          </h2>
        </motion.div>

        <motion.div
          {...containerProps}
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4"
        >
          {items.map(item => (
            <motion.div key={item.key} {...itemProps}>
              <Link
                to={item.href}
                aria-label={`Explore ${item.name}`}
                className="group block h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              >
                <CategoryTileView
                  name={item.name}
                  image={item.image}
                  count={item.count}
                  reducedVisualEffects={false}
                  className="h-full"
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
