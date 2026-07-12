import { describe, expect, it, vi } from 'vitest'
import { upsertRentalItem, type RentalDraftItem } from '../drafts'
import { createIdempotentSubmitter, TransactionError, withTimeout } from '../idempotent-submit'

const item: RentalDraftItem = {
  productId: '00000000-0000-4000-8000-000000000001',
  productSlug: 'bike',
  productTitle: 'Bike',
  productImage: '',
  unitPrice: 5,
  currency: 'JOD',
  quantity: 1,
  startDate: '2026-07-20',
  endDate: '2026-07-21',
  minimumRentalDays: 1,
  stockActive: 5,
}

describe('MUT-DC/MUT-TO reliability core', () => {
  it('merges duplicate draft additions and caps quantity', () => {
    expect(upsertRentalItem([item], { ...item, quantity: 150 })[0]?.quantity).toBe(100)
  })

  it('coalesces double-clicks into one RPC and one key', async () => {
    let resolve!: (value: { id: string; requestNumber: string }) => void
    const rpc = vi.fn(
      () => new Promise<{ id: string; requestNumber: string }>((r) => (resolve = r))
    )
    const submitter = createIdempotentSubmitter(rpc, () => '00000000-0000-4000-8000-000000000009')
    const first = submitter.submit({ value: 1 })
    const second = submitter.submit({ value: 1 })
    expect(first).toBe(second)
    expect(rpc).toHaveBeenCalledTimes(1)
    resolve({ id: '1', requestNumber: 'RR-1' })
    await first
  })

  it('reuses the same key after timeout until completion', async () => {
    const keys: string[] = []
    const rpc = vi.fn(async (input: { idempotencyKey: string }) => {
      keys.push(input.idempotencyKey)
      if (keys.length === 1) throw new TransactionError('TIMEOUT')
      return { id: '1', requestNumber: 'RR-1' }
    })
    const submitter = createIdempotentSubmitter(rpc, () => '00000000-0000-4000-8000-000000000009')
    await expect(submitter.submit({})).rejects.toMatchObject({ code: 'TIMEOUT' })
    await expect(submitter.submit({})).resolves.toMatchObject({ requestNumber: 'RR-1' })
    expect(new Set(keys).size).toBe(1)
  })

  it('returns a typed timeout', async () => {
    vi.useFakeTimers()
    const result = withTimeout(new Promise<never>(() => undefined), 10)
    const assertion = expect(result).rejects.toMatchObject({ code: 'TIMEOUT' })
    await vi.advanceTimersByTimeAsync(11)
    await assertion
    vi.useRealTimers()
  })
})
