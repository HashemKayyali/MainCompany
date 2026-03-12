interface Props {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
}

/**
 * Image with width/height (prevents CLS), lazy loading, and optional srcSet
 * for Supabase Storage images.
 */
export default function OptimizedImage({
  src, alt, width, height, className = '', sizes, loading = 'lazy',
}: Props) {
  const supabaseTransform = (w: number) =>
    src?.includes('supabase') ? `${src}?width=${w}&resize=contain` : src

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      className={className}
      sizes={sizes || '(max-width: 768px) 100vw, 33vw'}
      srcSet={
        src?.includes('supabase')
          ? `${supabaseTransform(400)} 400w, ${supabaseTransform(800)} 800w, ${supabaseTransform(1200)} 1200w`
          : undefined
      }
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}
