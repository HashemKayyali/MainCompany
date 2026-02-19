export interface QuickOption { label: string; values: string[] }
export interface ProductPart { id: string; productSlug: string; name: string; description: string; price: number; currency: string; image: string; inStock: boolean }
export interface Category { id: string; name: string; slug: string; icon: string; description?: string; image?: string }
export interface Product { slug: string; name: string; badge: string; badgeColor: string; categoryTags: string[]; categoryId: string; shortDescription: string; description: string; featured: boolean; heroImage: string; gallery: string[]; quickOptions: QuickOption[]; notes: string[]; features: { left: string[]; right: string[] }; rentalPricePerDay: number; rentalPricePerEvent: number; currency: string }
