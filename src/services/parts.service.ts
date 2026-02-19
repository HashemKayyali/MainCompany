import { supabase } from '../lib/supabase'
import type { PartRow } from '../lib/database.types'
import type { ProductPart } from '../data/products/types'

// DB uses: title, in_stock, product_slug
// App uses: name, inStock, productSlug
function dbToApp(row: PartRow): ProductPart {
  return {
    id: row.id,
    productSlug: row.product_slug || '',
    name: row.title,                    // DB "title" → App "name"
    description: row.description || '',
    price: Number(row.price) || 0,
    currency: row.currency || 'JOD',
    image: row.image || '',
    inStock: row.in_stock ?? true,
  }
}

function appToDb(p: ProductPart) {
  return {
    title: p.name,                      // App "name" → DB "title"
    slug: p.id,                         // Use id as slug (parts don't have separate slug in app)
    description: p.description || '',
    price: p.price || 0,
    is_active: true,
    product_slug: p.productSlug || '',
    currency: p.currency || 'JOD',
    image: p.image || '',
    in_stock: p.inStock ?? true,
  }
}

export async function getAll(): Promise<ProductPart[]> {
  const { data, error } = await supabase.from('parts').select('*').order('created_at')
  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function getByProduct(productSlug: string): Promise<ProductPart[]> {
  const { data, error } = await supabase.from('parts').select('*').eq('product_slug', productSlug)
  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(part: ProductPart): Promise<ProductPart> {
  const { data, error } = await supabase.from('parts').insert(appToDb(part)).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function update(id: string, part: Partial<ProductPart>): Promise<ProductPart> {
  const dbData: any = {}
  if (part.name !== undefined) dbData.title = part.name
  if (part.productSlug !== undefined) dbData.product_slug = part.productSlug
  if (part.description !== undefined) dbData.description = part.description
  if (part.price !== undefined) dbData.price = part.price
  if (part.currency !== undefined) dbData.currency = part.currency
  if (part.image !== undefined) dbData.image = part.image
  if (part.inStock !== undefined) dbData.in_stock = part.inStock

  const { data, error } = await supabase.from('parts').update(dbData).eq('id', id).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('parts').delete().eq('id', id)
  if (error) throw error
}
