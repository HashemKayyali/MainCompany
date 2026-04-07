import { useEffect, useMemo, useState } from 'react'
import { cn } from '../../utils/cn'
import {
  avatarInitials,
  buildAvatarDataUri,
  normalizeAvatarUrl,
  type AvatarFields,
} from '../../lib/avatar'

type UserAvatarProps = AvatarFields & {
  name?: string | null
  email?: string | null
  alt?: string
  className?: string
  imageClassName?: string
  fallbackClassName?: string
  size?: number
}

export default function UserAvatar({
  name,
  email,
  avatarUrl,
  avatarStyle,
  avatarSeed,
  avatarOptions,
  alt,
  className,
  imageClassName,
  fallbackClassName,
  size,
}: UserAvatarProps) {
  const generatedDataUri = useMemo(
    () =>
      buildAvatarDataUri(
        {
          avatarUrl,
          avatarStyle,
          avatarSeed,
          avatarOptions,
        },
        { size: size ?? 160, fallbackSeed: avatarInitials(name, email) }
      ),
    [avatarOptions, avatarSeed, avatarStyle, avatarUrl, email, name, size]
  )
  const resolvedAvatarUrl = useMemo(() => normalizeAvatarUrl(avatarUrl), [avatarUrl])
  const [uploadedImageFailed, setUploadedImageFailed] = useState(false)

  const initials = avatarInitials(name, email)
  const dimensionStyle = size ? { width: `${size}px`, height: `${size}px` } : undefined
  const imageSrc = !uploadedImageFailed && resolvedAvatarUrl ? resolvedAvatarUrl : generatedDataUri
  const decorative = !alt
  const resolvedAlt = alt || ''

  useEffect(() => {
    setUploadedImageFailed(false)
  }, [resolvedAvatarUrl])

  return (
    <div
      className={cn(
        'relative isolate flex items-center justify-center overflow-hidden',
        size ? 'shrink-0' : undefined,
        className
      )}
      style={dimensionStyle}
      aria-hidden={decorative ? true : undefined}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={resolvedAlt}
          className={cn('block h-full w-full object-cover', imageClassName)}
          draggable={false}
          onError={() => {
            if (resolvedAvatarUrl && !uploadedImageFailed) {
              setUploadedImageFailed(true)
            }
          }}
        />
      ) : (
        <span
          className={cn(
            'flex h-full w-full items-center justify-center text-[0.95em] font-display font-bold',
            fallbackClassName ||
              'bg-gradient-to-br from-prism-violet via-prism-pink to-prism-cyan text-white',
            imageClassName
          )}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
