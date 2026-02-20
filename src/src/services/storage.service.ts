/**
 * Image upload service.
 * Uses base64 data URLs by default (no backend needed).
 * When Supabase is configured, uploads to Supabase Storage.
 */
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const BUCKET = 'product-images'
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function normalizePath(path: string): string {
  // إزالة أي "/" في البداية
  return path.replace(/^\/+/, '')
}

export async function uploadImage(file: File, folder: string, fileName?: string): Promise<string> {
  // fallback إذا Supabase مش مهيأ
  if (!isSupabaseConfigured()) {
    return fileToDataUrl(file)
  }

  const ext = (file.name.split('.').pop() || 'webp').toLowerCase()
  const safeFolder = folder?.trim() ? folder.trim() : 'uploads'
  const name = fileName || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  const path = normalizePath(`${safeFolder}/${name}.${ext}`)

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  })
  if (error) throw error

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return urlData.publicUrl
}

export async function uploadImages(files: File[], folder: string): Promise<string[]> {
  return Promise.all(files.map(file => uploadImage(file, folder)))
}

export async function deleteImage(url: string): Promise<void> {
  // إذا data url أو supabase مش مهيأ
  if (!isSupabaseConfigured()) return
  if (!url || url.startsWith('data:')) return

  // نحاول نستخرج path من رابط supabase
  // شكل الرابط غالبًا: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const idx = url.indexOf(marker)
  if (idx === -1) return

  const path = url.substring(idx + marker.length)
  if (!path) return

  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.warn('Failed to delete image:', error)
}
