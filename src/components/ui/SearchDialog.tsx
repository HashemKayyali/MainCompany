import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Package, Search, Users } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

type SearchResult = {
  type: 'product' | 'customer'
  title: string
  subtitle: string
  href: string
}

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, customers } = useData()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return

    const timeout = window.setTimeout(() => inputRef.current?.focus(), 100)
    setQuery('')
    return () => window.clearTimeout(timeout)
  }, [open])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
      }

      if (event.key === 'Escape' && open) {
        onClose()
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, open])

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

  const go = (href: string) => {
    navigate(href)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
            data-native-scroll
          />

          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.975 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.975 }}
            className="fixed left-1/2 top-[12%] z-[101] w-full max-w-[31rem] -translate-x-1/2 px-3.5 sm:px-4"
            role="dialog"
            aria-modal="true"
            aria-label="Search site"
          >
            <div
              className={`overflow-hidden rounded-[22px] border shadow-2xl ${
                isDark ? 'border-purple-500/18 bg-[linear-gradient(180deg,rgba(13,11,26,0.98),rgba(10,10,20,0.98))]' : 'border-violet-200 bg-white'
              }`}
            >
              <div className={`flex items-center gap-3 px-4 py-0.5 ${isDark ? 'bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]' : 'bg-white'}`}>
                <Search size={16} className={isDark ? 'text-cyan-200/48' : 'text-gray-400'} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search products, customers..."
                  className={`flex-1 bg-transparent py-3 text-[13.5px] outline-none ${
                    isDark ? 'text-white placeholder:text-purple-300/40' : 'text-gray-900 placeholder:text-gray-400'
                  }`}
                />
                <kbd
                  className={`rounded-md border px-1.5 py-0.5 text-[9px] font-mono ${
                    isDark ? 'border-purple-500/20 text-purple-300/40' : 'border-gray-200 text-gray-400'
                  }`}
                >
                  ESC
                </kbd>
              </div>

              {results.length > 0 && (
                <div data-native-scroll className={`max-h-64 overflow-auto border-t ${isDark ? 'border-purple-500/14' : 'border-violet-100'}`}>
                  {results.map((result, index) => (
                    <button
                      key={`${result.type}-${result.href}-${index}`}
                      type="button"
                      onClick={() => go(result.href)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        isDark ? 'text-white hover:bg-white/[0.04]' : 'text-gray-900 hover:bg-violet-50/80'
                      }`}
                    >
                      <span
                        className={`inline-flex h-8 w-8 items-center justify-center rounded-[12px] border ${
                          isDark
                            ? 'border-purple-500/20 bg-white/[0.03] text-cyan-200/60'
                            : 'border-violet-200 bg-gray-50 text-gray-500'
                        }`}
                      >
                        {result.type === 'product' ? <Package size={13} /> : <Users size={13} />}
                      </span>

                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-semibold">{result.title}</div>
                        {result.subtitle && (
                          <div className={`truncate text-[11px] ${isDark ? 'text-purple-200/56' : 'text-gray-400'}`}>
                            {result.subtitle}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {query && results.length === 0 && (
                <div className={`px-4 py-5 text-center ${isDark ? 'text-purple-300/50' : 'text-gray-400'}`}>
                  <div className="text-[13px] font-medium">No results found</div>
                  <div className="mt-1 text-[11px]">Try a product name or a customer brand.</div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
