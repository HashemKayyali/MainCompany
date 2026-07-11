/**
 * Primary public navigation set — the Group A catalog surfaces (CAT-001).
 * Labels resolve through next-intl `nav.*` keys so /ar renders Arabic.
 * hrefs are locale-unprefixed; the i18n <Link> wrapper adds the /ar prefix.
 */
export const PRIMARY_NAV = [
  { href: '/', key: 'home' },
  { href: '/products', key: 'services' },
  { href: '/categories', key: 'categories' },
  { href: '/custom-builds', key: 'customBuilds' },
  { href: '/gallery', key: 'gallery' },
  { href: '/customers', key: 'customers' },
  { href: '/about', key: 'about' },
  { href: '/contact', key: 'contact' },
] as const
