import { useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
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
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const topOffsetClass = 'pt-3 sm:pt-5 lg:pt-6'
  const bottomOffsetClass =
    'pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-[max(0.875rem,env(safe-area-inset-bottom))]'
  const panelClass = isDark
    ? 'bg-[linear-gradient(145deg,rgba(10,14,32,0.98),rgba(7,10,24,0.99))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_32px_96px_-62px_rgba(7,17,42,0.98)]'
    : 'bg-white border border-gray-200 shadow-2xl'

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current =
      typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    const frame = window.requestAnimationFrame(() => {
      const focusable = getFocusableElements(panelRef.current)
      if (focusable.length) {
        focusable[0].focus()
        return
      }

      closeButtonRef.current?.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open])

  useEffect(() => {
    if (open) return

    const previousFocus = previousFocusRef.current
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus()
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (persistent) return

        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab') return

      const focusable = getFocusableElements(panelRef.current)
      if (!focusable.length) {
        event.preventDefault()
        closeButtonRef.current?.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const activeElement =
        typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null

      if (event.shiftKey) {
        if (activeElement === first || !panelRef.current?.contains(activeElement)) {
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

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open, persistent])

  const handleBackdropClick = () => {
    if (!persistent) onClose()
  }

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

          <div
            className={cn(
              'relative flex min-h-full items-start justify-center px-2.5 sm:px-3.5',
              topOffsetClass,
              bottomOffsetClass
            )}
          >
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`relative flex w-full ${SIZE_CLASSES[size]} max-h-[calc(100dvh-24px)] flex-col overflow-hidden rounded-[22px] sm:max-h-[calc(100dvh-40px)] lg:max-h-[calc(100dvh-52px)] ${panelClass} ${contentClassName}`}
              onClick={event => event.stopPropagation()}
            >
              <div
                className={`sticky top-0 z-20 flex items-start justify-between gap-3 border-b px-3 pb-3 pt-3 sm:px-4 sm:pb-3.5 sm:pt-3.5 ${
                  isDark
                    ? 'border-cyan-400/10 bg-[linear-gradient(180deg,rgba(11,15,34,0.98),rgba(11,15,34,0.92))] backdrop-blur-xl'
                    : 'border-gray-200 bg-white/92 backdrop-blur-xl'
                }`}
              >
                <h2
                  id={titleId}
                  className={`font-display text-[0.98rem] font-bold sm:text-[1.04rem] ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {title}
                </h2>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] transition ${
                    isDark
                      ? 'bg-[#101933]/92 text-purple-100/78 ring-1 ring-inset ring-cyan-400/10 hover:bg-[#132043] hover:text-white'
                      : 'bg-gray-50 text-gray-500 ring-1 ring-inset ring-gray-200 hover:bg-white hover:text-gray-800'
                  }`}
                  aria-label="Close modal"
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              <div
                data-native-scroll
                className={cn(
                  'min-h-0 flex-1 overflow-y-auto px-3 pb-3.5 pt-2.75 sm:px-4 sm:pb-4 sm:pt-3',
                  bodyClassName
                )}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
