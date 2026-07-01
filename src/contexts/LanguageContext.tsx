import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  LOCALE_STORAGE_KEY,
  getDirection,
  isLocale,
  setLocale as setGlobalLocale,
  translate,
  translateVisibleText,
  type Locale,
} from '../lib/i18n'

type LanguageContextValue = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  setLocale: (locale: Locale) => void
  toggleLocale: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
  translateText: (value: string) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en'
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    return isLocale(stored) ? stored : 'en'
  } catch {
    return 'en'
  }
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA'])
const TRANSLATABLE_ATTRS = ['placeholder', 'aria-label', 'title', 'alt'] as const

function shouldSkipElement(element: Element | null) {
  if (!element) return true
  if (SKIP_TAGS.has(element.tagName)) return true
  if (element.closest('[data-i18n-skip]')) return true
  if (element instanceof HTMLElement && element.isContentEditable) return true
  return false
}

function DocumentI18nBridge({ locale }: { locale: Locale }) {
  const textOriginals = useRef(new WeakMap<Text, string>())
  const attrOriginals = useRef(new WeakMap<Element, Map<string, string>>())
  const observerRef = useRef<MutationObserver | null>(null)
  const pendingRef = useRef<number | null>(null)

  const applyTranslations = useCallback(() => {
    if (typeof document === 'undefined' || !document.body) return

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement
        if (!node.textContent?.trim() || shouldSkipElement(parent)) {
          return NodeFilter.FILTER_REJECT
        }
        return NodeFilter.FILTER_ACCEPT
      },
    })

    const textNodes: Text[] = []
    while (walker.nextNode()) textNodes.push(walker.currentNode as Text)

    for (const node of textNodes) {
      const originals = textOriginals.current
      const current = node.textContent ?? ''
      const storedOriginal = originals.get(node)

      if (locale === 'en') {
        if (storedOriginal && current !== storedOriginal) node.textContent = storedOriginal
        continue
      }

      const base = storedOriginal ?? current
      const next = translateVisibleText(base, locale)
      if (next !== base) {
        if (!storedOriginal) originals.set(node, base)
        if (current !== next) node.textContent = next
      }
    }

    const elements = Array.from(document.body.querySelectorAll<HTMLElement>(
      TRANSLATABLE_ATTRS.map(attr => `[${attr}]`).join(',')
    ))

    for (const element of elements) {
      if (shouldSkipElement(element)) continue

      let attrMap = attrOriginals.current.get(element)
      if (!attrMap) {
        attrMap = new Map<string, string>()
        attrOriginals.current.set(element, attrMap)
      }

      for (const attr of TRANSLATABLE_ATTRS) {
        const current = element.getAttribute(attr)
        if (!current?.trim()) continue
        const storedOriginal = attrMap.get(attr)

        if (locale === 'en') {
          if (storedOriginal && current !== storedOriginal) element.setAttribute(attr, storedOriginal)
          continue
        }

        const base = storedOriginal ?? current
        const next = translateVisibleText(base, locale)
        if (next !== base) {
          if (!storedOriginal) attrMap.set(attr, base)
          if (current !== next) element.setAttribute(attr, next)
        }
      }
    }
  }, [locale])

  const scheduleApply = useCallback(() => {
    if (typeof window === 'undefined') return
    if (pendingRef.current !== null) return
    pendingRef.current = window.requestAnimationFrame(() => {
      pendingRef.current = null
      applyTranslations()
    })
  }, [applyTranslations])

  useEffect(() => {
    scheduleApply()

    if (typeof document === 'undefined' || !document.body) return undefined
    observerRef.current?.disconnect()
    observerRef.current = new MutationObserver(scheduleApply)
    observerRef.current.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRS],
    })

    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
      if (pendingRef.current !== null) {
        window.cancelAnimationFrame(pendingRef.current)
        pendingRef.current = null
      }
    }
  }, [scheduleApply])

  return null
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => readInitialLocale())
  const dir = getDirection(locale)

  useEffect(() => {
    setGlobalLocale(locale)
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale
      document.documentElement.dir = dir
      document.documentElement.dataset.locale = locale
    }
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // Local storage can be unavailable in private or embedded contexts.
    }
  }, [dir, locale])

  const setLocale = useCallback((next: Locale) => setLocaleState(next), [])
  const toggleLocale = useCallback(
    () => setLocaleState(current => (current === 'en' ? 'ar' : 'en')),
    []
  )

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      dir,
      setLocale,
      toggleLocale,
      t: (key, vars) => translate(locale, key, vars),
      translateText: value => translateVisibleText(value, locale),
    }),
    [dir, locale, setLocale, toggleLocale]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
      <DocumentI18nBridge locale={locale} />
    </LanguageContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useI18n must be used within LanguageProvider')
  }
  return context
}
