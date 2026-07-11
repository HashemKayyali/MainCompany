import type { routing } from '@/i18n/routing'
import type common from '../messages/en/common.json'
import type nav from '../messages/en/nav.json'
import type footer from '../messages/en/footer.json'
import type catalog from '../messages/en/catalog.json'

/** FOUND-011: typed message keys — a missing/typo'd key is a compile error. */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: {
      common: typeof common
      nav: typeof nav
      footer: typeof footer
      catalog: typeof catalog
    }
  }
}
