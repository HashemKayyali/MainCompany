import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import AdminField from './AdminField'
import { cn } from '../../../utils/cn'

export type AdminInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  /** Extra classes for the outer field wrapper (label + control + hint). */
  fieldClassName?: string
}

const AdminInput = forwardRef<HTMLInputElement, AdminInputProps>(function AdminInput(
  { label, hint, error, fieldClassName, className, id, required, ...props },
  ref
) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <AdminField
      label={label}
      htmlFor={inputId}
      required={required}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={error != null || undefined}
        className={cn('admin-input', error != null && 'admin-input--error', className)}
        {...props}
      />
    </AdminField>
  )
})

export default AdminInput
