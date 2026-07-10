// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  APP_ROUTE_CHANGE_EVENT,
  installAppRouteChangeEmitter,
  resetAppRouteChangeEmitterForTests,
  type AppRouteChangeDetail,
} from '../route-lifecycle'

type Listener = Parameters<Parameters<typeof installAppRouteChangeEmitter>[0]['subscribe']>[0]

function location(pathname: string, key: string, search = '', hash = '') {
  return { pathname, search, hash, key }
}

function createRouter(initial = location('/', 'home')) {
  let listener: Listener | null = null
  const unsubscribe = vi.fn()
  const router = {
    state: { location: initial },
    subscribe: vi.fn((nextListener: Listener) => {
      listener = nextListener
      return unsubscribe
    }),
  }

  return {
    router,
    unsubscribe,
    navigate(nextLocation: ReturnType<typeof location>) {
      router.state.location = nextLocation
      listener?.({ location: nextLocation })
    },
  }
}

describe('route lifecycle emitter', () => {
  afterEach(() => {
    resetAppRouteChangeEmitterForTests()
  })

  it('emits a browser event when the router location changes', () => {
    const route = createRouter()
    const events: AppRouteChangeDetail[] = []
    window.addEventListener(APP_ROUTE_CHANGE_EVENT, event => {
      events.push((event as CustomEvent<AppRouteChangeDetail>).detail)
    })

    installAppRouteChangeEmitter(route.router)
    route.navigate(location('/products', 'products'))

    expect(events).toEqual([
      {
        from: location('/', 'home'),
        to: location('/products', 'products'),
      },
    ])
  })

  it('does not emit when the router publishes the same location twice', () => {
    const route = createRouter(location('/products', 'products'))
    const listener = vi.fn()
    window.addEventListener(APP_ROUTE_CHANGE_EVENT, listener)

    installAppRouteChangeEmitter(route.router)
    route.navigate(location('/products', 'products'))

    expect(listener).not.toHaveBeenCalled()
  })

  it('does not duplicate subscriptions when the same router is installed again', () => {
    const route = createRouter()

    installAppRouteChangeEmitter(route.router)
    installAppRouteChangeEmitter(route.router)

    expect(route.router.subscribe).toHaveBeenCalledTimes(1)
    expect(route.unsubscribe).not.toHaveBeenCalled()
  })

  it('unsubscribes the previous router when a new router instance is installed', () => {
    const first = createRouter()
    const second = createRouter(location('/products', 'products'))

    installAppRouteChangeEmitter(first.router)
    installAppRouteChangeEmitter(second.router)

    expect(first.unsubscribe).toHaveBeenCalledTimes(1)
    expect(second.router.subscribe).toHaveBeenCalledTimes(1)
  })
})
