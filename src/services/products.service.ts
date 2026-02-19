import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database, ProductRow } from '../lib/database.types'
import type { Product } from '../data/products/types'

type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function dbToApp(row: ProductRow): Product {
  return {
    slug: row.slug,
    name: row.title,
    badge: row.badge ?? '',
    badgeColor: row.badge_color ?? 'from-violet-500 to-pink-500',
    categoryTags: row.category_tags ?? [],
    categoryId: row.category_id ?? '',
    shortDescription: row.short_description ?? '',
    description: row.description ?? '',
    featured: row.featured ?? false,
    heroImage: row.hero_image ?? '',
    gallery: row.gallery ?? [],
    quickOptions: (row.quick_options as any) ?? [],
    notes: row.notes ?? [],
    features: { left: row.features_left ?? [], right: row.features_right ?? [] },
    rentalPricePerDay: Number(row.price ?? 0),
    rentalPricePerEvent: Number(row.rental_price_per_event ?? 0),
    currency: row.currency ?? 'JOD',
  }
}

function appToDb(p: Product): ProductInsert {
  return {
    title: p.name,
    slug: p.slug,
    description: p.description || '',
    price: p.rentalPricePerDay || 0,
    category_id: p.categoryId ? p.categoryId : null,
    is_active: true,
    badge: p.badge || '',
    badge_color: p.badgeColor || 'from-violet-500 to-pink-500',
    category_tags: p.categoryTags || [],
    short_description: p.shortDescription || '',
    featured: p.featured ?? false,
    hero_image: p.heroImage || '',
    gallery: p.gallery || [],
    quick_options: (p.quickOptions as any) ?? [],
    notes: p.notes || [],
    features_left: p.features?.left || [],
    features_right: p.features?.right || [],
    rental_price_per_event: p.rentalPricePerEvent || 0,
    currency: p.currency || 'JOD',
  }
}

export async function getAll(): Promise<Product[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at')
    .returns<ProductRow[]>()

  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function getBySlug(slug: string): Promise<Product | null> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
    .returns<ProductRow | null>()

  if (error || !data) return null
  return dbToApp(data)
}

export async function create(product: Product): Promise<Product> {
  ensureSupabase()
  const payload = appToDb(product)

  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('*')
    .single()
    .returns<ProductRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function update(slug: string, product: Partial<Product>): Promise<Product> {
  ensureSupabase()

  const dbData: ProductUpdate = {}

  if (product.name !== undefined) dbData.title = product.name
  if (product.slug !== undefined) dbData.slug = product.slug
  if (product.badge !== undefined) dbData.badge = product.badge
  if (product.badgeColor !== undefined) dbData.badge_color = product.badgeColor
  if (product.categoryTags !== undefined) dbData.category_tags = product.categoryTags
  if (product.categoryId !== undefined) dbData.category_id = product.categoryId ? product.categoryId : null
  if (product.shortDescription !== undefined) dbData.short_description = product.shortDescription
  if (product.description !== undefined) dbData.description = product.description
  if (product.featured !== undefined) dbData.featured = product.featured
  if (product.heroImage !== undefined) dbData.hero_image = product.heroImage
  if (product.gallery !== undefined) dbData.gallery = product.gallery
  if (product.quickOptions !== undefined) dbData.quick_options = product.quickOptions as any
  if (product.notes !== undefined) dbData.notes = product.notes

  if (product.features !== undefined) {
    dbData.features_left = product.features.left
    dbData.features_right = product.features.right
  }

  if (product.rentalPricePerDay !== undefined) dbData.price = product.rentalPricePerDay
  if (product.rentalPricePerEvent !== undefined) dbData.rental_price_per_event = product.rentalPricePerEvent
  if (product.currency !== undefined) dbData.currency = product.currency

  const { data, error } = await supabase
    .from('products')
    .update(dbData)
    .eq('slug', slug)
    .select('*')
    .single()
    .returns<ProductRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function remove(slug: string): Promise<void> {
  ensureSupabase()
  const { error } = await supabase.from('products').delete().eq('slug', slug)
  if (error) throw error
}