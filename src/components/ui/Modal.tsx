import { useEffect, useId } from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  /**
   * When true, clicking the backdrop does NOT close the modal.
   * Only explicit actions (Cancel button, X button) can close it.
   * Use for edit/create forms where losing data would be bad.
   */
  persistent?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  contentClassName?: string
  bodyClassName?: string
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-[37rem]',
  lg: 'max-w-[48rem]',
  xl: 'max-w-[58rem]',
  '2xl': 'max-w-[66rem]',
  full: 'max-w-[min(78rem,calc(100vw-1rem))]',
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  persistent = false,
  size = 'md',
  contentClassName = '',
  bodyClassName = '',
}: ModalProps) {
  const { isDark } = useTheme()
  const titleId = useId()
  const topOffsetClass = 'pt-[48px] sm:pt-[54px] lg:pt-[60px]'
  const bottomOffsetClass = 'pb-2 sm:pb-2.5'
  const panelClass = isDark
    ? 'bg-[linear-gradient(145deg,rgba(10,14,32,0.98),rgba(7,10,24,0.99))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_32px_96px_-62px_rgba(7,17,42,0.98)]'
    : 'bg-white border border-gray-200 shadow-2xl'

  const handleBackdropClick = () => {
    if (!persistent) onClose()
  }

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-native-scroll
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/58 backdrop-blur-[3px]"
          />

          <div className={cn('relative flex min-h-full items-start justify-center px-2.5 sm:px-3.5', topOffsetClass, bottomOffsetClass)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative flex w-full ${SIZE_CLASSES[size]} max-h-[calc(100dvh-60px)] flex-col overflow-hidden rounded-[19px] sm:max-h-[calc(100dvh-68px)] lg:max-h-[calc(100dvh-76px)] ${panelClass} ${contentClassName}`}
              onClick={e => e.stopPropagation()}
            >
              <div
                className={`sticky top-0 z-20 flex items-start justify-between gap-3 border-b px-2.75 pb-2.25 pt-2.75 sm:px-3.25 sm:pb-2.5 sm:pt-3 ${
                  isDark
                    ? 'border-cyan-400/10 bg-[linear-gradient(180deg,rgba(11,15,34,0.98),rgba(11,15,34,0.92))] backdrop-blur-xl'
                    : 'border-gray-200 bg-white/92 backdrop-blur-xl'
                }`}
              >
                <h2 id={titleId} className={`font-display text-[0.9rem] font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h2>

                <button
                  type="button"
                  onClick={onClose}
                    className={`inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[11px] transition ${
                    isDark
                      ? 'bg-[#101933]/92 text-purple-100/78 ring-1 ring-inset ring-cyan-400/10 hover:bg-[#132043] hover:text-white'
                      : 'bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-white hover:text-gray-800'
                  }`}
                  aria-label="Close modal"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              <div data-native-scroll className={cn('min-h-0 flex-1 overflow-y-auto px-2.75 pb-2.75 pt-2.25 sm:px-3.25 sm:pb-3 sm:pt-2.5', bodyClassName)}>{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
