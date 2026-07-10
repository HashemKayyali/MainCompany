import type { GalleryAlbum } from '../data/gallery'
import { preloadImage, type ImagePreset } from './image-delivery'

export const GALLERY_IMAGE_INTENT_EVENT = 'eventies:gallery-image-intent'

type WarmupItem = {
  media: string
  preset: ImagePreset
  sizes: string
}

const warmedItems = new Set<string>()

export function signalGalleryImageIntent() {
  if (typeof document === 'undefined') return
  document.dispatchEvent(new Event(GALLERY_IMAGE_INTENT_EVENT))
}

export function scheduleIdleWork(callback: () => void, timeout = 2500) {
  if (typeof window === 'undefined') return () => undefined
  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number
    cancelIdleCallback?: (handle: number) => void
  }

  if (idleWindow.requestIdleCallback) {
    const handle = idleWindow.requestIdleCallback(callback, { timeout })
    return () => idleWindow.cancelIdleCallback?.(handle)
  }

  const timer = window.setTimeout(callback, Math.min(timeout, 800))
  return () => window.clearTimeout(timer)
}

async function warmBatch(items: WarmupItem[], concurrency = 4) {
  const queue = items.filter(item => {
    if (!item.media) return false
    const key = `${item.preset}|${item.sizes}|${item.media}`
    if (warmedItems.has(key)) return false
    warmedItems.add(key)
    return true
  })

  let cursor = 0
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (cursor < queue.length) {
      const item = queue[cursor]
      cursor += 1
      await preloadImage(item.media, item.preset, 'gallery-warmup', item.sizes)
    }
  })
  await Promise.all(workers)
}

export function warmGalleryPageAssets(albums: GalleryAlbum[], includeFirstRow: boolean) {
  const coverItems: WarmupItem[] = albums.slice(0, 6).map(album => ({
    media: album.cover,
    preset: 'card',
    sizes: '(max-width: 640px) 180px, 210px',
  }))
  const firstRowItems: WarmupItem[] = includeFirstRow
    ? (albums[0]?.images ?? []).slice(0, 7).map(media => ({
        media,
        preset: 'thumbnail',
        sizes: '(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, (max-width: 1279px) 20vw, 14.3vw',
      }))
    : []

  return warmBatch([...coverItems, ...firstRowItems], 4)
}

