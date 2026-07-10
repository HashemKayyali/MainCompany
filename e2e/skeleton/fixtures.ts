import { test as base } from '@playwright/test'

/**
 * BASE-008 — shared fixtures for the Phase 0 E2E skeleton.
 *
 * `appLocale` comes from the project metadata (en/ar × desktop/mobile grid).
 * `localePath` maps an app path to its locale variant. The production Vite app
 * is EN-only, so today every locale maps to the same URL; when the Next app
 * introduces `/ar` (FOUND-010/030), only LOCALE_PREFIXES changes and the whole
 * suite becomes locale-real without touching specs.
 */
export type AppLocale = 'en' | 'ar'

const LOCALE_PREFIXES: Record<AppLocale, string> = {
  en: '',
  // Vite baseline: AR routes do not exist yet — same URL space as EN.
  // Next target (FOUND-030): change to '/ar'.
  ar: '',
}

type SkeletonFixtures = {
  appLocale: AppLocale
  localePath: (path: string) => string
}

export const test = base.extend<SkeletonFixtures>({
  appLocale: [
    async ({}, use, testInfo) => {
      const locale = (testInfo.project.metadata?.appLocale as AppLocale) ?? 'en'
      await use(locale)
    },
    { auto: false },
  ],
  localePath: async ({ appLocale }, use) => {
    const prefix = LOCALE_PREFIXES[appLocale]
    await use((path: string) => `${prefix}${path.startsWith('/') ? path : `/${path}`}`)
  },
})

export { expect } from '@playwright/test'
