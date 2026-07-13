import { describe, expect, it } from 'vitest'
import { BufferedStream, watermarkMinus60Seconds } from '../stream-protocol'

type Item = { id: string; created_at: string }
const ingest = (state: Item[], item: Item) =>
  state.some((row) => row.id === item.id)
    ? state
    : [...state, item].sort(
        (a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id)
      )

describe('RT-RACE and RT-RC reconciliation protocol', () => {
  it('buffers events before snapshot and replays without duplicates', () => {
    const stream = new BufferedStream<Item, Item[]>([], ingest, (rows) => rows.reduce(ingest, []))
    stream.subscribe()
    stream.receive({ id: '2', created_at: '2026-07-14T00:00:02Z' })
    const state = stream.snapshot([
      { id: '1', created_at: '2026-07-14T00:00:01Z' },
      { id: '2', created_at: '2026-07-14T00:00:02Z' },
    ])
    expect(stream.phase).toBe('LIVE')
    expect(state.map((row) => row.id)).toEqual(['1', '2'])
  })

  it('buffers reconnect events and uses server watermark minus sixty seconds', () => {
    expect(watermarkMinus60Seconds('2026-07-14T00:02:00.000Z')).toBe('2026-07-14T00:01:00.000Z')
    const stream = new BufferedStream<Item, Item[]>([], ingest, (rows) => rows.reduce(ingest, []))
    stream.subscribe()
    stream.snapshot([])
    stream.reconnect()
    stream.receive({ id: 'missed', created_at: '2026-07-14T00:01:30Z' })
    expect(stream.snapshot([]).map((row) => row.id)).toEqual(['missed'])
  })

  it('rejects invalid client timestamps as reconnect watermarks', () => {
    expect(watermarkMinus60Seconds('not-a-server-time')).toBeNull()
  })
})
