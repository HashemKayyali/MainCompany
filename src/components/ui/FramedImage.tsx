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
  type MediaFrameTransform,
} from '../../utils/media-frame'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  media?: string
  fallbackTransform?: Partial<MediaFrameTransform>
  fallbackSrc?: string
  extraScale?: number
  revealMode?: 'soft' | 'crisp'
}

const DEFAULT_FALLBACK_SRC = '/images/image-fallback.svg'
const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

function normalizeImageSrc(src?: string) {
  const cleanSrc = src?.trim() ?? ''
  if (!cleanSrc) return ''

  return cleanSrc
}

const FramedImage = memo(
  forwardRef<HTMLImageElement, Props>(function FramedImage(
    {
      media = '',
      fallbackTransform,
      fallbackSrc = DEFAULT_FALLBACK_SRC,
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

    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    useEffect(() => {
      setIsLoaded(false)
      setHasError(false)
    }, [parsed.src])

    const realSrc = normalizeImageSrc(parsed.src)
    const displaySrc = !hasError && realSrc ? realSrc : fallbackSrc

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
        src={displaySrc}
        loading={loading}
        decoding={decoding}
        {...{ fetchpriority: fetchPriority ?? (loading === 'eager' ? 'high' : 'auto') }}
        sizes={sizes ?? DEFAULT_SIZES}
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
          if (displaySrc !== fallbackSrc) {
            setIsLoaded(false)
            setHasError(true)
          } else {
            setIsLoaded(true)
          }
          onError?.(event)
        }}
      />
    )
  })
)

export default FramedImage
