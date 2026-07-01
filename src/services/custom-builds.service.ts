import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { CustomBuildCategoryRow, CustomBuildRow, Database } from '../lib/database.types'
import type { CustomBuild, CustomBuildCategory } from '../data/custom-builds'

type CustomBuildInsert = Database['public']['Tables']['custom_builds']['Insert']
type CustomBuildUpdate = Database['public']['Tables']['custom_builds']['Update']
type CustomBuildCategoryInsert = Database['public']['Tables']['custom_build_categories']['Insert']
type CustomBuildCategoryUpdate = Database['public']['Tables']['custom_build_categories']['Update']

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function dbToApp(row: CustomBuildRow): CustomBuild {
  const images = row.images ?? []
  const cover = row.image_url || images[0] || ''

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    image: cover,
    images: images.length > 0 ? images : cover ? [cover] : [],
    category: row.category ?? '',
    sortOrder: Number(row.sort_order ?? 0),
    featured: row.is_featured ?? false,
    active: row.is_active !== false,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }
}

function appToDb(build: CustomBuild): CustomBuildInsert {
  const images = build.images?.filter(Boolean) ?? []
  const cover = build.image || images[0] || ''

  return {
    title: build.title,
    description: build.description || '',
    image_url: cover,
    images: images.length > 0 ? images : cover ? [cover] : [],
    category: build.category || '',
    sort_order: Number(build.sortOrder ?? 0),
    is_featured: build.featured ?? false,
    is_active: build.active !== false,
  }
}

function categoryDbToApp(row: CustomBuildCategoryRow): CustomBuildCategory {
  return {
    id: row.id,
    name: row.name,
    sortOrder: Number(row.sort_order ?? 0),
    active: row.is_active !== false,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  }
}

function categoryAppToDb(category: CustomBuildCategory): CustomBuildCategoryInsert {
  return {
    name: category.name.trim(),
    sort_order: Number(category.sortOrder ?? 0),
    is_active: category.active !== false,
  }
}

export async function getAll(): Promise<CustomBuild[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('custom_builds')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
    .returns<CustomBuildRow[]>()

  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function getCategories(): Promise<CustomBuildCategory[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('custom_build_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
    .returns<CustomBuildCategoryRow[]>()

  if (error) throw error
  return (data || []).map(categoryDbToApp)
}

export async function create(build: CustomBuild): Promise<CustomBuild> {
  ensureSupabase()
  const payload = appToDb(build)

  const { data, error } = await supabase
    .from('custom_builds')
    .insert(payload)
    .select('*')
    .single()
    .returns<CustomBuildRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function createCategory(category: CustomBuildCategory): Promise<CustomBuildCategory> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('custom_build_categories')
    .insert(categoryAppToDb(category))
    .select('*')
    .single()
    .returns<CustomBuildCategoryRow>()

  if (error) throw error
  return categoryDbToApp(data)
}

export async function update(id: string, build: Partial<CustomBuild>): Promise<CustomBuild> {
  ensureSupabase()

  const dbData: CustomBuildUpdate = {}

  if (build.title !== undefined) dbData.title = build.title
  if (build.description !== undefined) dbData.description = build.description || ''
  if (build.image !== undefined) dbData.image_url = build.image || ''
  if (build.images !== undefined) {
    const images = build.images.filter(Boolean)
    dbData.images = images
    dbData.image_url = build.image || images[0] || ''
  }
  if (build.category !== undefined) dbData.category = build.category || ''
  if (build.sortOrder !== undefined) dbData.sort_order = Number(build.sortOrder)
  if (build.featured !== undefined) dbData.is_featured = build.featured
  if (build.active !== undefined) dbData.is_active = build.active

  const { data, error } = await supabase
    .from('custom_builds')
    .update(dbData)
    .eq('id', id)
    .select('*')
    .single()
    .returns<CustomBuildRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function updateCategory(id: string, category: Partial<CustomBuildCategory>): Promise<CustomBuildCategory> {
  ensureSupabase()

  const dbData: CustomBuildCategoryUpdate = {}

  if (category.name !== undefined) dbData.name = category.name.trim()
  if (category.sortOrder !== undefined) dbData.sort_order = Number(category.sortOrder)
  if (category.active !== undefined) dbData.is_active = category.active

  const { data, error } = await supabase
    .from('custom_build_categories')
    .update(dbData)
    .eq('id', id)
    .select('*')
    .single()
    .returns<CustomBuildCategoryRow>()

  if (error) throw error
  return categoryDbToApp(data)
}

export async function remove(id: string): Promise<void> {
  ensureSupabase()
  const { error } = await supabase.from('custom_builds').delete().eq('id', id)
  if (error) throw error
}

export async function removeCategory(id: string): Promise<void> {
  ensureSupabase()
  const { error } = await supabase.from('custom_build_categories').delete().eq('id', id)
  if (error) throw error
}
