import { supabase, isSupabaseConfigured } from '../lib/supabase'
import type { GalleryAlbumRow, Database } from '../lib/database.types'
import type { GalleryAlbum } from '../data/gallery'

type GalleryInsert = Database['public']['Tables']['gallery_albums']['Insert']
type GalleryUpdate = Database['public']['Tables']['gallery_albums']['Update']

function ensureSupabase() {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY')
  }
}

function dbToApp(row: GalleryAlbumRow): GalleryAlbum {
  return {
    slug: row.slug,
    title: row.title,
    cover: row.cover ?? '',
    images: row.images ?? [],
    category: row.category ?? 'General',
  }
}

function appToDb(a: GalleryAlbum): GalleryInsert {
  return {
    slug: a.slug,
    title: a.title,
    cover: a.cover || '',
    images: a.images || [],
    category: a.category || '',
  }
}

export async function getAll(): Promise<GalleryAlbum[]> {
  ensureSupabase()

  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .order('sort_order', { ascending: true })
    .returns<GalleryAlbumRow[]>()

  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(album: GalleryAlbum): Promise<GalleryAlbum> {
  ensureSupabase()
  const payload = appToDb(album)

  const { data, error } = await supabase
    .from('gallery_albums')
    .insert(payload)
    .select('*')
    .single()
    .returns<GalleryAlbumRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function update(slug: string, album: Partial<GalleryAlbum>): Promise<GalleryAlbum> {
  ensureSupabase()

  const dbData: GalleryUpdate = {}

  if (album.slug !== undefined) dbData.slug = album.slug
  if (album.title !== undefined) dbData.title = album.title
  if (album.cover !== undefined) dbData.cover = album.cover || ''
  if (album.images !== undefined) dbData.images = album.images || []
  if (album.category !== undefined) dbData.category = album.category || ''

  const { data, error } = await supabase
    .from('gallery_albums')
    .update(dbData)
    .eq('slug', slug)
    .select('*')
    .single()
    .returns<GalleryAlbumRow>()

  if (error) throw error
  return dbToApp(data)
}

export async function remove(slug: string): Promise<void> {
  ensureSupabase()
  const { error } = await supabase.from('gallery_albums').delete().eq('slug', slug)
  if (error) throw error
}