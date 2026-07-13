import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/shared/types/database.types'

export type RealtimeScopeKey =
  `chat:${string}` | `chat-unread:${string}` | `notifications:${string}` | 'admin-chat-inbox'

type Entry = { channel: RealtimeChannel; consumers: number }

/** One stable Supabase channel per RLS-equivalent scope, shared across remounts. */
export class SubscriptionManager {
  private readonly entries = new Map<RealtimeScopeKey, Entry>()

  constructor(private readonly client: SupabaseClient<Database>) {}

  acquire(key: RealtimeScopeKey, create: (key: RealtimeScopeKey) => RealtimeChannel) {
    const existing = this.entries.get(key)
    if (existing) {
      existing.consumers += 1
      return { channel: existing.channel, release: () => this.release(key) }
    }
    const channel = create(key)
    this.entries.set(key, { channel, consumers: 1 })
    return { channel, release: () => this.release(key) }
  }

  activeCount() {
    return this.entries.size
  }

  private release(key: RealtimeScopeKey) {
    const entry = this.entries.get(key)
    if (!entry) return
    entry.consumers -= 1
    if (entry.consumers > 0) return
    this.entries.delete(key)
    void this.client.removeChannel(entry.channel)
  }
}
