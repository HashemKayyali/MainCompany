import type {
  PurchaseQuoteDraftItem,
  RentalCartItem,
  RentalCartMode,
  RequestContactForm,
  RequestType,
} from '../types/commerce'

const MS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcDate(dateValue: string) {
  const [year, month, day] = dateValue.split('-').map(Number)
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1))
}

export function hasValidDateRange(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) return false
  return toUtcDate(endDate).getTime() >= toUtcDate(startDate).getTime()
}

export function calculateRentalDays(startDate?: string, endDate?: string) {
  if (!hasValidDateRange(startDate, endDate)) return 0
  const start = toUtcDate(startDate as string).getTime()
  const end = toUtcDate(endDate as string).getTime()
  return Math.floor((end - start) / MS_PER_DAY) + 1
}

export function calculateRentalLineTotal(quantity: number, unitPrice: number, rentalDays: number) {
  return Number((Math.max(quantity, 0) * Math.max(unitPrice, 0) * Math.max(rentalDays, 0)).toFixed(2))
}

export function clampQuantity(quantity: number, fallback = 1) {
  if (!Number.isFinite(quantity)) return fallback
  return Math.min(999, Math.max(1, Math.round(quantity)))
}

export function resolveCartItemDates(
  item: RentalCartItem,
  mode: RentalCartMode,
  sharedStartDate: string,
  sharedEndDate: string
) {
  if (mode === 'shared') {
    return { startDate: sharedStartDate, endDate: sharedEndDate }
  }

  return { startDate: item.startDate, endDate: item.endDate }
}

export function formatRequestStatusLabel(status: string) {
  return status
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

export function formatRequestTypeLabel(type: RequestType) {
  return type === 'rental' ? 'Rental Request' : 'Purchase Quote Request'
}

export function isRentalRequestNumber(requestNumber: string) {
  return requestNumber.toUpperCase().startsWith('RR-')
}

export function buildInitialRequestForm(currentUser?: {
  name?: string | null
  email?: string | null
  phone?: string | null
}): RequestContactForm {
  return {
    customerName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    companyName: '',
    city: '',
    address: '',
    eventName: '',
    notes: '',
  }
}

export function combinePurchaseQuoteNotes(notes: string, items: PurchaseQuoteDraftItem[]) {
  const itemNotes = items
    .filter(item => item.note.trim())
    .map(item => `- ${item.productTitle}: ${item.note.trim()}`)

  if (!itemNotes.length) return notes.trim()
  return [notes.trim(), 'Item notes:', ...itemNotes].filter(Boolean).join('\n')
}

export function getRentalCartGrandTotal(
  items: RentalCartItem[],
  mode: RentalCartMode,
  sharedStartDate: string,
  sharedEndDate: string
) {
  return Number(
    items
      .reduce((sum, item) => {
        const { startDate, endDate } = resolveCartItemDates(item, mode, sharedStartDate, sharedEndDate)
        return sum + calculateRentalLineTotal(item.quantity, item.unitPrice, calculateRentalDays(startDate, endDate))
      }, 0)
      .toFixed(2)
  )
}

export function normalizeRpcSingle<T>(data: T | T[] | null | undefined): T | null {
  if (!data) return null
  return Array.isArray(data) ? data[0] ?? null : data
}

export function isMissingCommerceSchemaError(error: unknown) {
  const candidate = error as { code?: string | null; message?: string | null; details?: string | null }
  const text = `${candidate?.message || ''} ${candidate?.details || ''}`.toLowerCase()

  return (
    candidate?.code === 'PGRST205' ||
    candidate?.code === '42P01' ||
    text.includes("could not find the table 'public.rental_requests'") ||
    text.includes("could not find the table 'public.purchase_quote_requests'") ||
    text.includes('schema cache') ||
    text.includes('relation "public.rental_requests" does not exist') ||
    text.includes('relation "public.purchase_quote_requests" does not exist')
  )
}

export function getCommerceErrorMessage(
  error: unknown,
  fallback = 'Something went wrong while loading your requests.'
) {
  const candidate = error as { message?: string | null; details?: string | null }
  const text = `${candidate?.message || ''} ${candidate?.details || ''}`.toLowerCase()

  if (isMissingCommerceSchemaError(error)) {
    return 'Requests are not available yet on this Supabase project. Apply the latest rental commerce migration, then refresh the page.'
  }

  if (text.includes('column reference') && text.includes('end_date') && text.includes('ambiguous')) {
    return 'Request approval is still using an older database function on this Supabase project. Apply the latest request approval fix migration, then retry.'
  }

  return candidate?.message?.trim() || fallback
}
