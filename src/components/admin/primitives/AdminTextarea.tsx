import { forwardRef, useId, type ReactNode, type TextareaHTMLAttributes } from 'react'
import AdminField from './AdminField'
import { cn } from '../../../utils/cn'

export type AdminTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  /** Extra classes for the outer field wrapper (label + control + hint). */
  fieldClassName?: string
}

const AdminTextarea = forwardRef<HTMLTextAreaElement, AdminTextareaProps>(function AdminTextarea(
  { label, hint, error, fieldClassName, className, id, required, rows = 4, ...props },
  ref
) {
  const autoId = useId()
  const textareaId = id ?? autoId

  return (
    <AdminField
      label={label}
      htmlFor={textareaId}
      required={required}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        required={required}
        aria-invalid={error != null || undefined}
        className={cn('admin-input', error != null && 'admin-input--error', className)}
        {...props}
      />
    </AdminField>
  )
})

export default AdminTextarea
