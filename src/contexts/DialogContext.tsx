import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeContext'
import { useI18n } from './LanguageContext'
import { useBodyScrollLock } from '../hooks/useBodyScrollLock'

/* ── Types ── */
interface DialogOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
}

interface DialogCtx {
  /** Themed replacement for window.confirm() — returns a Promise<boolean> */
  confirm: (opts: DialogOptions) => Promise<boolean>
  /** Themed replacement for window.alert() — returns a Promise<void> */
  alert: (opts: Omit<DialogOptions, 'cancelLabel'>) => Promise<void>
}

const Ctx = createContext<DialogCtx>({
  confirm: () => Promise.resolve(false),
  alert: () => Promise.resolve(),
})

/* ── State ── */
interface DialogState extends DialogOptions {
  type: 'confirm' | 'alert'
  resolve: (value: boolean) => void
}

/* ── Provider ── */
export function DialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const confirm = useCallback(
    (opts: DialogOptions): Promise<boolean> =>
      new Promise(resolve => {
        setDialog({ ...opts, type: 'confirm', resolve })
      }),
    []
  )

  const alert = useCallback(
    (opts: Omit<DialogOptions, 'cancelLabel'>): Promise<void> =>
      new Promise(resolve => {
        setDialog({
          ...opts,
          type: 'alert',
          resolve: () => resolve(),
        })
      }),
    []
  )

  const close = (result: boolean) => {
    dialog?.resolve(result)
    setDialog(null)
  }

  const value = useMemo<DialogCtx>(() => ({ confirm, alert }), [confirm, alert])

  return (
    <Ctx.Provider value={value}>
      {children}
      <AnimatePresence>
        {dialog && (
          <DialogOverlay
            dialog={dialog}
            onConfirm={() => close(true)}
            onCancel={() => close(false)}
          />
        )}
      </AnimatePresence>
    </Ctx.Provider>
  )
}

/* ── Dialog UI ── */
function DialogOverlay({
  dialog,
  onConfirm,
  onCancel,
}: {
  dialog: DialogState
  onConfirm: () => void
  onCancel: () => void
}) {
  const { isDark } = useTheme()
  const { t, translateText, dir } = useI18n()
  useBodyScrollLock(true)

  const isAlert = dialog.type === 'alert'

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isAlert) onConfirm()
        else onCancel()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isAlert, onCancel, onConfirm])
  const variant = dialog.variant || 'danger'

  const confirmLabel = dialog.confirmLabel
    ? translateText(dialog.confirmLabel)
    : isAlert
      ? t('admin.dialog.ok')
      : t('admin.dialog.delete')
  const cancelLabel = dialog.cancelLabel ? translateText(dialog.cancelLabel) : t('admin.dialog.cancel')

  const confirmCls =
    variant === 'danger'
      ? isDark
        ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
        : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
      : variant === 'warning'
        ? isDark
          ? 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
          : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
        : isDark
          ? 'bg-purple-500/20 border-purple-500/30 text-purple-300 hover:bg-purple-500/30'
          : 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100'

  const cancelCls = isDark
    ? 'bg-white/[0.05] border-white/10 text-purple-100/80 hover:bg-white/[0.08]'
    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" data-native-scroll dir={dir}>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isAlert ? onConfirm : onCancel}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`relative w-full max-w-md rounded-2xl p-6 ${
          isDark
            ? 'bg-void-800 border border-purple-500/25'
            : 'bg-white border border-gray-200 shadow-2xl'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Title */}
        <h3
          className={`font-sans text-lg font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {translateText(dialog.title)}
        </h3>

        {/* Message */}
        <p
          className={`mt-3 text-sm leading-relaxed ${
            isDark ? 'text-purple-200/70' : 'text-gray-500'
          }`}
        >
          {translateText(dialog.message)}
        </p>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          {!isAlert && (
            <button
              onClick={onCancel}
              className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${cancelCls}`}
              autoFocus={variant === 'danger' || variant === 'warning'}
            >
              {cancelLabel}
            </button>
          )}

          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-[13px] font-semibold border transition-all ${confirmCls}`}
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export const useDialog = () => useContext(Ctx)
