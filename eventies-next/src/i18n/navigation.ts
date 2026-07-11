import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

/**
 * 03 §Locale architecture: THE ONLY sanctioned navigation surface for page
 * routes. Raw next/link / next/navigation drops the locale and is a lint
 * violation (see eslint.config.mjs no-restricted-imports).
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)
