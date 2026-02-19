// ═══════════════════════════════════════════════
// Database types matching ACTUAL Supabase schema
// ═══════════════════════════════════════════════

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string | null; email: string | null; phone: string | null; role: string; created_at: string }
        Insert: { id: string; name?: string | null; email?: string | null; phone?: string | null; role?: string }
        Update: { name?: string | null; email?: string | null; phone?: string | null; role?: string }
      }
      categories: {
        Row: { id: string; name: string; slug: string; icon: string; description: string; image: string; created_at: string }
      }
      products: {
        Row: {
          id: string; title: string; slug: string; description: string | null
          price: number | null; category_id: string | null; is_active: boolean
          badge: string; badge_color: string; category_tags: string[]
          short_description: string; featured: boolean; hero_image: string
          gallery: string[]; quick_options: any[]; notes: string[]
          features_left: string[]; features_right: string[]
          rental_price_per_event: number; currency: string; created_at: string
        }
      }
      product_images: {
        Row: { id: string; product_id: string; url: string; is_cover: boolean; sort_order: number; created_at: string }
      }
      customers: {
        Row: { id: string; name: string; logo_url: string | null; slug: string | null; category: string; created_at: string }
      }
      parts: {
        Row: {
          id: string; title: string; slug: string; description: string | null
          price: number | null; is_active: boolean; product_slug: string
          currency: string; image: string; in_stock: boolean; created_at: string
        }
      }
      contact_submissions: {
        Row: {
          id: string; name: string; email: string; phone: string
          product_slug: string; city: string; address: string
          message: string; status: string; created_at: string
        }
      }
    }
  }
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type CategoryRow = Database['public']['Tables']['categories']['Row']
export type ProductRow = Database['public']['Tables']['products']['Row']
export type CustomerRow = Database['public']['Tables']['customers']['Row']
export type PartRow = Database['public']['Tables']['parts']['Row']
export type ContactSubmissionRow = Database['public']['Tables']['contact_submissions']['Row']
export type ProductImageRow = Database['public']['Tables']['product_images']['Row']
