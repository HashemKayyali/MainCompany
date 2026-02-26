// ═══════════════════════════════════════════════
// Database types matching ACTUAL Supabase schema
// (public schema) — with Row/Insert/Update (NO more never)
// ═══════════════════════════════════════════════

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          phone: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          phone?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          name?: string | null
          email?: string | null
          phone?: string | null
          role?: string
        }
        Relationships: []
      }

      categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          icon: string | null
          description: string | null
          image: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          icon?: string | null
          description?: string | null
          image?: string | null
        }
        Update: {
          name?: string
          slug?: string
          icon?: string | null
          description?: string | null
          image?: string | null
        }
        Relationships: []
      }

      customers: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          created_at: string
          slug: string | null
          category: string | null
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          created_at?: string
          slug?: string | null
          category?: string | null
        }
        Update: {
          name?: string
          logo_url?: string | null
          slug?: string | null
          category?: string | null
        }
        Relationships: []
      }

      gallery_albums: {
        Row: {
          id: string
          slug: string
          title: string
          cover: string | null
          images: string[] | null
          category: string | null
          sort_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          title: string
          cover?: string | null
          images?: string[] | null
          category?: string | null
          sort_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          slug?: string
          title?: string
          cover?: string | null
          images?: string[] | null
          category?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }

      parts: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          price: number | null
          is_active: boolean
          created_at: string
          product_slug: string | null
          currency: string | null
          image: string | null
          in_stock: boolean | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          price?: number | null
          is_active?: boolean
          created_at?: string
          product_slug?: string | null
          currency?: string | null
          image?: string | null
          in_stock?: boolean | null
        }
        Update: {
          title?: string
          slug?: string
          description?: string | null
          price?: number | null
          is_active?: boolean
          product_slug?: string | null
          currency?: string | null
          image?: string | null
          in_stock?: boolean | null
        }
        Relationships: []
      }

      products: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          price: number | null
          category_id: string | null
          is_active: boolean
          created_at: string

          // ✅ UI flag: if false, hide pricing on public website
          show_price: boolean | null

          badge: string | null
          badge_color: string | null
          category_tags: string[] | null
          short_description: string | null
          featured: boolean | null
          hero_image: string | null
          gallery: string[] | null

          quick_options: any | null
          notes: string[] | null
          features_left: string[] | null
          features_right: string[] | null

          rental_price_per_event: number | null
          currency: string | null

          // ✅ Video URL for hover preview
          video_url: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          price?: number | null
          category_id?: string | null
          is_active?: boolean
          created_at?: string

          // ✅ UI flag: if false, hide pricing on public website
          show_price?: boolean | null

          badge?: string | null
          badge_color?: string | null
          category_tags?: string[] | null
          short_description?: string | null
          featured?: boolean | null
          hero_image?: string | null
          gallery?: string[] | null

          quick_options?: any | null
          notes?: string[] | null
          features_left?: string[] | null
          features_right?: string[] | null

          rental_price_per_event?: number | null
          currency?: string | null

          // ✅ Video URL for hover preview
          video_url?: string | null
        }
        Update: {
          title?: string
          slug?: string
          description?: string | null
          price?: number | null
          category_id?: string | null
          is_active?: boolean

          // ✅ UI flag: if false, hide pricing on public website
          show_price?: boolean | null

          badge?: string | null
          badge_color?: string | null
          category_tags?: string[] | null
          short_description?: string | null
          featured?: boolean | null
          hero_image?: string | null
          gallery?: string[] | null

          quick_options?: any | null
          notes?: string[] | null
          features_left?: string[] | null
          features_right?: string[] | null

          rental_price_per_event?: number | null
          currency?: string | null

          // ✅ Video URL for hover preview
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            referencedRelation: 'categories'
            referencedColumns: ['id']
          }
        ]
      }

      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          is_cover: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          is_cover?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          product_id?: string
          url?: string
          is_cover?: boolean
          sort_order?: number
        }
        Relationships: []
      }

      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          product_slug: string
          city: string
          address: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          product_slug: string
          city?: string
          address?: string
          message?: string
          status?: string
          created_at?: string
        }
        Update: {
          name?: string
          email?: string
          phone?: string
          product_slug?: string
          city?: string
          address?: string
          message?: string
          status?: string
        }
        Relationships: []
      }

      admin_logs: {
        Row: {
          id: string
          admin_id: string
          admin_name: string
          admin_email: string
          action: string
          entity_type: string
          entity_id: string
          entity_name: string
          details: string
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          admin_name: string
          admin_email: string
          action: string
          entity_type: string
          entity_id: string
          entity_name: string
          details?: string
          created_at?: string
        }
        Update: {
          admin_name?: string
          admin_email?: string
          action?: string
          entity_type?: string
          entity_id?: string
          entity_name?: string
          details?: string
        }
        Relationships: []
      }
    }

    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type ProfileRow = Database['public']['Tables']['profiles']['Row']
export type CategoryRow = Database['public']['Tables']['categories']['Row']
export type ProductRow = Database['public']['Tables']['products']['Row']
export type CustomerRow = Database['public']['Tables']['customers']['Row']
export type PartRow = Database['public']['Tables']['parts']['Row']
export type ContactSubmissionRow = Database['public']['Tables']['contact_submissions']['Row']
export type ProductImageRow = Database['public']['Tables']['product_images']['Row']
export type GalleryAlbumRow = Database['public']['Tables']['gallery_albums']['Row']