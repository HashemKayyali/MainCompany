export type StreamPhase = 'IDLE' | 'BUFFERING' | 'REPLAY' | 'LIVE' | 'RECONNECTING'

export type Timestamped = { id: string; created_at: string }

export function serverOrder(a: Timestamped, b: Timestamped): number {
  const byTime = a.created_at.localeCompare(b.created_at)
  return byTime === 0 ? a.id.localeCompare(b.id) : byTime
}

export function watermarkMinus60Seconds(watermark: string | null): string | null {
  if (!watermark) return null
  const value = Date.parse(watermark)
  return Number.isFinite(value) ? new Date(value - 60_000).toISOString() : null
}

export class BufferedStream<Item extends Timestamped, State> {
  phase: StreamPhase = 'IDLE'
  private buffer: Item[] = []

  constructor(
    public state: State,
    private readonly ingest: (state: State, item: Item) => State,
    private readonly fromSnapshot: (items: Item[]) => State
  ) {}

  subscribe() {
    this.phase = 'BUFFERING'
    this.buffer = []
  }

  receive(item: Item) {
    if (this.phase === 'BUFFERING' || this.phase === 'RECONNECTING') this.buffer.push(item)
    else if (this.phase === 'LIVE') this.state = this.ingest(this.state, item)
  }

  snapshot(items: Item[]) {
    this.phase = 'REPLAY'
    this.state = this.buffer.reduce(this.ingest, this.fromSnapshot(items))
    this.buffer = []
    this.phase = 'LIVE'
    return this.state
  }

  reconnect() {
    this.phase = 'RECONNECTING'
    this.buffer = []
  }
}
