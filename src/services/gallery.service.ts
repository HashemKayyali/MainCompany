import { supabase } from '../lib/supabase'
import type { GalleryAlbumRow } from '../lib/database.types'
import type { GalleryAlbum } from '../data/gallery'

function dbToApp(row: GalleryAlbumRow): GalleryAlbum {
  return {
    slug: row.slug,
    title: row.title,
    cover: row.cover || '',
    images: row.images || [],
    category: row.category || '',
  }
}

export async function getAll(): Promise<GalleryAlbum[]> {
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data || []).map(dbToApp)
}

export async function create(album: GalleryAlbum): Promise<GalleryAlbum> {
  const { data, error } = await supabase
    .from('gallery_albums')
    .insert({
      slug: album.slug,
      title: album.title,
      cover: album.cover || (album.images?.[0] || ''),
      images: album.images || [],
      category: album.category || '',
    })
    .select()
    .single()
  if (error) throw error
  return dbToApp(data)
}

export async function update(slug: string, album: Partial<GalleryAlbum>): Promise<GalleryAlbum> {
  const dbData: any = {}
  if (album.title !== undefined) dbData.title = album.title
  if (album.slug !== undefined) dbData.slug = album.slug
  if (album.cover !== undefined) dbData.cover = album.cover
  if (album.images !== undefined) dbData.images = album.images
  if (album.category !== undefined) dbData.category = album.category

  const { data, error } = await supabase
    .from('gallery_albums')
    .update(dbData)
    .eq('slug', slug)
    .select()
    .single()
  if (error) throw error
  return dbToApp(data)
}

export async function remove(slug: string): Promise<void> {
  const { error } = await supabase
    .from('gallery_albums')
    .delete()
    .eq('slug', slug)
  if (error) throw error
}
