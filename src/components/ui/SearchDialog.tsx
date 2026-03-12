import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'

export default function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { products, customers } = useData()
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 100); setQuery('') }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); if (!open) return }
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const prods = products.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)).slice(0, 5).map(p => ({ type: 'product' as const, title: p.name, subtitle: p.shortDescription || '', href: `/products/${p.slug}` }))
    const custs = customers.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3).map(c => ({ type: 'customer' as const, title: c.name, subtitle: 'Customer', href: '/customers' }))
    return [...prods, ...custs]
  }, [query, products, customers])

  const go = (href: string) => { navigate(href); onClose() }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
          <motion.div initial={{ opacity: 0, y: -20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.97 }} className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101] px-4">
            <div className={`rounded-2xl border overflow-hidden shadow-2xl ${isDark ? 'bg-[#0d0b1a] border-purple-500/20' : 'bg-white border-violet-200'}`}>
              <div className="flex items-center gap-3 px-5">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className={isDark ? 'text-purple-300/50' : 'text-gray-400'}><circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" /></svg>
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search products, customers..." className={`flex-1 py-4 text-base outline-none bg-transparent ${isDark ? 'text-white placeholder:text-purple-300/40' : 'text-gray-900 placeholder:text-gray-400'}`} />
                <kbd className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isDark ? 'border-purple-500/20 text-purple-300/40' : 'border-gray-200 text-gray-400'}`}>ESC</kbd>
              </div>
              {results.length > 0 && (
                <div className={`border-t max-h-72 overflow-auto ${isDark ? 'border-purple-500/15' : 'border-violet-100'}`}>
                  {results.map((r, i) => (
                    <button key={i} onClick={() => go(r.href)} className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${isDark ? 'hover:bg-purple-500/10 text-white' : 'hover:bg-violet-50 text-gray-900'}`}>
                      <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${isDark ? 'border-purple-500/20 text-purple-300/50' : 'border-violet-200 text-gray-400'}`}>{r.type === 'product' ? '📦' : '👤'}</span>
                      <div className="min-w-0"><div className="text-sm font-medium truncate">{r.title}</div>{r.subtitle && <div className={`text-xs truncate ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>{r.subtitle}</div>}</div>
                    </button>
                  ))}
                </div>
              )}
              {query && results.length === 0 && <div className={`px-5 py-6 text-center text-sm ${isDark ? 'text-purple-300/50' : 'text-gray-400'}`}>No results found</div>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
