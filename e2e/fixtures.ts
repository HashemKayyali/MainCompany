import { expect, type Page, type Route } from '@playwright/test'
import { DEFAULT_CATEGORIES, DEFAULT_CUSTOMERS, DEFAULT_PARTS, DEFAULT_PRODUCTS } from '../src/data/defaults'

const E2E_USER_ID = '00000000-0000-4000-8000-000000000001'
const CHAT_CONVERSATION_ID = '00000000-0000-4000-8000-0000000000c1'

export const PUBLIC_ROUTES = [
  '/',
  '/products',
  '/products/bike-blender',
  '/categories',
  '/categories/eventies',
  '/gallery',
  '/custom-builds',
  '/customers',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
]

const galleryRows = [
  {
    slug: 'e2e-gallery',
    title: 'E2E Gallery',
    cover: '/images/Corporate-card.webp',
    images: ['/images/Corporate-card.webp', '/images/Festivals-card.webp', '/images/Exhibitions-card.webp'],
    category: 'Events',
    sort_order: 1,
  },
]

const nowIso = '2026-07-10T12:00:00.000Z'

const profileRow = {
  id: E2E_USER_ID,
  name: 'E2E Customer',
  email: 'e2e.customer@example.com',
  phone: '+962700000000',
  role: null,
  created_at: nowIso,
}

const conversationRow = {
  id: CHAT_CONVERSATION_ID,
  customer_id: E2E_USER_ID,
  status: 'open',
  context_type: null,
  context_ref: null,
  context_label: null,
  context_url: '/',
  last_message_at: nowIso,
  created_at: nowIso,
  updated_at: nowIso,
  resolved_at: null,
  resolved_by: null,
}

const notificationRow = {
  id: 'notification-e2e-1',
  recipient_user_id: E2E_USER_ID,
  type: 'custom',
  priority: 'normal',
  title: 'E2E notification',
  title_ar: 'E2E notification',
  message: 'Browser regression notification.',
  message_ar: 'Browser regression notification.',
  entity_type: null,
  entity_id: null,
  target_url: '/notifications',
  metadata: {},
  read_at: null,
  created_at: nowIso,
  created_by: null,
  dedupe_key: 'e2e-notification',
}

function productToRow(product: (typeof DEFAULT_PRODUCTS)[number], index: number) {
  return {
    id: `product-${index + 1}`,
    title: product.name,
    slug: product.slug,
    description: product.description,
    price: product.rentalPricePerDay,
    category_id: product.categoryId,
    is_active: true,
    badge: product.badge,
    badge_color: product.badgeColor,
    category_tags: product.categoryTags,
    short_description: product.shortDescription,
    featured: product.featured,
    hero_image: product.heroImage,
    gallery: product.gallery,
    quick_options: product.quickOptions,
    notes: product.notes,
    features_left: product.features.left,
    features_right: product.features.right,
    currency: product.currency,
    show_price: product.showPrice ?? true,
    video_url: product.videoUrl ?? null,
    rental_enabled: product.rentalEnabled ?? true,
    sale_enabled: product.saleEnabled ?? true,
    stock_total: product.stockTotal ?? 4,
    stock_active: product.stockActive ?? 0,
    minimum_rental_days: product.minimumRentalDays ?? 1,
    buffer_before_days: product.bufferBeforeDays ?? 0,
    buffer_after_days: product.bufferAfterDays ?? 0,
    created_at: nowIso,
  }
}

function categoryToRow(category: (typeof DEFAULT_CATEGORIES)[number]) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    description: category.description,
    image: category.image,
  }
}

function partToRow(part: (typeof DEFAULT_PARTS)[number]) {
  return {
    id: part.id,
    title: part.name,
    slug: part.id,
    description: part.description,
    price: part.price,
    is_active: true,
    product_slug: part.productSlug,
    currency: part.currency,
    image: part.image,
    in_stock: part.inStock,
    created_at: nowIso,
  }
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
    headers: {
      'access-control-allow-origin': '*',
      'access-control-expose-headers': '*',
    },
  })
}

export async function installConsoleGuards(page: Page, allow: RegExp[] = []) {
  const failures: string[] = []
  page.on('console', message => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (allow.some(pattern => pattern.test(text))) return
    failures.push(`console.error: ${text}`)
  })
  page.on('pageerror', error => {
    failures.push(`pageerror: ${error.message}`)
  })

  return {
    assertClean() {
      expect(failures, failures.join('\n')).toEqual([])
    },
  }
}

export async function installApiMocks(page: Page) {
  await page.route('**/auth/v1/**', route => {
    const url = route.request().url()
    if (url.includes('/token')) {
      return json(route, { access_token: 'e2e-token', token_type: 'bearer', expires_in: 3600, refresh_token: 'e2e-refresh', user: authUser() })
    }
    if (url.includes('/user')) {
      return json(route, authUser())
    }
    return json(route, {})
  })

  await page.route('**/rest/v1/rpc/get_chat_unread_count', route => json(route, 0))
  await page.route('**/rest/v1/rpc/mark_chat_conversation_read', route => json(route, true))
  await page.route('**/rest/v1/rpc/get_or_create_chat_conversation', route => json(route, CHAT_CONVERSATION_ID))
  await page.route('**/rest/v1/rpc/get_notification_unread_count', route => json(route, 1))
  await page.route('**/rest/v1/rpc/mark_notification_read', route => json(route, true))
  await page.route('**/rest/v1/rpc/mark_all_notifications_read', route => json(route, 1))

  await page.route('**/rest/v1/profiles**', route => json(route, profileRow))
  await page.route('**/rest/v1/products**', route => {
    const rows = DEFAULT_PRODUCTS.map(productToRow)
    const url = new URL(route.request().url())
    const slugFilter = url.searchParams.get('slug')
    if (slugFilter?.startsWith('eq.')) return json(route, rows.find(row => row.slug === slugFilter.slice(3)) ?? null)
    return json(route, rows)
  })
  await page.route('**/rest/v1/categories**', route => json(route, DEFAULT_CATEGORIES.map(categoryToRow)))
  await page.route('**/rest/v1/parts**', route => json(route, DEFAULT_PARTS.map(partToRow)))
  await page.route('**/rest/v1/customers**', route => json(route, DEFAULT_CUSTOMERS.map(customer => ({ ...customer, created_at: nowIso }))))
  await page.route('**/rest/v1/gallery_albums**', route => json(route, galleryRows))
  await page.route('**/rest/v1/custom_builds**', route => json(route, []))
  await page.route('**/rest/v1/custom_build_categories**', route => json(route, []))
  await page.route('**/rest/v1/chat_quick_questions**', route => json(route, []))
  await page.route('**/rest/v1/chat_conversations**', route => json(route, conversationRow))
  await page.route('**/rest/v1/chat_messages**', route => {
    if (route.request().method() === 'POST') {
      return json(route, {
        id: `message-${Date.now()}`,
        conversation_id: CHAT_CONVERSATION_ID,
        sender_id: E2E_USER_ID,
        sender_type: 'customer',
        body: 'E2E message',
        kind: 'text',
        quick_question_id: null,
        read_at: null,
        created_at: new Date().toISOString(),
      })
    }
    return json(route, [])
  })
  await page.route('**/rest/v1/notifications**', route => json(route, [notificationRow]))
}

export async function installAuthenticatedSession(page: Page) {
  await page.addInitScript(({ userId, storageKey }) => {
    const user = {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'e2e.customer@example.com',
      email_confirmed_at: '2026-07-10T12:00:00.000Z',
      confirmed_at: '2026-07-10T12:00:00.000Z',
      last_sign_in_at: '2026-07-10T12:00:00.000Z',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: { name: 'E2E Customer' },
      identities: [],
      created_at: '2026-07-10T12:00:00.000Z',
      updated_at: '2026-07-10T12:00:00.000Z',
    }
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        access_token: 'e2e-token',
        refresh_token: 'e2e-refresh',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user,
      })
    )

    class MockWebSocket extends EventTarget {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3
      readyState = MockWebSocket.OPEN
      url: string
      onopen: ((event: Event) => void) | null = null
      onclose: ((event: CloseEvent) => void) | null = null
      onmessage: ((event: MessageEvent) => void) | null = null
      onerror: ((event: Event) => void) | null = null

      constructor(url: string) {
        super()
        this.url = url
        setTimeout(() => {
          const event = new Event('open')
          this.dispatchEvent(event)
          this.onopen?.(event)
        }, 0)
      }

      send() {}
      close() {
        this.readyState = MockWebSocket.CLOSED
        const event = new CloseEvent('close')
        this.dispatchEvent(event)
        this.onclose?.(event)
      }
    }

    window.WebSocket = MockWebSocket as unknown as typeof WebSocket
  }, { userId: E2E_USER_ID, storageKey: 'sb-localhost-auth-token' })
}

function authUser() {
  return {
    id: E2E_USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'e2e.customer@example.com',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: { name: 'E2E Customer' },
    created_at: nowIso,
  }
}

export async function waitForAppReady(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await expect(page.locator('#root')).toBeAttached()
  await expect(page.locator('#main-content, main').first()).toBeVisible()
}

export function chatRoot(page: Page) {
  return page.locator('[data-i18n-manual]').last()
}

export async function openChat(page: Page) {
  const root = chatRoot(page)
  await root.locator('> button').click()
  await expect(root.locator('section[role="dialog"]')).toBeVisible()
}

export async function closeChat(page: Page) {
  const root = chatRoot(page)
  const dialog = root.locator('section[role="dialog"]')
  await dialog.locator('header button').last().click()
  await expect(dialog).toBeHidden()
}

export async function assertBodyUnlocked(page: Page) {
  await expect.poll(async () => page.evaluate(() => ({
    locked: document.documentElement.dataset.scrollLocked,
    position: document.body.style.position,
    overflow: document.body.style.overflow,
  }))).toEqual({ locked: undefined, position: '', overflow: '' })
}

export async function assertNoHorizontalOverflow(page: Page, route: string, tolerance = 2) {
  await page.goto(route, { waitUntil: 'commit', timeout: 30_000 })
  await waitForAppReady(page)
  await page.waitForLoadState('networkidle', { timeout: 1500 }).catch(() => {})

  let result:
    | { scrollWidth: number; clientWidth: number; overflowing: Array<Record<string, unknown>> }
    | undefined
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      result = await page.evaluate(toleranceValue => {
        const root = document.documentElement
        const overflowing = Array.from(document.querySelectorAll<HTMLElement>('body *'))
          .map(element => {
            const rect = element.getBoundingClientRect()
            return {
              tag: element.tagName.toLowerCase(),
              className: String(element.className || '').slice(0, 160),
              id: element.id,
              text: (element.textContent || '').trim().slice(0, 80),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            }
          })
          .filter(item => item.right > root.clientWidth + toleranceValue || item.left < -toleranceValue)
          .slice(0, 8)

        return {
          scrollWidth: root.scrollWidth,
          clientWidth: root.clientWidth,
          overflowing,
        }
      }, tolerance)
      break
    } catch (error) {
      if (!String(error).includes('Execution context was destroyed') || attempt === 2) throw error
      await page.waitForTimeout(200)
    }
  }

  expect(result, `${route} did not produce a stable layout measurement`).toBeTruthy()

  expect(
    result!.scrollWidth,
    `${route} overflowed: ${JSON.stringify(result, null, 2)}`
  ).toBeLessThanOrEqual(result!.clientWidth + tolerance)
}
