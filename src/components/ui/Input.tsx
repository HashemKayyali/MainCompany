import { useId } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { type InputHTMLAttributes } from 'react'

export default function Input({
  label,
  error,
  className = '',
  id: idProp,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) {
  const generatedId = useId()
  const id = idProp || generatedId
  const { isDark } = useTheme()
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        className={`form-field ${error ? (isDark ? '!border-red-400/40' : '!border-red-300') : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-[12px] text-red-400">{error}</p>}
    </div>
  )
}
