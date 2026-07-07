// @vitest-environment jsdom
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppNotification } from '../../../services/notifications.service'

;(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const mocks = vi.hoisted(() => ({
  readNotification: vi.fn(async () => true),
  readAllNotifications: vi.fn(async () => 1),
  navigate: vi.fn(),
}))

const notification: AppNotification = {
  id: 'notification-1',
  recipient_user_id: 'user-1',
  type: 'rental_status_confirmed',
  priority: 'normal',
  title: 'Rental request confirmed',
  title_ar: null,
  message: 'Your request was confirmed.',
  message_ar: null,
  entity_type: 'rental_request',
  entity_id: 'request-1',
  target_url: '/my-requests/RR-1',
  metadata: {},
  read_at: null,
  created_at: '2026-07-06T09:00:00.000Z',
  created_by: null,
  dedupe_key: 'test',
}

vi.mock('../../../contexts/NotificationContext', () => ({
  useNotifications: () => ({
    notifications: [notification],
    unreadCount: 1,
    loading: false,
    readNotification: mocks.readNotification,
    readAllNotifications: mocks.readAllNotifications,
    refreshNotifications: vi.fn(),
  }),
}))

vi.mock('../../../contexts/LanguageContext', () => ({
  useI18n: () => ({
    locale: 'en',
    dir: 'ltr',
    translateText: (value: string) => value,
  }),
}))

vi.mock('react-router-dom', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useNavigate: () => mocks.navigate,
  }
})

import NotificationBell from '../NotificationBell'

describe('NotificationBell read semantics', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    mocks.readNotification.mockClear()
    mocks.readAllNotifications.mockClear()
    mocks.navigate.mockClear()
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  async function renderBell() {
    await act(async () => {
      root.render(<NotificationBell mode="client" buttonClassName="bell-button" />)
    })
  }

  async function click(element: Element) {
    await act(async () => {
      element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      await Promise.resolve()
    })
  }

  it('opening the dropdown does not mark notifications as read', async () => {
    await renderBell()
    const bell = container.querySelector('button[aria-label="Notifications"]')
    expect(bell).not.toBeNull()

    await click(bell!)

    expect(container.querySelector('[role="dialog"]')).not.toBeNull()
    expect(mocks.readNotification).not.toHaveBeenCalled()
    expect(mocks.readAllNotifications).not.toHaveBeenCalled()
  })

  it('clicking an item marks that item read before navigating to its target', async () => {
    await renderBell()
    await click(container.querySelector('button[aria-label="Notifications"]')!)

    const title = Array.from(container.querySelectorAll('button')).find(button =>
      button.textContent?.includes('Rental request confirmed')
    )
    expect(title).toBeDefined()

    await click(title!)

    expect(mocks.readNotification).toHaveBeenCalledWith('notification-1')
    expect(mocks.navigate).toHaveBeenCalledWith('/my-requests/RR-1')
    expect(mocks.readNotification.mock.invocationCallOrder[0])
      .toBeLessThan(mocks.navigate.mock.invocationCallOrder[0])
  })

  it('mark all is explicit and calls the recipient-scoped action only after click', async () => {
    await renderBell()
    await click(container.querySelector('button[aria-label="Notifications"]')!)
    expect(mocks.readAllNotifications).not.toHaveBeenCalled()

    const markAll = Array.from(container.querySelectorAll('button')).find(button =>
      button.textContent?.includes('Mark all as read')
    )
    expect(markAll).toBeDefined()

    await click(markAll!)
    expect(mocks.readAllNotifications).toHaveBeenCalledTimes(1)
  })
})
