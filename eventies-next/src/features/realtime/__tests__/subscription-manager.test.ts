import { describe, expect, it, vi } from 'vitest'
import { SubscriptionManager } from '../subscription-manager'

describe('RT-LEAK stable subscription manager', () => {
  it('shares a stable key and removes the channel after the final consumer', () => {
    const removeChannel = vi.fn(async () => 'ok')
    const manager = new SubscriptionManager({ removeChannel } as never)
    const channel = { topic: 'chat:conversation-1' }
    const create = vi.fn(() => channel as never)
    const first = manager.acquire('chat:conversation-1', create)
    const second = manager.acquire('chat:conversation-1', create)
    expect(create).toHaveBeenCalledTimes(1)
    expect(manager.activeCount()).toBe(1)
    first.release()
    expect(removeChannel).not.toHaveBeenCalled()
    second.release()
    expect(removeChannel).toHaveBeenCalledOnce()
    expect(manager.activeCount()).toBe(0)
  })

  it('does not leak across two mount/unmount cycles', () => {
    const removeChannel = vi.fn(async () => 'ok')
    const manager = new SubscriptionManager({ removeChannel } as never)
    for (let cycle = 0; cycle < 2; cycle += 1) {
      manager.acquire('notifications:user-1', () => ({}) as never).release()
    }
    expect(removeChannel).toHaveBeenCalledTimes(2)
    expect(manager.activeCount()).toBe(0)
  })
})
