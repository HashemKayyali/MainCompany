import 'server-only'

type BridgeEnvironment = {
  VERCEL_ENV?: string
  ENABLE_BRIDGE_TEST?: string
}

/**
 * AUTHP-002 safety boundary: the P1B bridge probe must never be reachable on
 * the production deployment. Local access is explicit so a developer cannot
 * accidentally expose it by merely running a production build locally.
 */
export function isBridgeTestAvailable(
  environment: BridgeEnvironment = {
    VERCEL_ENV: process.env.VERCEL_ENV,
    ENABLE_BRIDGE_TEST: process.env.ENABLE_BRIDGE_TEST,
  }
): boolean {
  return environment.VERCEL_ENV === 'preview' || environment.ENABLE_BRIDGE_TEST === 'true'
}
