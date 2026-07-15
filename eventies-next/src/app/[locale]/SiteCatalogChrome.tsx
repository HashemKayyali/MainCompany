import 'server-only'

import { getTranslations } from 'next-intl/server'
import { getCategories } from '@/server/dal/categories'
import { getProducts } from '@/server/dal/products'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteNav, type NavCategory, type NavSearchItem } from '@/components/layout/SiteNav'

/**
 * Catalog-backed chrome is streamed independently from the route body. This
 * keeps unrelated auth/account/admin pages from blocking their first response
 * on the complete public catalog while preserving full nav search and footer
 * category behavior once the cached DAL reads resolve.
 */
export async function CatalogSiteNav({ locale }: { locale: string }) {
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'nav' })
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]))
  const countByCategory = new Map<string, number>()

  for (const product of products) {
    countByCategory.set(product.categoryId, (countByCategory.get(product.categoryId) ?? 0) + 1)
  }

  const navCategories: NavCategory[] = categories
    .filter((category) => category.slug.trim().length > 0)
    .map((category) => ({
      slug: category.slug,
      name: category.name,
      icon: category.icon ?? '',
      count: countByCategory.get(category.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count)

  const search: NavSearchItem[] = [
    ...navCategories.map((category) => ({
      type: 'category' as const,
      name: category.name,
      href: `/categories/${category.slug}`,
      meta: t('servicesCount', { count: category.count }),
    })),
    ...products.map((product) => ({
      type: 'product' as const,
      name: product.name,
      href: `/products/${product.slug}`,
      image: product.heroImage || product.gallery?.[0] || undefined,
      meta: categoryNameById.get(product.categoryId) ?? t('services'),
    })),
  ]

  return <SiteNav locale={locale} search={search} categories={navCategories} />
}

export async function CatalogSiteFooter({ locale }: { locale: string }) {
  const categories = await getCategories()
  return (
    <SiteFooter
      locale={locale}
      categories={categories.map((category) => ({
        slug: category.slug,
        name: category.name,
        icon: category.icon,
      }))}
    />
  )
}
