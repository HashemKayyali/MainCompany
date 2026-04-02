import type { Product } from '../data/products/types'

const PRODUCT_ORDER_META_PREFIX = '__meta:display_order='

export function sanitizeProductDisplayOrder(value?: unknown) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.max(1, Math.floor(parsed))
}

export function getProductDisplayOrder(product: Product, fallbackOrder: number) {
  return sanitizeProductDisplayOrder(product.displayOrder) ?? fallbackOrder
}

export function extractProductOrderMeta(notes?: string[] | null) {
  let displayOrder: number | undefined
  const cleanNotes: string[] = []

  for (const note of notes ?? []) {
    const trimmed = String(note || '').trim()
    if (trimmed.startsWith(PRODUCT_ORDER_META_PREFIX)) {
      displayOrder = sanitizeProductDisplayOrder(trimmed.slice(PRODUCT_ORDER_META_PREFIX.length))
      continue
    }

    if (trimmed) cleanNotes.push(trimmed)
  }

  return { notes: cleanNotes, displayOrder }
}

export function injectProductOrderMeta(notes?: string[] | null, displayOrder?: number) {
  const cleanNotes = extractProductOrderMeta(notes).notes
  const order = sanitizeProductDisplayOrder(displayOrder)

  if (order === undefined) return cleanNotes
  return [...cleanNotes, `${PRODUCT_ORDER_META_PREFIX}${order}`]
}

export function sortProductsForDisplay(products: Product[]) {
  return [...products]
    .map((product, index) => ({ product, index }))
    .sort((a, b) => {
      const orderDiff =
        (sanitizeProductDisplayOrder(a.product.displayOrder) ?? Number.MAX_SAFE_INTEGER) -
        (sanitizeProductDisplayOrder(b.product.displayOrder) ?? Number.MAX_SAFE_INTEGER)

      if (orderDiff !== 0) return orderDiff
      return a.index - b.index
    })
    .map(({ product }) => product)
}

export function buildReorderedProducts(products: Product[], targetSlug: string, desiredOrder?: unknown) {
  const ordered = sortProductsForDisplay(products)
  const targetIndex = ordered.findIndex(product => product.slug === targetSlug)

  if (targetIndex === -1) return ordered

  const [target] = ordered.splice(targetIndex, 1)
  const targetOrder = sanitizeProductDisplayOrder(desiredOrder) ?? ordered.length + 1
  const insertAt = Math.min(ordered.length, Math.max(0, targetOrder - 1))

  ordered.splice(insertAt, 0, target)

  return ordered.map((product, index) => ({
    ...product,
    displayOrder: index + 1,
  }))
}
