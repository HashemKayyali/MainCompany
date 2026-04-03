import { useTheme } from '../../contexts/ThemeContext'
import { type TextareaHTMLAttributes } from 'react'
export default function Textarea({ label, error, className = '', id, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; error?: string }) {
  const { isDark } = useTheme()
  return <div>{label && <label htmlFor={id} className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>{label}</label>}<textarea id={id} className={`form-field resize-none ${error ? '!border-red-400/40' : ''} ${className}`} {...props} />{error && <p className="mt-1.5 text-[12px] text-red-400">{error}</p>}</div>
}
