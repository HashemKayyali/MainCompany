import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../contexts/ThemeContext'

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
}

export default function Modal({ open, onClose, title, children, persistent = false }: ModalProps) {
  const { isDark } = useTheme()

  const handleBackdropClick = () => {
    if (!persistent) onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl p-7 ${
              isDark
                ? 'bg-void-800 border border-purple-500/25'
                : 'bg-white border border-gray-200 shadow-2xl'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <h2
              className={`font-display text-xl font-bold mb-6 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {title}
            </h2>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
