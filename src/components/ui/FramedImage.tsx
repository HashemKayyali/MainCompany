import {
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useState,
  type ImgHTMLAttributes,
} from 'react'
import {
  getMediaObjectStyle,
  parseMediaValue,
  type MediaFit,
  type MediaFrameTransform,
} from '../../utils/media-frame'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  media?: string
  fallbackTransform?: Partial<MediaFrameTransform>
  extraScale?: number
  revealMode?: 'soft' | 'crisp'
}

const RESPONSIVE_WIDTHS = [320, 480, 640, 960, 1280, 1600]
const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

function buildResponsiveSrc(src: string, width: number, fit: MediaFit) {
  try {
    const url = new URL(src)
    url.searchParams.set('width', String(width))
    url.searchParams.set('quality', '82')
    url.searchParams.set('resize', fit === 'contain' ? 'contain' : 'cover')
    return url.toString()
  } catch {
    return src
  }
}

function buildSrcSet(src: string, fit: MediaFit) {
  if (!src || !src.includes('supabase')) return undefined

  return RESPONSIVE_WIDTHS.map(width => `${buildResponsiveSrc(src, width, fit)} ${width}w`).join(', ')
}

const FramedImage = memo(
  forwardRef<HTMLImageElement, Props>(function FramedImage(
    {
      media = '',
      fallbackTransform,
      extraScale,
      revealMode = 'crisp',
      style,
      className,
      loading = 'lazy',
      decoding = 'async',
      sizes,
      fetchPriority,
      onLoad,
      onError,
      ...props
    },
    ref
  ) {
    const parsed = useMemo(() => parseMediaValue(media, fallbackTransform), [fallbackTransform, media])
    const objectStyle = useMemo(
      () => getMediaObjectStyle(media, { fallback: fallbackTransform, extraScale }),
      [extraScale, fallbackTransform, media]
    )
    const srcSet = useMemo(
      () => buildSrcSet(parsed.src, parsed.transform.fit),
      [parsed.src, parsed.transform.fit]
    )

    const [isLoaded, setIsLoaded] = useState(false)

    useEffect(() => {
      setIsLoaded(false)
    }, [parsed.src])

    const composedClassName = [
      className,
      'framed-image',
      `framed-image--reveal-${revealMode}`,
      isLoaded ? 'framed-image--revealed' : 'framed-image--pending',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <img
        {...props}
        ref={ref}
        src={parsed.src}
        loading={loading}
        decoding={decoding}
        {...{ fetchpriority: fetchPriority ?? (loading === 'eager' ? 'high' : 'auto') }}
        sizes={sizes ?? DEFAULT_SIZES}
        srcSet={srcSet}
        className={composedClassName}
        style={{
          ...objectStyle,
          ...style,
        }}
        onLoad={event => {
          setIsLoaded(true)
          onLoad?.(event)
        }}
        onError={event => {
          setIsLoaded(true)
          onError?.(event)
        }}
      />
    )
  })
)

export default FramedImage
