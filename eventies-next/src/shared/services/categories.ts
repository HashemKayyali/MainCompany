import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database.types'
import type { Category } from '../types/catalog'

/**
 * FOUND-017 — categories service ported from src/services/categories.service.ts
 * with client injection; dbToApp mapping verbatim.
 */

type CategoryRow = Database['public']['Tables']['categories']['Row']
type CategoryInsert = Database['public']['Tables']['categories']['Insert']
type CategoryUpdate = Database['public']['Tables']['categories']['Update']

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

export function createCategoriesService(supabase: SupabaseClient<Database>) {
  async function getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })
      .returns<CategoryRow[]>()

    if (error) throw error
    return (data || []).map(dbToApp)
  }

  async function getBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      .returns<CategoryRow | null>()

    if (error || !data) return null
    return dbToApp(data)
  }

  async function create(cat: Category): Promise<Category> {
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

  async function update(id: string, cat: Partial<Category>): Promise<Category> {
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

  async function remove(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
  }

  return { getAll, getBySlug, create, update, remove }
}
