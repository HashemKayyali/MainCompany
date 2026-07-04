import type { ReactNode } from 'react'
import Modal from '../ui/Modal'
import AdminButton from './primitives/AdminButton'
import { useI18n } from '../../contexts/LanguageContext'

export type AdminFormModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** Called when the primary submit button is pressed. */
  onSubmit: () => void
  submitLabel?: string
  cancelLabel?: string
  /** Disables inputs implicitly by disabling the footer buttons + showing spinner. */
  submitting?: boolean
  /** Independently disable the submit button (e.g. invalid form). */
  submitDisabled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  /** Extra actions rendered at the start of the footer (e.g. secondary buttons). */
  footerStart?: ReactNode
}

/**
 * Thin wrapper over the shared Modal that standardises admin form layout:
 * consistent body spacing and a sticky footer with Cancel + Save
 * (AdminButton `loading`). The modal is persistent while submitting so an
 * in-flight save cannot be dismissed by mistake.
 */
export default function AdminFormModal({
  open,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel,
  cancelLabel,
  submitting = false,
  submitDisabled = false,
  size = 'xl',
  footerStart,
}: AdminFormModalProps) {
  const { translateText } = useI18n()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      dismissable={!submitting}
      footer={
        <div className="flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">{footerStart}</div>
          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
            <AdminButton variant="ghost" onClick={onClose} disabled={submitting} className="sm:min-w-[110px]">
              {cancelLabel ?? translateText('Cancel')}
            </AdminButton>
            <AdminButton
              onClick={onSubmit}
              loading={submitting}
              disabled={submitDisabled}
              className="sm:min-w-[130px]"
            >
              {submitLabel ?? translateText('Save')}
            </AdminButton>
          </div>
        </div>
      }
    >
      <div className="admin-scope space-y-4">{children}</div>
    </Modal>
  )
}
