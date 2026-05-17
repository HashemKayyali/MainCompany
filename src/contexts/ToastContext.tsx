import { createContext, useContext, useMemo, useRef, useState, useCallback, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info'

interface Toast { id: number; message: string; type: ToastType }

interface ToastCtx { toast: (message: string, type?: ToastType) => void }

const Ctx = createContext<ToastCtx>({} as ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const idRef = useRef(0)

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++idRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const colors: Record<ToastType, string> = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-cyan-50 border-cyan-200 text-cyan-800',
  }

  const value = useMemo<ToastCtx>(() => ({ toast: addToast }), [addToast])

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="fixed bottom-6 right-6 z-[999] space-y-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`px-4 py-3 rounded-xl border backdrop-blur-xl text-sm font-medium pointer-events-auto ${colors[t.type]}`}
            >
              {t.type === 'success' && '✅ '}{t.type === 'error' && '❌ '}{t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  )
}

export const useToast = () => useContext(Ctx)
