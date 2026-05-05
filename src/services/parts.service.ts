import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { Database, PartRow } from '../lib/database.types'
import type { ProductPart } from '../data/products/types'

type PartInsert = Database['public']['Tables']['parts']['Insert']
type PartUpdate = Database['public']['Tables']['parts']['Update']

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function slugify(input: string) {
  return (input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Resolve a product slug → uuid so writes can populate the parts.product_id FK.
// Returns null if the slug is empty or the product is missing.
async function resolveProductIdBySlug(slug: string | null | undefined): Promise<string | null> {
  if (!slug) return null
  const { data, error } = await supabase
    .from('products')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return (data as { id: string }).id
}

function dbToApp(row: PartRow): ProductPart {
  return {
    id: row.id,
    productSlug: row.product_slug || '',
    name: row.title,
    description: row.description || '',
    price: Number(row.price ?? 0),
    currency: row.currency || 'JOD',
    image: row.image || '',
    inStock: row.in_stock ?? true,
  }
}

function buildBasePayload(p: ProductPart): PartInsert {
  const safeSlug = slugify(p.name) || `part-${Date.now()}`
  return {
    title: p.name,
    slug: safeSlug,
    description: p.description || null,
    price: p.price ?? 0,
    is_active: true,
    product_slug: p.productSlug || '',
    currency: p.currency || 'JOD',
    image: p.image || '',
    in_stock: p.inStock ?? true,
  }
}

export async function getAll(): Promise<ProductPart[]> {
  ensureSupabase()
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .order('created_at')
    .returns<PartRow[]>()

  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function getByProduct(productSlug: string): Promise<ProductPart[]> {
  ensureSupabase()
  const { data, error } = await supabase
    .from('parts')
    .select('*')
    .eq('product_slug', productSlug)
    .returns<PartRow[]>()

  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(part: ProductPart): Promise<ProductPart> {
  ensureSupabase()
  const productId = await resolveProductIdBySlug(part.productSlug)
  const payload: PartInsert = { ...buildBasePayload(part), product_id: productId }

  const { data, error } = await supabase
    .from('parts')
    .insert(payload)
    .select('*')
    .single()
    .returns<PartRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function update(id: string, part: Partial<ProductPart>): Promise<ProductPart> {
  ensureSupabase()

  const dbData: PartUpdate = {}

  if (part.name !== undefined) dbData.title = part.name
  if (part.productSlug !== undefined) {
    dbData.product_slug = part.productSlug
    dbData.product_id = await resolveProductIdBySlug(part.productSlug)
  }
  if (part.description !== undefined) dbData.description = part.description || null
  if (part.price !== undefined) dbData.price = part.price
  if (part.currency !== undefined) dbData.currency = part.currency
  if (part.image !== undefined) dbData.image = part.image
  if (part.inStock !== undefined) dbData.in_stock = part.inStock

  const { data, error } = await supabase
    .from('parts')
    .update(dbData)
    .eq('id', id)
    .select('*')
    .single()
    .returns<PartRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function remove(id: string): Promise<void> {
  ensureSupabase()
  const { error } = await supabase.from('parts').delete().eq('id', id)
  if (error) throw error
}
