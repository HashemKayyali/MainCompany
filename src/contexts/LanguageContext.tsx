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
const I18N_OBSERVER_OPTIONS: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  attributes: true,
  attributeFilter: [...TRANSLATABLE_ATTRS],
}

// Text blocks should follow the language of their own content rather than the
// page shell. This matters in Arabic mode because product/category data is
// intentionally stored in English and must stay visually LTR.
const NATURAL_DIRECTION_BLOCK_SELECTOR = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'dt',
  'dd',
  'blockquote',
  'figcaption',
  'td',
  'th',
  '[data-bidi-auto]',
].join(',')

const NATURAL_DIRECTION_LEAF_TAGS = new Set([
  'DIV',
  'SPAN',
  'SMALL',
  'STRONG',
  'EM',
  'B',
  'I',
  'A',
  'BUTTON',
  'BDI',
])

const ARABIC_STRONG_RE = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/
const LATIN_STRONG_RE = /[A-Za-z\u00c0-\u024f]/

function getNaturalDirection(value: string): 'ltr' | 'rtl' | null {
  for (const character of value) {
    if (ARABIC_STRONG_RE.test(character)) return 'rtl'
    if (LATIN_STRONG_RE.test(character)) return 'ltr'
  }
  return null
}

function hasMeaningfulDirectText(element: Element) {
  return Array.from(element.childNodes).some(
    node => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())
  )
}

function isBidiManaged(element: HTMLElement) {
  return element.dataset.bidiManaged === 'true'
}

function canManageDirection(element: HTMLElement) {
  const currentDir = element.getAttribute('dir')
  if (element.hasAttribute('data-bidi-fixed')) return false
  if ((currentDir === 'ltr' || currentDir === 'rtl') && !isBidiManaged(element)) return false
  return true
}

function applyNaturalTextDirections() {
  if (typeof document === 'undefined' || !document.body) return

  const candidates = new Set<HTMLElement>()

  document.body
    .querySelectorAll<HTMLElement>(NATURAL_DIRECTION_BLOCK_SELECTOR)
    .forEach(element => candidates.add(element))

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const element = node as HTMLElement
      if (!NATURAL_DIRECTION_LEAF_TAGS.has(element.tagName)) {
        return NodeFilter.FILTER_SKIP
      }

      const isLeafText = element.childElementCount === 0 && hasMeaningfulDirectText(element)
      const wrapsSingleBidi =
        element.childElementCount === 1 &&
        element.firstElementChild?.tagName === 'BDI' &&
        !hasMeaningfulDirectText(element)

      return isLeafText || wrapsSingleBidi
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_SKIP
    },
  })

  while (walker.nextNode()) candidates.add(walker.currentNode as HTMLElement)

  for (const element of candidates) {
    if (element.closest('[data-i18n-manual]')) continue
    if (!canManageDirection(element)) continue
    const direction = getNaturalDirection(element.textContent ?? '')
    if (!direction) continue

    if (element.getAttribute('dir') !== direction) element.setAttribute('dir', direction)
    if (!isBidiManaged(element)) element.dataset.bidiManaged = 'true'
  }

  document.body
    .querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input:not([dir]), textarea:not([dir])')
    .forEach(element => element.setAttribute('dir', 'auto'))
}

function shouldSkipElement(element: Element | null) {
  if (!element) return true
  if (SKIP_TAGS.has(element.tagName)) return true
  if (element.closest('[data-i18n-skip], [data-i18n-manual]')) return true
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

    applyNaturalTextDirections()
  }, [locale])

  const scheduleApply = useCallback(() => {
    if (typeof window === 'undefined') return
    if (pendingRef.current !== null) return
    pendingRef.current = window.requestAnimationFrame(() => {
      pendingRef.current = null

      // Translation itself mutates text nodes. Temporarily disconnect the
      // observer so those internal writes do not schedule a second full DOM
      // pass immediately after the first one. The current pass already scans
      // the latest document state, so no user-visible behavior changes.
      const observer = observerRef.current
      observer?.disconnect()
      try {
        applyTranslations()
      } finally {
        if (observer && document.body) {
          observer.observe(document.body, I18N_OBSERVER_OPTIONS)
        }
      }
    })
  }, [applyTranslations])

  useEffect(() => {
    scheduleApply()

    if (typeof document === 'undefined' || !document.body) return undefined
    observerRef.current?.disconnect()
    observerRef.current = new MutationObserver(mutations => {
      const needsApply = mutations.some(mutation => {
        const target = mutation.target instanceof Element
          ? mutation.target
          : mutation.target.parentElement
        return !target?.closest('[data-i18n-manual]')
      })

      if (needsApply) scheduleApply()
    })
    observerRef.current.observe(document.body, I18N_OBSERVER_OPTIONS)

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
