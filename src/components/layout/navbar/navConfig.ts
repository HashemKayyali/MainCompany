import { type LucideIcon } from 'lucide-react'
import { preloadRoute } from '../../../utils/route-preload'

export type NavChild = {
  to: string
  label: string
  description: string
  icon: LucideIcon
  meta: string
}

export type DesktopNavItem = {
  key: string
  label: string
  to?: string
  children?: NavChild[]
  eyebrow?: string
  title?: string
  body?: string
  ctaLabel?: string
  ctaTo?: string
}

export const MOBILE_NAV = [
  { to: '/', label: 'Home' },
  { to: '/#categories', label: 'Categories' },
  { to: '/products', label: 'Services' },
  { to: '/customers', label: 'Customers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

export const MOBILE_CHIPS = [
  { to: '/', label: 'Home' },
  { to: '/#categories', label: 'Categories' },
  { to: '/products', label: 'Services' },
  { to: '/customers', label: 'Customers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
] as const

export const DESKTOP_NAV: DesktopNavItem[] = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'categories', label: 'Categories', to: '/#categories' },
  { key: 'products', label: 'Services', to: '/products' },
  { key: 'customers', label: 'Customers', to: '/customers' },
  { key: 'gallery', label: 'Gallery', to: '/gallery' },
  { key: 'about', label: 'About', to: '/about' },
  { key: 'contact', label: 'Contact', to: '/contact' },
]

export function getDesktopNavActive(
  item: DesktopNavItem,
  isRouteActive: (target: string) => boolean
) {
  if (item.to) return isRouteActive(item.to)
  return item.children?.some(child => isRouteActive(child.to)) ?? false
}

export function preloadDesktopNavItem(item: DesktopNavItem) {
  if (item.to) {
    preloadRoute(item.to)
    return
  }

  item.children?.forEach(child => preloadRoute(child.to))
}
