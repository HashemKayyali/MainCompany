import { useEffect, useId, useMemo, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Package, Search, Users, X } from 'lucide-react'
import { useCustomersData, useProductsData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

type SearchResult = {
  type: 'product' | 'customer'
  title: string
  subtitle: string
  href: string
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return []

  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    element => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
  )
}

function getResultIndexFromElement(element: HTMLElement | null, resultsListId: string) {
  const id = element?.id || ''
  const prefix = `${resultsListId}-option-`
  if (!id.startsWith(prefix)) return -1

  const parsed = Number(id.slice(prefix.length))
  return Number.isFinite(parsed) ? parsed : -1
}

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products } = useProductsData()
  const { customers } = useCustomersData()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const dialogRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const openRouteRef = useRef('')
  const resultsListId = useId()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(-1)

  useBodyScrollLock(open)

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return []

    const normalizedQuery = query.toLowerCase()
    const matchedProducts = products
      .filter(
        product =>
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.description?.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 5)
      .map(product => ({
        type: 'product' as const,
        title: product.name,
        subtitle: product.shortDescription || '',
        href: `/products/${product.slug}`,
      }))

    const matchedCustomers = customers
      .filter(customer => customer.name.toLowerCase().includes(normalizedQuery))
      .slice(0, 3)
      .map(customer => ({
        type: 'customer' as const,
        title: customer.name,
        subtitle: 'Customer',
        href: '/customers',
      }))

    return [...matchedProducts, ...matchedCustomers]
  }, [customers, products, query])

  useEffect(() => {
    if (!open) return

    openRouteRef.current = `${location.pathname}${location.search}${location.hash}`
    previousFocusRef.current =
      typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })

    setQuery('')
    setActiveIndex(-1)

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (open) return

    const previousFocus = previousFocusRef.current
    if (
      previousFocus &&
      typeof previousFocus.focus === 'function' &&
      document.contains(previousFocus)
    ) {
      previousFocus.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const currentRoute = `${location.pathname}${location.search}${location.hash}`
    if (openRouteRef.current && openRouteRef.current !== currentRoute) {
      onClose()
    }
  }, [location.hash, location.pathname, location.search, onClose, open])

  useEffect(() => {
    if (!results.length) {
      setActiveIndex(-1)
      return
    }

    setActiveIndex(current => {
      if (current < 0) return 0
      return Math.min(current, results.length - 1)
    })
  }, [results])

  const go = useCallback(
    (href: string) => {
      onClose()
      navigate(href)
    },
    [navigate, onClose]
  )

  useEffect(() => {
    if (!open) return

    const focusResult = (index: number) => {
      const resultButton = document.getElementById(`${resultsListId}-option-${index}`)
      if (resultButton instanceof HTMLElement) {
        resultButton.focus()
      }
    }

    const handler = (event: KeyboardEvent) => {
      const activeElement =
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      const focusedResultIndex = getResultIndexFromElement(activeElement, resultsListId)
      const keyboardSearchTarget =
        activeElement === inputRef.current || focusedResultIndex >= 0

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key === 'ArrowDown' && results.length && keyboardSearchTarget) {
        event.preventDefault()
        const nextIndex =
          focusedResultIndex >= 0
            ? (focusedResultIndex + 1) % results.length
            : (activeIndex + 1 + results.length) % results.length
        setActiveIndex(nextIndex)
        if (focusedResultIndex >= 0) {
          window.requestAnimationFrame(() => focusResult(nextIndex))
        }
        return
      }

      if (event.key === 'ArrowUp' && results.length && keyboardSearchTarget) {
        event.preventDefault()
        const nextIndex =
          focusedResultIndex >= 0
            ? (focusedResultIndex <= 0 ? results.length - 1 : focusedResultIndex - 1)
            : activeIndex <= 0
              ? results.length - 1
              : activeIndex - 1
        setActiveIndex(nextIndex)
        if (focusedResultIndex >= 0) {
          window.requestAnimationFrame(() => focusResult(nextIndex))
        }
        return
      }

      const selectedIndex = focusedResultIndex >= 0 ? focusedResultIndex : activeIndex
      if (event.key === 'Enter' && keyboardSearchTarget && selectedIndex >= 0 && results[selectedIndex]) {
        event.preventDefault()
        go(results[selectedIndex].href)
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusableElements(dialogRef.current)
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey) {
        if (activeElement === first || !dialogRef.current?.contains(activeElement)) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [activeIndex, go, onClose, open, results, resultsListId])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={event => {
              event.preventDefault()
              onClose()
            }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            aria-label="Close search overlay"
            data-native-scroll
          />

          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: -18, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.975 }}
            className="fixed left-1/2 top-3 z-[101] w-full max-w-[34rem] -translate-x-1/2 px-3 sm:top-[9%] sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Search site"
            onMouseDown={event => event.stopPropagation()}
          >
            <div
              className={`overflow-hidden rounded-[24px] border shadow-2xl ${
                isDark
                  ? 'border-purple-500/18 bg-[linear-gradient(180deg,rgba(13,11,26,0.98),rgba(10,10,20,0.98))]'
                  : 'border-violet-200 bg-white'
              }`}
            >
              <div
                className={`flex min-h-[52px] items-center gap-3 px-4 py-1 sm:min-h-[56px] ${
                  isDark
                    ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]'
                    : 'bg-white'
                }`}
              >
                <Search size={17} className={isDark ? 'text-cyan-200/48' : 'text-gray-400'} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search products, customers..."
                  className={`flex-1 bg-transparent py-3 text-[14px] outline-none sm:text-[14.5px] ${
                    isDark ? 'text-white placeholder:text-purple-300/40' : 'text-gray-900 placeholder:text-gray-400'
                  }`}
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls={resultsListId}
                  aria-activedescendant={
                    activeIndex >= 0 ? `${resultsListId}-option-${activeIndex}` : undefined
                  }
                />
                <kbd
                  className={`rounded-md border px-2 py-1 text-[9px] font-mono uppercase tracking-[0.12em] ${
                    isDark ? 'border-purple-500/20 text-purple-300/40' : 'border-gray-200 text-gray-400'
                  }`}
                >
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={onClose}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] transition ${
                    isDark
                      ? 'text-purple-100/72 hover:bg-white/[0.06] hover:text-white'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-label="Close search"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              {results.length > 0 && (
                <div
                  id={resultsListId}
                  role="listbox"
                  data-native-scroll
                  className={`max-h-[min(60vh,26rem)] overflow-auto border-t ${
                    isDark ? 'border-purple-500/14' : 'border-violet-100'
                  }`}
                >
                  {results.map((result, index) => {
                    const isActive = index === activeIndex

                    return (
                      <button
                        key={`${result.type}-${result.href}-${index}`}
                        id={`${resultsListId}-option-${index}`}
                        role="option"
                        aria-selected={isActive}
                        type="button"
                        onClick={() => go(result.href)}
                        onFocus={() => setActiveIndex(index)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                          isDark
                            ? isActive
                              ? 'bg-white/[0.08] text-white'
                              : 'text-white hover:bg-white/[0.04]'
                            : isActive
                              ? 'bg-violet-50 text-gray-900'
                              : 'text-gray-900 hover:bg-violet-50/80'
                        }`}
                      >
                        <span
                          className={`inline-flex h-10 w-10 items-center justify-center rounded-[14px] border ${
                            isDark
                              ? 'border-purple-500/20 bg-white/[0.03] text-cyan-200/60'
                              : 'border-violet-200 bg-gray-50 text-gray-500'
                          }`}
                        >
                          {result.type === 'product' ? <Package size={15} /> : <Users size={15} />}
                        </span>

                        <div className="min-w-0">
                          <div className="truncate text-[14px] font-semibold sm:text-[14.5px]">
                            {result.title}
                          </div>
                          {result.subtitle && (
                            <div
                              className={`truncate text-[12px] ${
                                isDark ? 'text-purple-200/56' : 'text-gray-400'
                              }`}
                            >
                              {result.subtitle}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {query && results.length === 0 && (
                <div
                  className={`px-4 py-5 text-center ${
                    isDark ? 'text-purple-300/50' : 'text-gray-400'
                  }`}
                >
                  <div className="text-[14px] font-medium">No results found</div>
                  <div className="mt-1 text-[12px]">Try a product name or a customer brand.</div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
