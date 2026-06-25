import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline' | 'danger'
  children?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', className = '', ...props }, ref) => {
    const cls =
      variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-outline'
    return (
      <button ref={ref} className={`${cls} ${className}`} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
