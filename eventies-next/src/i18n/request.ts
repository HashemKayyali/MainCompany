import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

/**
 * Message loading per locale, split per domain (08 §Architecture).
 * Domains grow as phases land: common (P1) → catalog/forms (P2) →
 * auth/account (P3/4) → chat/notifications (P5) → admin (P6).
 * I18N-017 keeps ar out of the en bundle by loading per-locale files here.
 */
const DOMAINS = ['common', 'nav', 'footer', 'catalog', 'auth', 'forms', 'account'] as const

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale

  const entries = await Promise.all(
    DOMAINS.map(async (domain) => {
      const mod = await import(`../messages/${locale}/${domain}.json`)
      return [domain, mod.default] as const
    })
  )

  return {
    locale,
    messages: Object.fromEntries(entries),
  }
})
