import { cn } from '../../utils/cn'

/**
 * Avatar feature has been fully removed (no uploads, no generated avatars,
 * no avatar columns in the database). This component renders a simple,
 * non-configurable initials chip derived from the name/email so identity
 * circles in the navbar / sidebar / admin lists stay consistent.
 */
type UserAvatarProps = {
  name?: string | null
  email?: string | null
  alt?: string
  className?: string
  fallbackClassName?: string
  size?: number
}

function initialsFrom(name?: string | null, email?: string | null) {
  const source = (name || '').trim() || (email || '').trim()
  if (!source) return 'U'
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  if (parts.length === 0) return source.slice(0, 2).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function UserAvatar({
  name,
  email,
  alt,
  className,
  fallbackClassName,
  size,
}: UserAvatarProps) {
  const initials = initialsFrom(name, email)
  const dimensionStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined
  const decorative = !alt

  return (
    <div
      className={cn(
        'relative isolate flex items-center justify-center overflow-hidden',
        size ? 'shrink-0' : undefined,
        className
      )}
      style={dimensionStyle}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : alt}
    >
      <span
        className={cn(
          'flex h-full w-full items-center justify-center text-[0.95em] font-display font-bold',
          fallbackClassName || 'bg-[linear-gradient(135deg,#7c3aed,#c026d3)] text-white'
        )}
      >
        {initials}
      </span>
    </div>
  )
}
