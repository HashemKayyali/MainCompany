import { useEffect, useState, type ReactNode } from 'react'
import Modal from '../ui/Modal'
import AdminButton from './primitives/AdminButton'
import AdminTextarea from './primitives/AdminTextarea'
import { useI18n } from '../../contexts/LanguageContext'

export type AdminConfirmTone = 'danger' | 'default'

export type AdminConfirmDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  tone?: AdminConfirmTone
  confirmLabel?: string
  cancelLabel?: string
  /** Show a note textarea and pass its value to onConfirm. */
  withNote?: boolean
  noteLabel?: string
  notePlaceholder?: string
  noteRequired?: boolean
  loading?: boolean
  onConfirm: (note: string) => void
  onCancel: () => void
}

/**
 * Small confirm popup built on the shared Modal. Presentation only — the
 * caller owns the confirm/cancel handlers and any async state via `loading`.
 * Supports an optional note textarea (used by request status transitions).
 */
export default function AdminConfirmDialog({
  open,
  title,
  description,
  tone = 'default',
  confirmLabel,
  cancelLabel,
  withNote = false,
  noteLabel,
  notePlaceholder,
  noteRequired = false,
  loading = false,
  onConfirm,
  onCancel,
}: AdminConfirmDialogProps) {
  const { translateText } = useI18n()
  const [note, setNote] = useState('')

  // Reset the note each time the dialog is (re)opened.
  useEffect(() => {
    if (open) setNote('')
  }, [open])

  const confirmDisabled = loading || (withNote && noteRequired && !note.trim())

  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm" dismissable={!loading}>
      <div className="admin-scope space-y-4">
        {description != null && (
          <p className="text-[13px] leading-6 text-[var(--admin-text-muted)]">{description}</p>
        )}

        {withNote && (
          <AdminTextarea
            label={noteLabel ?? translateText('Note')}
            value={note}
            onChange={event => setNote(event.target.value)}
            placeholder={notePlaceholder}
            rows={3}
            required={noteRequired}
          />
        )}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <AdminButton variant="ghost" onClick={onCancel} disabled={loading} className="sm:min-w-[110px]">
            {cancelLabel ?? translateText('Cancel')}
          </AdminButton>
          <AdminButton
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => onConfirm(note)}
            loading={loading}
            disabled={confirmDisabled}
            className="sm:min-w-[110px]"
          >
            {confirmLabel ?? translateText('Confirm')}
          </AdminButton>
        </div>
      </div>
    </Modal>
  )
}
