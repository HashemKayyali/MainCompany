export type RequestType = 'rental' | 'purchase_quote'
export type RentalCartMode = 'shared' | 'per_item'

export type RentalRequestStatus =
  | 'pending_review'
  | 'confirmed'
  | 'rejected'
  | 'in_preparation'
  | 'completed'
  | 'cancelled'

export type PurchaseQuoteStatus =
  | 'pending_review'
  | 'contacted'
  | 'quoted'
  | 'won'
  | 'lost'
  | 'rejected'

export interface RentalAvailability {
  productId: string
  startDate: string
  endDate: string
  stockActive: number
  reservedQuantity: number
  availableQuantity: number
}

export interface RentalCartItem {
  productId?: string
  productSlug: string
  productTitle: string
  productImage: string
  unitPrice: number
  currency: string
  quantity: number
  startDate: string
  endDate: string
  minimumRentalDays: number
  stockActive: number
}

export interface RentalCartState {
  mode: RentalCartMode
  sharedStartDate: string
  sharedEndDate: string
  items: RentalCartItem[]
}

export interface PurchaseQuoteDraftItem {
  productId?: string
  productSlug: string
  productTitle: string
  productImage: string
  quantity: number
  note: string
}

export interface RequestContactForm {
  customerName: string
  email: string
  phone: string
  companyName: string
  city: string
  address: string
  eventName: string
  notes: string
}

export interface RentalRequestCreateInput extends RequestContactForm {
  extraFees?: number
  items: Array<{
    productId: string
    quantity: number
    rentalStartDate: string
    rentalEndDate: string
  }>
}

export interface PurchaseQuoteCreateInput extends RequestContactForm {
  items: Array<{
    productId: string
    quantity: number
    note?: string
  }>
}

export interface RequestStatusHistoryEntry {
  id: string
  requestType: RequestType
  requestId: string
  oldStatus: string | null
  newStatus: string
  note: string | null
  changedByProfileId: string | null
  createdAt: string
}

export interface RentalRequestItem {
  id: string
  productId: string
  productSlug: string
  productTitleSnapshot: string
  quantity: number
  rentalStartDate: string
  rentalEndDate: string
  rentalDays: number
  unitPrice: number
  lineTotal: number
  createdAt: string
}

export interface RentalRequest {
  id: string
  requestNumber: string
  profileId: string
  customerName: string
  email: string
  phone: string
  companyName: string
  city: string
  address: string
  eventName: string
  notes: string
  adminInternalNotes: string
  subtotal: number
  extraFees: number
  grandTotal: number
  status: RentalRequestStatus
  createdAt: string
  updatedAt: string
}

export interface RentalRequestDetails extends RentalRequest {
  items: RentalRequestItem[]
  history: RequestStatusHistoryEntry[]
}

export interface PurchaseQuoteItem {
  id: string
  productId: string
  productSlug: string
  productTitleSnapshot: string
  quantity: number
  createdAt: string
}

export interface PurchaseQuoteRequest {
  id: string
  requestNumber: string
  profileId: string
  customerName: string
  email: string
  phone: string
  companyName: string
  city: string
  address: string
  notes: string
  adminInternalNotes: string
  status: PurchaseQuoteStatus
  createdAt: string
  updatedAt: string
}

export interface PurchaseQuoteRequestDetails extends PurchaseQuoteRequest {
  items: PurchaseQuoteItem[]
  history: RequestStatusHistoryEntry[]
}

export interface CustomerRequestListItem {
  id: string
  requestNumber: string
  type: RequestType
  status: RentalRequestStatus | PurchaseQuoteStatus
  createdAt: string
  itemCount: number
  total: number | null
  customerName: string
}

export interface AdminRequestListItem extends CustomerRequestListItem {
  email: string
}
