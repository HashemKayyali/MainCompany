import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database, ProductRow } from '../lib/database.types'
import type { Product } from '../data/products/types'
import { extractProductOrderMeta, injectProductOrderMeta } from '../utils/product-order'

type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function dbToApp(row: ProductRow): Product {
  const { notes, displayOrder } = extractProductOrderMeta(row.notes ?? [])

  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    displayOrder,
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
    notes,
    features: { left: row.features_left ?? [], right: row.features_right ?? [] },
    rentalPricePerDay: Number(row.price ?? 0),
    currency: row.currency ?? 'JOD',
    showPrice: row.show_price !== false,
    videoUrl: row.video_url ?? '',
    rentalEnabled: row.rental_enabled !== false,
    saleEnabled: row.sale_enabled !== false,
    stockTotal: Number(row.stock_total ?? 0),
    stockActive: Number(row.stock_active ?? 0),
    minimumRentalDays: Number(row.minimum_rental_days ?? 1),
    bufferBeforeDays: Number(row.buffer_before_days ?? 0),
    bufferAfterDays: Number(row.buffer_after_days ?? 0),
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
    notes: injectProductOrderMeta(p.notes || [], p.displayOrder),
    features_left: p.features?.left || [],
    features_right: p.features?.right || [],
    currency: p.currency || 'JOD',
    show_price: p.showPrice !== false,
    video_url: p.videoUrl || null,
    rental_enabled: p.rentalEnabled !== false,
    sale_enabled: p.saleEnabled !== false,
    stock_total: Number(p.stockTotal ?? 0),
    stock_active: Number(p.stockActive ?? 0),
    minimum_rental_days: Number(p.minimumRentalDays ?? 1),
    buffer_before_days: Number(p.bufferBeforeDays ?? 0),
    buffer_after_days: Number(p.bufferAfterDays ?? 0),
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
  let existingProduct: Product | null | undefined

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
  if (product.notes !== undefined || product.displayOrder !== undefined) {
    existingProduct = existingProduct === undefined ? await getBySlug(slug) : existingProduct

    dbData.notes = injectProductOrderMeta(
      product.notes ?? existingProduct?.notes ?? [],
      product.displayOrder ?? existingProduct?.displayOrder
    )
  }

  if (product.features !== undefined) {
    dbData.features_left = product.features.left
    dbData.features_right = product.features.right
  }

  if (product.rentalPricePerDay !== undefined) dbData.price = product.rentalPricePerDay
  if (product.currency !== undefined) dbData.currency = product.currency
  if (product.showPrice !== undefined) dbData.show_price = product.showPrice
  if (product.videoUrl !== undefined) dbData.video_url = product.videoUrl || null
  if (product.rentalEnabled !== undefined) dbData.rental_enabled = product.rentalEnabled
  if (product.saleEnabled !== undefined) dbData.sale_enabled = product.saleEnabled
  if (product.stockTotal !== undefined) dbData.stock_total = Number(product.stockTotal)
  if (product.stockActive !== undefined) dbData.stock_active = Number(product.stockActive)
  if (product.minimumRentalDays !== undefined) dbData.minimum_rental_days = Number(product.minimumRentalDays)
  if (product.bufferBeforeDays !== undefined) dbData.buffer_before_days = Number(product.bufferBeforeDays)
  if (product.bufferAfterDays !== undefined) dbData.buffer_after_days = Number(product.bufferAfterDays)

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
