import type { Product } from '../../../data/products/types'

export type TabKey = 'basic' | 'content' | 'media' | 'options' | 'settings'

export const TAB_ORDER: TabKey[] = ['basic', 'content', 'media', 'options', 'settings']

export const DEFAULT_FROM = '#8b5cf6'
export const DEFAULT_TO = '#ec4899'

export const BADGE_OPTIONS = [
  'Most Popular',
  'New',
  'Best Seller',
  'Limited Edition',
  'Trending',
  'Staff Pick',
  'Exclusive',
  'Premium',
  'Competitive',
  'Immersive',
  'Interactive',
  'LED Show',
  'Racing',
  'Custom',
  'VR Experience',
  'Wellness',
  'Party',
  'Corporate',
  'Outdoor',
  'Featured',
]

export const EMPTY: Product = {
  slug: '',
  name: '',
  displayOrder: 1,
  badge: '',
  badgeColor: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
  categoryTags: [],
  categoryId: '',
  shortDescription: '',
  description: '',
  featured: false,
  heroImage: '',
  gallery: [],
  videoUrl: '',
  quickOptions: [],
  notes: [],
  features: { left: [], right: [] },
  rentalPricePerDay: 0,
  currency: 'JOD',
  showPrice: true,
  rentalEnabled: true,
  saleEnabled: true,
  stockTotal: 0,
  stockActive: 0,
  minimumRentalDays: 1,
  bufferBeforeDays: 0,
  bufferAfterDays: 0,
}
