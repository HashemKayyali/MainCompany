import type { routing } from '@/i18n/routing'
import type common from '../messages/en/common.json'

/** FOUND-011: typed message keys — a missing/typo'd key is a compile error. */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number]
    Messages: {
      common: typeof common
    }
  }
}
