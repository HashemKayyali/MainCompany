export interface QuickOption { label: string; values: string[] }

export interface ProductPart {
  id: string
  productSlug: string
  name: string
  description: string
  price: number
  currency: string
  image: string
  inStock: boolean
  showPrice?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
  description?: string
  image?: string
}

export interface Product {
  id?: string
  slug: string
  name: string
  displayOrder?: number
  badge: string
  badgeColor: string
  categoryTags: string[]
  categoryId: string
  shortDescription: string
  description: string
  featured: boolean

  // ✅ NEW (undefined = show)
  showPrice?: boolean

  heroImage: string
  gallery: string[]

  // ✅ Video URL for hover preview on cards
  videoUrl?: string

  quickOptions: QuickOption[]
  notes: string[]
  features: { left: string[]; right: string[] }
  rentalPricePerDay: number
  currency: string
  rentalEnabled?: boolean
  saleEnabled?: boolean
  stockTotal?: number
  stockActive?: number
  minimumRentalDays?: number
  bufferBeforeDays?: number
  bufferAfterDays?: number
}
