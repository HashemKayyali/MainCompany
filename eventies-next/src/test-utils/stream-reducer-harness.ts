import { describe, expect, it } from 'vitest'

/**
 * RD-01 harness (BASE-011) — reusable contract suite for id-keyed realtime
 * stream reducers.
 *
 * Extracted from the notification-reducer test patterns so the SAME invariants
 * can be applied to the chat reducer in P5 (CHAT-003) and to the Next ports.
 * An implementation plugs in via `StreamReducerAdapter`; the harness runs the
 * shared scenario set: duplicate echo, out-of-order arrival, buffer-replay
 * convergence, capacity limit, and read-watermark behavior.
 *
 * `duplicatePolicy` documents how a re-delivered id is treated:
 *  - 'last-write-wins'  — incoming row replaces the stored one (current
 *    notification semantics, mergeNotificationRows)
 *  - 'first-write-wins' — stored row is kept (target chat semantics, CHAT-005)
 * Either way the core invariant holds: an id never appears twice.
 */
export interface StreamReducerAdapter<S, Item> {
  /** Empty container state. */
  empty(): S
  /** Realtime arrival / merge of one item (the reducer under test). */
  ingest(state: S, item: Item): S
  /** Items in render order (newest-first for notifications/chat lists). */
  items(state: S): Item[]
  id(item: Item): string
  /** ISO timestamp used for ordering. */
  timestamp(item: Item): string
  duplicatePolicy: 'last-write-wins' | 'first-write-wins'
  /** Max retained items, if the reducer caps (notifications cap at 50). */
  capacity?: number
  /** Optional read-state surface — enables the read-watermark scenarios. */
  read?: {
    markRead(state: S, id: string, readAt: string): S
    markAllRead(state: S, readAt: string): S
    unreadCount(state: S): number
    isRead(item: Item): boolean
    /** Clone an item with a new read timestamp (test data helper). */
    withReadAt(item: Item, readAt: string | null): Item
  }
}

export interface StreamReducerHarnessOptions<Item> {
  /** Produce a test item; ids must be unique, timestamps strictly increasing with `seq`. */
  makeItem(seq: number, overrides?: Partial<Item>): Item
}

export function runStreamReducerContract<S, Item>(
  name: string,
  adapter: StreamReducerAdapter<S, Item>,
  options: StreamReducerHarnessOptions<Item>
): void {
  const { makeItem } = options
  const ingestAll = (items: Item[]): S => items.reduce((s, m) => adapter.ingest(s, m), adapter.empty())
  const ids = (state: S) => adapter.items(state).map(i => adapter.id(i))

  describe(`RD-01 stream-reducer contract: ${name}`, () => {
    it('ingests items newest-first by timestamp', () => {
      const state = ingestAll([makeItem(1), makeItem(2), makeItem(3)])
      const ts = adapter.items(state).map(i => adapter.timestamp(i))
      expect([...ts].sort((a, b) => b.localeCompare(a))).toEqual(ts)
    })

    it('out-of-order arrival still converges to timestamp order', () => {
      const [a, b, c] = [makeItem(1), makeItem(2), makeItem(3)]
      const inOrder = ids(ingestAll([a, b, c]))
      const outOfOrder = ids(ingestAll([c, a, b]))
      expect(outOfOrder).toEqual(inOrder)
    })

    it('duplicate echo never yields a duplicate id', () => {
      const a = makeItem(1)
      const state = ingestAll([a, makeItem(2), a])
      const allIds = ids(state)
      expect(new Set(allIds).size).toBe(allIds.length)
    })

    it(`re-delivered id follows ${adapter.duplicatePolicy}`, () => {
      const original = makeItem(1)
      const state1 = adapter.ingest(adapter.empty(), original)
      if (!adapter.read) return // policy only observable via a mutated field
      const mutated = adapter.read.withReadAt(original, '2026-07-07T00:00:00.000Z')
      const state2 = adapter.ingest(state1, mutated)
      const stored = adapter.items(state2).find(i => adapter.id(i) === adapter.id(original))!
      if (adapter.duplicatePolicy === 'last-write-wins') {
        expect(adapter.read.isRead(stored)).toBe(true)
      } else {
        expect(adapter.read.isRead(stored)).toBe(false)
      }
    })

    it('buffer-replay converges: snapshot + replayed live buffer = same state as ideal stream', () => {
      // Simulates the load race: items 1-4 exist; 3 and 4 arrive live while
      // the snapshot [1,2,3] is being fetched; buffer is replayed after.
      const [m1, m2, m3, m4] = [makeItem(1), makeItem(2), makeItem(3), makeItem(4)]
      const snapshotThenReplay = ids([m3, m4].reduce((s, m) => adapter.ingest(s, m), ingestAll([m1, m2, m3])))
      const idealStream = ids(ingestAll([m1, m2, m3, m4]))
      expect(snapshotThenReplay).toEqual(idealStream)
    })

    if (adapter.capacity) {
      it(`caps retained items at ${adapter.capacity} keeping the newest`, () => {
        const items = Array.from({ length: adapter.capacity! + 5 }, (_, i) => makeItem(i + 1))
        const state = ingestAll(items)
        const kept = adapter.items(state)
        expect(kept).toHaveLength(adapter.capacity!)
        expect(adapter.id(kept[0]!)).toBe(adapter.id(items[items.length - 1]!))
      })
    }

    if (adapter.read) {
      const read = adapter.read
      it('markRead affects only the targeted id and is idempotent on read items', () => {
        const [a, b] = [makeItem(1), makeItem(2)]
        const state = ingestAll([a, b])
        const marked = read.markRead(state, adapter.id(a), '2026-07-07T01:00:00.000Z')
        expect(read.unreadCount(marked)).toBe(1)
        const again = read.markRead(marked, adapter.id(a), '2026-07-07T02:00:00.000Z')
        const storedA = adapter.items(again).find(i => adapter.id(i) === adapter.id(a))!
        // First read timestamp wins — re-marking must not move the watermark.
        expect(adapter.items(marked).find(i => adapter.id(i) === adapter.id(a))).toEqual(storedA)
      })

      it('markAllRead zeroes the unread count', () => {
        const state = ingestAll([makeItem(1), makeItem(2), makeItem(3)])
        expect(read.unreadCount(state)).toBe(3)
        expect(read.unreadCount(read.markAllRead(state, '2026-07-07T03:00:00.000Z'))).toBe(0)
      })
    }
  })
}
