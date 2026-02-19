export default function Button({ children, variant = 'primary', className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'danger' }) {
  const cls = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : 'btn-outline'
  return <button className={`${cls} ${className}`} {...props}>{children}</button>
}
