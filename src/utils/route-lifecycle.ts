export const APP_ROUTE_CHANGE_EVENT = 'app:route-change'

type RouteLocationLike = {
  pathname: string
  search: string
  hash: string
  key?: string
}

type RouteStateLike = {
  location: RouteLocationLike
}

type SubscribableRouterLike = {
  state: RouteStateLike
  subscribe: (listener: (state: RouteStateLike) => void) => () => void
}

export type AppRouteChangeDetail = {
  from: RouteLocationLike
  to: RouteLocationLike
}

type RouteLifecycleState = {
  router: SubscribableRouterLike | null
  unsubscribe: (() => void) | null
}

declare global {
  // eslint-disable-next-line no-var
  var __eventiesRouteLifecycle: RouteLifecycleState | undefined
}

const routeLifecycleState: RouteLifecycleState =
  globalThis.__eventiesRouteLifecycle ??= {
    router: null,
    unsubscribe: null,
  }

function normalizeLocation(location: RouteLocationLike): RouteLocationLike {
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
    key: location.key,
  }
}

function isSameLocation(a: RouteLocationLike, b: RouteLocationLike) {
  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key
}

export function emitAppRouteChange(detail: AppRouteChangeDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<AppRouteChangeDetail>(APP_ROUTE_CHANGE_EVENT, { detail }))
}

export function installAppRouteChangeEmitter(router: SubscribableRouterLike) {
  if (typeof window === 'undefined') return

  if (routeLifecycleState.unsubscribe) {
    if (routeLifecycleState.router === router) return

    routeLifecycleState.unsubscribe()
    routeLifecycleState.unsubscribe = null
    routeLifecycleState.router = null
  }

  let previous = normalizeLocation(router.state.location)

  routeLifecycleState.router = router
  routeLifecycleState.unsubscribe = router.subscribe(state => {
    const next = normalizeLocation(state.location)
    if (isSameLocation(previous, next)) return

    const from = previous
    previous = next
    emitAppRouteChange({ from, to: next })
  })
}

export function resetAppRouteChangeEmitterForTests() {
  routeLifecycleState.unsubscribe?.()
  routeLifecycleState.unsubscribe = null
  routeLifecycleState.router = null
}
