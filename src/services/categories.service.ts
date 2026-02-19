import { supabase } from '../lib/supabase'
import type { CategoryRow } from '../lib/database.types'
import type { Category } from '../data/products/types'

function dbToApp(row: CategoryRow): Category {
  return {
    id: row.id,              // UUID from Supabase
    name: row.name,
    slug: row.slug,
    icon: row.icon || '',
    description: row.description || '',
    image: row.image || '',
  }
}

export async function getAll(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(cat: Category): Promise<Category> {
  // Don't send id — let Supabase auto-generate UUID
  const { data, error } = await supabase.from('categories').insert({
    name: cat.name,
    slug: cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'),
    icon: cat.icon || '',
    description: cat.description || '',
    image: cat.image || '',
  }).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function update(id: string, cat: Partial<Category>): Promise<Category> {
  const dbData: any = {}
  if (cat.name !== undefined) dbData.name = cat.name
  if (cat.slug !== undefined) dbData.slug = cat.slug
  if (cat.icon !== undefined) dbData.icon = cat.icon
  if (cat.description !== undefined) dbData.description = cat.description
  if (cat.image !== undefined) dbData.image = cat.image

  const { data, error } = await supabase.from('categories').update(dbData).eq('id', id).select().single()
  if (error) throw error
  return dbToApp(data)
}

export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) throw error
}
