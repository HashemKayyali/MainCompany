// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBodyScrollLock } from '../useBodyScrollLock'

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function LockHarness({ first, second = false }: { first: boolean; second?: boolean }) {
  useBodyScrollLock(first)
  useBodyScrollLock(second)
  return null
}

describe('useBodyScrollLock', () => {
  let container: HTMLDivElement
  let root: Root
  let scrollTo: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {})

    Object.defineProperty(window, 'innerWidth', { value: 1000, configurable: true })
    Object.defineProperty(window, 'scrollX', { value: 0, configurable: true })
    Object.defineProperty(window, 'scrollY', { value: 240, configurable: true })
    Object.defineProperty(document.documentElement, 'clientWidth', { value: 980, configurable: true })
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    scrollTo.mockRestore()
    document.documentElement.removeAttribute('data-scroll-locked')
    document.documentElement.removeAttribute('style')
    document.body.removeAttribute('style')
  })

  it('freezes the body at the current scroll position and restores it on unlock', async () => {
    await act(async () => {
      root.render(<LockHarness first />)
    })

    expect(document.documentElement.dataset.scrollLocked).toBe('true')
    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe('-240px')
    expect(document.body.style.paddingRight).toBe('20px')

    await act(async () => {
      root.render(<LockHarness first={false} />)
    })

    expect(document.documentElement.dataset.scrollLocked).toBeUndefined()
    expect(document.body.style.position).toBe('')
    expect(scrollTo).toHaveBeenCalledWith(0, 240)
  })

  it('keeps the body locked until every nested lock is released', async () => {
    await act(async () => {
      root.render(<LockHarness first second />)
    })

    await act(async () => {
      root.render(<LockHarness first second={false} />)
    })

    expect(document.documentElement.dataset.scrollLocked).toBe('true')
    expect(scrollTo).not.toHaveBeenCalled()

    await act(async () => {
      root.render(<LockHarness first={false} second={false} />)
    })

    expect(document.documentElement.dataset.scrollLocked).toBeUndefined()
    expect(scrollTo).toHaveBeenCalledWith(0, 240)
  })
})
