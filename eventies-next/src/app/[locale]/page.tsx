import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { getFeaturedProducts, getProducts } from '@/server/dal/products'
import { getCategories } from '@/server/dal/categories'
import { getCustomers, getGalleryAlbums } from '@/server/dal/catalog-extras'
import { buildMetadata } from '@/server/metadata/builders'
import { HeroClient, type HeroChip } from '@/features/catalog/hero/HeroClient'
import { BrowseCategories } from '@/features/catalog/home/BrowseCategories'
import { PopularServices } from '@/features/catalog/home/PopularServices'
import { HowItWorks } from '@/features/catalog/home/HowItWorks'
import { EventTypes } from '@/features/catalog/home/EventTypes'
import { CustomBuildPreview } from '@/features/catalog/home/CustomBuildPreview'
import { GalleryPreview, type GalleryShot } from '@/features/catalog/home/GalleryPreview'
import { Faq } from '@/features/catalog/home/Faq'
import { GetStarted } from '@/features/catalog/home/GetStarted'
import { LogoCloud } from '@/features/catalog/home/LogoCloud'
import type { CategoryGridItem } from '@/features/catalog/home/CategoryGridCard'

/**
 * CAT-002/024 — home (RSC). Full visual port of the Vite HomePage: dark hero
 * island over the marketing sections, alternating home-band theming, faithful
 * section order (categories → popular → how it works → event types → custom
 * builds → gallery → FAQ → get started → logo cloud).
 */
const PAGE_TITLE = 'Eventies | Event Services Marketplace in Jordan'
const PAGE_DESC =
  'Explore event rentals, interactive activations, screens, booths, production support, and custom setups across Jordan, then send one clear request for review.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({ locale, path: '/', title: PAGE_TITLE, description: PAGE_DESC })
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')

  const [categories, featured, allProducts, customers, albums] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getProducts(),
    getCustomers(),
    getGalleryAlbums(),
  ])

  // Category cards with a live service count (BrowseCategories).
  const countByCategory = new Map<string, number>()
  for (const p of allProducts) countByCategory.set(p.categoryId, (countByCategory.get(p.categoryId) ?? 0) + 1)
  const categoryItems: CategoryGridItem[] = categories
    .filter((c) => c.slug.trim().length > 0)
    .map((c) => ({
      name: c.name,
      slug: c.slug,
      description: c.description,
      image: c.image,
      count: countByCategory.get(c.id) ?? 0,
    }))

  const categoryNameById: Record<string, string> = Object.fromEntries(categories.map((c) => [c.id, c.name]))
  const popular = featured.length > 0 ? featured : allProducts

  // Hero chips + gallery shots (albums first, product images as fallback).
  const chips: HeroChip[] = categories
    .filter((c) => c.slug.trim().length > 0)
    .slice(0, 5)
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name }))

  const seen = new Set<string>()
  const albumShots: GalleryShot[] = []
  for (const album of [...albums].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))) {
    for (const url of [...(album.images ?? []), album.cover].filter((u): u is string => Boolean(u))) {
      if (seen.has(url)) continue
      seen.add(url)
      albumShots.push({ url, title: album.title })
    }
  }
  const productShots: GalleryShot[] = allProducts.flatMap((p) =>
    [p.heroImage, ...(p.gallery ?? [])].filter(Boolean).map((url) => ({ url, title: p.name }))
  )
  const galleryShots = (albumShots.length > 0 ? albumShots : productShots).slice(0, 9)

  const logoItems = customers.map((c) => ({
    name: c.name,
    slug: c.slug || c.id,
    logo: c.logo_url ?? undefined,
  }))

  return (
    <div>
      <HeroClient chips={chips} />

      <div className="bg-white">
        <div className="home-band home-band--theme">
          <BrowseCategories locale={locale} items={categoryItems} />
        </div>
        <div className="home-band home-band--plain">
          <PopularServices locale={locale} products={popular} categoryNameById={categoryNameById} />
        </div>
        <div className="home-band home-band--theme">
          <HowItWorks locale={locale} />
        </div>
        <div className="home-band home-band--plain">
          <EventTypes />
        </div>
        <div className="home-band home-band--theme">
          <CustomBuildPreview locale={locale} />
        </div>
        <div className="home-band home-band--plain">
          <GalleryPreview locale={locale} shots={galleryShots} />
        </div>
        <div className="home-band home-band--theme">
          <Faq />
        </div>
        <div className="home-band home-band--plain">
          <GetStarted locale={locale} />
        </div>
        <div className="home-band home-band--theme">
          <LogoCloud locale={locale} customers={logoItems} />
        </div>
      </div>
    </div>
  )
}
