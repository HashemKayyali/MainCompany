import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { CategoryRow, Database } from '../lib/database.types'
import type { Category } from '../data/products/types'

type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

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

function dbToApp(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon ?? '',
    description: row.description ?? '',
    image: row.image ?? '',
  }
}

export async function getAll(): Promise<Category[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })
    .returns<CategoryRow[]>()

  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(cat: Category): Promise<Category> {
  ensureSupabase()

  const payload: CategoryInsert = {
    name: cat.name,
    slug: cat.slug?.trim() ? cat.slug : slugify(cat.name) || `category-${Date.now()}`,
    icon: cat.icon || '',
    description: cat.description || '',
    image: cat.image || '',
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select('*')
    .single()
    .returns<CategoryRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function update(id: string, cat: Partial<Category>): Promise<Category> {
  ensureSupabase()

  const dbData: CategoryUpdate = {}

  if (cat.name !== undefined) dbData.name = cat.name
  if (cat.slug !== undefined) dbData.slug = cat.slug
  if (cat.icon !== undefined) dbData.icon = cat.icon
  if (cat.description !== undefined) dbData.description = cat.description
  if (cat.image !== undefined) dbData.image = cat.image

  const { data, error } = await supabase
    .from('categories')
    .update(dbData)
    .eq('id', id)
    .select('*')
    .single()
    .returns<CategoryRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function remove(id: string): Promise<void> {
  ensureSupabase()
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}