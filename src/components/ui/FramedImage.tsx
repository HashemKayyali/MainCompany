import {
  forwardRef,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ImgHTMLAttributes,
} from 'react'
import {
  getMediaObjectStyle,
  parseMediaValue,
  type MediaFrameTransform,
} from '../../utils/media-frame'
import {
  getImageDeliverySource,
  getImageDeliverySrcSet,
  getImagePlaceholderSource,
  isImageDeliveryLoaded,
  markImageDeliveryLoaded,
  type ImagePreset,
} from '../../lib/image-delivery'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  media?: string
  fallbackTransform?: Partial<MediaFrameTransform>
  fallbackSrc?: string
  extraScale?: number
  revealMode?: 'soft' | 'crisp'
  preset?: ImagePreset
}

const DEFAULT_FALLBACK_SRC = '/images/image-fallback.svg'
const DEFAULT_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

const FramedImage = memo(
  forwardRef<HTMLImageElement, Props>(function FramedImage(
    {
      media = '',
      fallbackTransform,
      fallbackSrc = DEFAULT_FALLBACK_SRC,
      extraScale,
      revealMode = 'crisp',
      preset = 'detail',
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
    forwardedRef,
  ) {
    const parsed = useMemo(
      () => parseMediaValue(media, fallbackTransform),
      [fallbackTransform, media],
    )
    const objectStyle = useMemo(
      () => getMediaObjectStyle(media, { fallback: fallbackTransform, extraScale }),
      [extraScale, fallbackTransform, media],
    )

    const deliveredSrc = useMemo(() => getImageDeliverySource(media, preset), [media, preset])
    const deliveredSrcSet = useMemo(() => getImageDeliverySrcSet(media, preset), [media, preset])
    const placeholderSrc = useMemo(() => getImagePlaceholderSource(media, preset), [media, preset])

    const [isLoaded, setIsLoaded] = useState(() => isImageDeliveryLoaded(deliveredSrc))
    const [hasError, setHasError] = useState(false)
    const imageRef = useRef<HTMLImageElement | null>(null)

    const realSrc = deliveredSrc || parsed.src.trim()
    const displaySrc = !hasError && realSrc ? realSrc : fallbackSrc
    const displaySrcSet = !hasError && realSrc ? deliveredSrcSet : undefined

    useEffect(() => {
      setHasError(false)
      setIsLoaded(isImageDeliveryLoaded(realSrc))

      const image = imageRef.current
      if (image?.complete && image.naturalWidth > 0) {
        markImageDeliveryLoaded(realSrc)
        setIsLoaded(true)
      }
    }, [realSrc])

    const composedClassName = [
      className,
      'framed-image',
      `framed-image--reveal-${revealMode}`,
      isLoaded ? 'framed-image--revealed' : 'framed-image--pending',
    ]
      .filter(Boolean)
      .join(' ')

    const placeholderStyle = !isLoaded && !hasError && placeholderSrc
      ? {
          backgroundImage: `url(${JSON.stringify(placeholderSrc)})`,
          backgroundSize: parsed.transform.fit === 'contain' ? 'contain' : 'cover',
          backgroundPosition: `${parsed.transform.x}% ${parsed.transform.y}%`,
          backgroundRepeat: 'no-repeat',
        }
      : undefined

    return (
      <img
        {...props}
        ref={node => {
          imageRef.current = node
          if (typeof forwardedRef === 'function') forwardedRef(node)
          else if (forwardedRef) forwardedRef.current = node
        }}
        src={displaySrc}
        srcSet={displaySrcSet}
        loading={loading}
        decoding={decoding}
        {...{ fetchpriority: fetchPriority ?? 'auto' }}
        sizes={sizes ?? DEFAULT_SIZES}
        className={composedClassName}
        style={{
          ...placeholderStyle,
          ...objectStyle,
          ...style,
        }}
        onLoad={event => {
          markImageDeliveryLoaded(displaySrc)
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
  }),
)

export default FramedImage
