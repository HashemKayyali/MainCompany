import type { Database } from './database.types'

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type CustomerRequestDetails =
  | {
      type: 'rental'
      request: Row<'rental_requests'>
      items: Row<'rental_request_items'>[]
      history: Row<'request_status_history'>[]
    }
  | {
      type: 'purchase_quote'
      request: Row<'purchase_quote_requests'>
      items: Row<'purchase_quote_items'>[]
      history: Row<'request_status_history'>[]
    }
