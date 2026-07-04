import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cn } from '../../utils/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Blocks backdrop-click and Escape from closing (e.g. unsaved forms). */
  persistent?: boolean
  /** Alias-style opt-out of dismiss affordances; defaults to dismissable. */
  dismissable?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  overlayClassName?: string
  contentClassName?: string
  bodyClassName?: string
  /** Optional sticky footer region (actions). Stays visible while the body scrolls. */
  footer?: ReactNode
  /** Mobile presentation. Fullscreen is intended for dense editor flows. */
  mobilePresentation?: 'sheet' | 'fullscreen'
}

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-[37rem]',
  lg: 'sm:max-w-[48rem]',
  xl: 'sm:max-w-[58rem]',
  '2xl': 'sm:max-w-[66rem]',
  '3xl': 'sm:max-w-[min(90rem,calc(100vw-2rem))]',
  full: 'sm:max-w-[min(78rem,calc(100vw-1rem))]',
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
  dismissable = true,
  size = 'md',
  overlayClassName = '',
  contentClassName = '',
  bodyClassName = '',
  footer,
  mobilePresentation,
}: ModalProps) {
  const { translateText, dir } = useI18n()
  const isDesktop = useMediaQuery('(min-width: 640px)', true)
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Backdrop / Escape only dismiss when both flags allow it.
  const canDismiss = dismissable && !persistent

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
        if (!canDismiss) return

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
  }, [canDismiss, onClose, open])

  const handleBackdropClick = () => {
    if (canDismiss) onClose()
  }

  // Portal to <body> so the overlay escapes any ancestor that establishes
  // a containing block / clips it (e.g. ProductCard has `overflow-hidden`
  // + framer-motion transforms — a nested `position: fixed` would be
  // trapped inside the card instead of covering the viewport).
  if (typeof document === 'undefined') return null

  // Dense dialogs use a true viewport-sized workspace on phones by default.
  // Small/medium dialogs keep the compact bottom-sheet treatment. Callers can
  // still override this explicitly when a flow needs a specific presentation.
  const resolvedMobilePresentation =
    mobilePresentation ?? (['lg', 'xl', '2xl', '3xl', 'full'].includes(size) ? 'fullscreen' : 'sheet')

  const panelMotion = isDesktop
    ? {
        initial: { opacity: 0, scale: 0.96, y: 10 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.96 },
        transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
      }
    : resolvedMobilePresentation === 'fullscreen'
      ? {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 12 },
          transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
        }
      : {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
          transition: { type: 'spring' as const, stiffness: 360, damping: 34 },
        }

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className={cn('fixed inset-0 z-[100] overflow-y-auto', overlayClassName)}
          onClick={handleBackdropClick}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          data-native-scroll
          dir={dir}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          <div
            className={cn(
              'relative flex min-h-full justify-center',
              resolvedMobilePresentation === 'fullscreen' ? 'items-stretch' : 'items-end',
              'sm:items-start sm:px-3.5 sm:pt-5 sm:pb-[max(0.875rem,env(safe-area-inset-bottom))] lg:pt-6'
            )}
          >
            <motion.div
              ref={panelRef}
              {...panelMotion}
              className={cn(
                'relative flex w-full flex-col overflow-hidden border border-violet-200/65 bg-white',
                'shadow-[0_32px_96px_-22px_rgba(124,58,237,0.32),0_8px_28px_-8px_rgba(124,58,237,0.18)]',
                resolvedMobilePresentation === 'fullscreen'
                  ? 'h-[100dvh] max-h-[100dvh] rounded-none border-x-0 border-y-0'
                  : 'max-h-[92dvh] rounded-t-[24px]',
                // Desktop centered
                'sm:h-auto sm:max-h-[calc(100dvh-40px)] sm:rounded-[22px] sm:border lg:max-h-[calc(100dvh-52px)]',
                SIZE_CLASSES[size],
                contentClassName
              )}
              onClick={event => event.stopPropagation()}
            >
              {/* Mobile drag handle is only shown for bottom sheets. */}
              {resolvedMobilePresentation === 'sheet' && (
                <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
                  <span className="h-1.5 w-11 rounded-full bg-violet-200" />
                </div>
              )}

              <div className="sticky top-0 z-20 flex items-start justify-between gap-3 border-b border-violet-100 bg-white/95 px-3 pb-3 pt-2.5 backdrop-blur-xl sm:px-4 sm:pb-3.5 sm:pt-3.5">
                <h2
                  id={titleId}
                  dir="auto"
                  className="min-w-0 flex-1 text-start font-sans text-[0.98rem] font-bold text-[#1a0b3d] sm:text-[1.04rem]"
                >
                  {translateText(title)}
                </h2>

                <button
                  ref={closeButtonRef}
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 transition hover:bg-violet-100 hover:text-violet-900"
                  aria-label={translateText('Close')}
                >
                  <X size={18} strokeWidth={2.2} />
                </button>
              </div>

              <div
                data-native-scroll
                className={cn(
                  'min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3.5 pt-2.75 [-webkit-overflow-scrolling:touch] sm:px-4 sm:pb-4 sm:pt-3',
                  bodyClassName
                )}
              >
                {children}
              </div>

              {footer && (
                <div className="sticky bottom-0 z-20 border-t border-violet-100 bg-white/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl sm:px-4 sm:pb-3.5 sm:pt-3.5">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
