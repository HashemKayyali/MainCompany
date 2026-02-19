import { supabase } from '../lib/supabase'
import type { ProductRow } from '../lib/database.types'
import type { Product } from '../data/products/types'

// ── DB row → App object ──
// DB uses: title, price, category_id(UUID)
// App uses: name, rentalPricePerDay, categoryId(string)
function dbToApp(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.title,                    // DB "title" → App "name"
    badge: row.badge || '',
    badgeColor: row.badge_color || 'from-violet-500 to-pink-500',
    categoryTags: row.category_tags || [],
    categoryId: row.category_id || '',  // UUID string or empty
    shortDescription: row.short_description || '',
    description: row.description || '',
    featured: row.featured ?? false,
    heroImage: row.hero_image || '',
    gallery: row.gallery || [],
    quickOptions: (row.quick_options as any[]) || [],
    notes: row.notes || [],
    features: { left: row.features_left || [], right: row.features_right || [] },
    rentalPricePerDay: Number(row.price) || 0,        // DB "price" → App "rentalPricePerDay"
    rentalPricePerEvent: Number(row.rental_price_per_event) || 0,
    currency: row.currency || 'JOD',
  }
}

// ── App object → DB insert/update ──
function appToDb(p: Product) {
  return {
    title: p.name,                      // App "name" → DB "title"
    slug: p.slug,
    description: p.description || '',
    price: p.rentalPricePerDay || 0,    // App "rentalPricePerDay" → DB "price"
    category_id: p.categoryId || null,  // empty string → null (UUID column)
    is_active: true,
    badge: p.badge || '',
    badge_color: p.badgeColor || 'from-violet-500 to-pink-500',
    category_tags: p.categoryTags || [],
    short_description: p.shortDescription || '',
    featured: p.featured ?? false,
    hero_image: p.heroImage || '',
    gallery: p.gallery || [],
    quick_options: p.quickOptions as any || [],
    notes: p.notes || [],
    features_left: p.features?.left || [],
    features_right: p.features?.right || [],
    rental_price_per_event: p.rentalPricePerEvent || 0,
    currency: p.currency || 'JOD',
  }
}

export async function getAll(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').order('created_at')
  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function getBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).single()
  if (error) return null
  return dbToApp(data)
}

export async function create(product: Product): Promise<Product> {
  const { data, error } = await supabase.from('products').insert(appToDb(product)).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function update(slug: string, product: Partial<Product>): Promise<Product> {
  const dbData: any = {}
  if (product.name !== undefined) dbData.title = product.name       // name → title
  if (product.slug !== undefined) dbData.slug = product.slug
  if (product.badge !== undefined) dbData.badge = product.badge
  if (product.badgeColor !== undefined) dbData.badge_color = product.badgeColor
  if (product.categoryTags !== undefined) dbData.category_tags = product.categoryTags
  if (product.categoryId !== undefined) dbData.category_id = product.categoryId || null
  if (product.shortDescription !== undefined) dbData.short_description = product.shortDescription
  if (product.description !== undefined) dbData.description = product.description
  if (product.featured !== undefined) dbData.featured = product.featured
  if (product.heroImage !== undefined) dbData.hero_image = product.heroImage
  if (product.gallery !== undefined) dbData.gallery = product.gallery
  if (product.quickOptions !== undefined) dbData.quick_options = product.quickOptions
  if (product.notes !== undefined) dbData.notes = product.notes
  if (product.features !== undefined) {
    dbData.features_left = product.features.left
    dbData.features_right = product.features.right
  }
  if (product.rentalPricePerDay !== undefined) dbData.price = product.rentalPricePerDay  // → price
  if (product.rentalPricePerEvent !== undefined) dbData.rental_price_per_event = product.rentalPricePerEvent
  if (product.currency !== undefined) dbData.currency = product.currency

  const { data, error } = await supabase.from('products').update(dbData).eq('slug', slug).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function remove(slug: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('slug', slug)
  if (error) throw error
}
