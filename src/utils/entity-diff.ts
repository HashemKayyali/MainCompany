// Structured entity diffing used by the admin activity log.
//
// Given a `before` and `after` snapshot of the same entity, produces a list of
// human-readable Change records that describe exactly what an admin did:
// which fields were set, what text changed, which images were added/removed,
// which list items were reordered, etc.
//
// The output is JSON-serializable so it can be persisted verbatim in the
// admin_logs.details column and later rendered in the log details modal.

export type ChangeKind =
  | 'set' // a scalar field went from empty/undefined to a value
  | 'clear' // a scalar field went from a value to empty
  | 'update' // scalar field changed from one value to another
  | 'image-added'
  | 'image-removed'
  | 'image-replaced'
  | 'list-added'
  | 'list-removed'
  | 'list-reordered'
  | 'object-updated'

export interface Change {
  field: string
  label: string
  kind: ChangeKind
  before?: unknown
  after?: unknown
  // For image / list changes:
  added?: string[]
  removed?: string[]
  // Human summary for a single change.
  summary: string
}

// Fields that hold a single image URL. Rendered with a thumbnail preview.
const IMAGE_FIELDS = new Set([
  'heroImage',
  'image',
  'logo',
  'cover',
  'icon',
])

// Fields that hold an array of image URLs.
const IMAGE_ARRAY_FIELDS = new Set(['gallery', 'images'])

// Fields that hold a plain array of strings (tags / bullet points).
const STRING_ARRAY_FIELDS = new Set(['categoryTags', 'notes'])

// Fields that are longer-form text — the diff renderer will show them as a
// block instead of an inline pill.
const LONG_TEXT_FIELDS = new Set([
  'description',
  'shortDescription',
  'admin_internal_notes',
])

// Nested object fields — we render a compact recursive summary of the diff.
const NESTED_OBJECT_FIELDS = new Set(['features'])

// Fields we never want to log directly (internal ids, timestamps).
const IGNORED_FIELDS = new Set([
  'id',
  'created_at',
  'updated_at',
  'createdAt',
  'updatedAt',
])

// Human labels for common fields.
const FIELD_LABELS: Record<string, string> = {
  name: 'Name',
  title: 'Title',
  slug: 'Slug',
  displayOrder: 'Display order',
  sortOrder: 'Sort order',
  badge: 'Badge',
  badgeColor: 'Badge color',
  categoryTags: 'Category tags',
  categoryId: 'Category',
  category: 'Category',
  shortDescription: 'Short description',
  description: 'Description',
  featured: 'Featured',
  active: 'Active',
  showPrice: 'Show price',
  heroImage: 'Hero image',
  image: 'Image',
  logo: 'Logo',
  cover: 'Cover image',
  icon: 'Icon',
  gallery: 'Gallery images',
  images: 'Images',
  videoUrl: 'Video URL',
  quickOptions: 'Quick options',
  notes: 'Notes',
  features: 'Features',
  rentalPricePerDay: 'Rental price / day',
  currency: 'Currency',
  rentalEnabled: 'Rental enabled',
  saleEnabled: 'Sale enabled',
  stockTotal: 'Stock total',
  stockActive: 'Stock active',
  minimumRentalDays: 'Minimum rental days',
  bufferBeforeDays: 'Buffer before',
  bufferAfterDays: 'Buffer after',
  price: 'Price',
  productSlug: 'Product',
  inStock: 'In stock',
  email: 'Email',
  phone: 'Phone',
}

function labelOf(field: string): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field]
  // camelCase / snake_case → Sentence case.
  const spaced = field
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

function stringify(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.map(stringify).join(', ') || '—'
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  return String(value)
}

function diffArrays<T>(a: T[] = [], b: T[] = []): { added: T[]; removed: T[]; reordered: boolean } {
  const aSet = new Set(a.map(item => JSON.stringify(item)))
  const bSet = new Set(b.map(item => JSON.stringify(item)))
  const added = b.filter(item => !aSet.has(JSON.stringify(item)))
  const removed = a.filter(item => !bSet.has(JSON.stringify(item)))
  const sameSet = added.length === 0 && removed.length === 0
  const reordered =
    sameSet &&
    a.length === b.length &&
    a.some((item, i) => JSON.stringify(item) !== JSON.stringify(b[i]))
  return { added, removed, reordered }
}

function shortenUrl(url: string): string {
  if (typeof url !== 'string') return String(url)
  const trimmed = url.trim()
  if (trimmed.length <= 60) return trimmed
  const parts = trimmed.split('/')
  const last = parts[parts.length - 1] || trimmed
  return `…/${last.length > 40 ? `${last.slice(0, 37)}...` : last}`
}

function truncate(value: string, max = 80): string {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}…`
}

export function diffEntities(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined
): Change[] {
  const changes: Change[] = []
  const b = before || {}
  const a = after || {}
  const keys = new Set<string>([...Object.keys(b), ...Object.keys(a)])

  keys.forEach(field => {
    if (IGNORED_FIELDS.has(field)) return
    const oldVal = b[field]
    const newVal = a[field]

    // Skip when equal (deep for arrays/objects via JSON compare).
    if (JSON.stringify(oldVal) === JSON.stringify(newVal)) return

    const label = labelOf(field)

    // Single image URL.
    if (IMAGE_FIELDS.has(field)) {
      if (isEmpty(oldVal) && !isEmpty(newVal)) {
        changes.push({
          field, label, kind: 'image-added',
          after: newVal,
          added: [String(newVal)],
          summary: `Added ${label.toLowerCase()} (${shortenUrl(String(newVal))})`,
        })
      } else if (!isEmpty(oldVal) && isEmpty(newVal)) {
        changes.push({
          field, label, kind: 'image-removed',
          before: oldVal,
          removed: [String(oldVal)],
          summary: `Removed ${label.toLowerCase()}`,
        })
      } else {
        changes.push({
          field, label, kind: 'image-replaced',
          before: oldVal, after: newVal,
          removed: [String(oldVal)],
          added: [String(newVal)],
          summary: `Replaced ${label.toLowerCase()}`,
        })
      }
      return
    }

    // Array of image URLs.
    if (IMAGE_ARRAY_FIELDS.has(field)) {
      const beforeArr = Array.isArray(oldVal) ? (oldVal as string[]) : []
      const afterArr = Array.isArray(newVal) ? (newVal as string[]) : []
      const { added, removed, reordered } = diffArrays(beforeArr, afterArr)
      if (added.length) {
        changes.push({
          field, label, kind: 'image-added',
          before: beforeArr, after: afterArr,
          added,
          summary: `Added ${added.length} image${added.length === 1 ? '' : 's'} to ${label.toLowerCase()}`,
        })
      }
      if (removed.length) {
        changes.push({
          field, label, kind: 'image-removed',
          before: beforeArr, after: afterArr,
          removed,
          summary: `Removed ${removed.length} image${removed.length === 1 ? '' : 's'} from ${label.toLowerCase()}`,
        })
      }
      if (reordered && !added.length && !removed.length) {
        changes.push({
          field, label, kind: 'list-reordered',
          before: beforeArr, after: afterArr,
          summary: `Reordered ${label.toLowerCase()}`,
        })
      }
      return
    }

    // Plain string arrays (tags, notes).
    if (STRING_ARRAY_FIELDS.has(field)) {
      const beforeArr = Array.isArray(oldVal) ? (oldVal as string[]) : []
      const afterArr = Array.isArray(newVal) ? (newVal as string[]) : []
      const { added, removed, reordered } = diffArrays(beforeArr, afterArr)
      if (added.length) {
        changes.push({
          field, label, kind: 'list-added',
          before: beforeArr, after: afterArr, added,
          summary: `Added to ${label.toLowerCase()}: ${added.map(v => `"${truncate(v, 40)}"`).join(', ')}`,
        })
      }
      if (removed.length) {
        changes.push({
          field, label, kind: 'list-removed',
          before: beforeArr, after: afterArr, removed,
          summary: `Removed from ${label.toLowerCase()}: ${removed.map(v => `"${truncate(v, 40)}"`).join(', ')}`,
        })
      }
      if (reordered && !added.length && !removed.length) {
        changes.push({
          field, label, kind: 'list-reordered',
          before: beforeArr, after: afterArr,
          summary: `Reordered ${label.toLowerCase()}`,
        })
      }
      return
    }

    // Nested object diff — flatten sub-keys.
    if (NESTED_OBJECT_FIELDS.has(field) && typeof oldVal === 'object' && typeof newVal === 'object') {
      const nested = diffEntities(
        (oldVal as Record<string, unknown>) || {},
        (newVal as Record<string, unknown>) || {}
      )
      if (nested.length) {
        changes.push({
          field, label, kind: 'object-updated',
          before: oldVal, after: newVal,
          summary: `Updated ${label.toLowerCase()} (${nested.length} sub-change${nested.length === 1 ? '' : 's'})`,
        })
        // Also push the nested changes with a prefixed path so the UI can render them.
        nested.forEach(child => {
          changes.push({
            ...child,
            field: `${field}.${child.field}`,
            label: `${label} → ${child.label}`,
          })
        })
      }
      return
    }

    // Everything else: scalars, quickOptions array (rendered as JSON), etc.
    if (isEmpty(oldVal) && !isEmpty(newVal)) {
      const isLong = LONG_TEXT_FIELDS.has(field)
      changes.push({
        field, label, kind: 'set', before: oldVal, after: newVal,
        summary: isLong
          ? `Set ${label.toLowerCase()}`
          : `Set ${label.toLowerCase()} to ${truncate(stringify(newVal), 60)}`,
      })
      return
    }
    if (!isEmpty(oldVal) && isEmpty(newVal)) {
      changes.push({
        field, label, kind: 'clear', before: oldVal, after: newVal,
        summary: `Cleared ${label.toLowerCase()}`,
      })
      return
    }

    const isLong = LONG_TEXT_FIELDS.has(field)
    changes.push({
      field, label, kind: 'update', before: oldVal, after: newVal,
      summary: isLong
        ? `Updated ${label.toLowerCase()}`
        : `Changed ${label.toLowerCase()} from ${truncate(stringify(oldVal), 40)} to ${truncate(stringify(newVal), 40)}`,
    })
  })

  return changes
}

// Build a one-line summary for a whole diff — used as the row-level details text.
export function summarizeChanges(changes: Change[]): string {
  if (!changes.length) return 'No visible changes.'
  const top = changes.slice(0, 3).map(c => c.summary)
  const extra = changes.length - top.length
  return extra > 0 ? `${top.join('; ')}; +${extra} more change${extra === 1 ? '' : 's'}` : top.join('; ')
}

// For create/delete events we want a compact "what was set" summary.
export function summarizeCreate(entity: Record<string, unknown> | null | undefined): {
  changes: Change[]
  summary: string
} {
  const changes = diffEntities({}, entity || {})
  return { changes, summary: summarizeChanges(changes) }
}

export function summarizeDelete(entity: Record<string, unknown> | null | undefined): {
  changes: Change[]
  summary: string
} {
  const changes = diffEntities(entity || {}, {})
  return { changes, summary: summarizeChanges(changes) }
}
