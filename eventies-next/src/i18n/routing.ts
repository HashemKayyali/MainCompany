import { defineRouting } from 'next-intl/routing'

/**
 * ADR-03 / 08_I18N_CONSTITUTION: English keeps every indexed URL unchanged
 * (no prefix); Arabic lives under /ar/*. Locale resolution order is
 * URL → NEXT_LOCALE cookie → Accept-Language → en (next-intl default chain).
 */
export const routing = defineRouting({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
})

export type AppLocale = (typeof routing.locales)[number]
