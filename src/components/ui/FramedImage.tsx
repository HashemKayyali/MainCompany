import type { ImgHTMLAttributes } from 'react'
import { getMediaObjectStyle, parseMediaValue, type MediaFrameTransform } from '../../utils/media-frame'

interface Props extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  media?: string
  fallbackTransform?: Partial<MediaFrameTransform>
  extraScale?: number
}

export default function FramedImage({
  media = '',
  fallbackTransform,
  extraScale,
  style,
  ...props
}: Props) {
  const parsed = parseMediaValue(media, fallbackTransform)

  return (
    <img
      {...props}
      src={parsed.src}
      style={{
        ...getMediaObjectStyle(media, { fallback: fallbackTransform, extraScale }),
        ...style,
      }}
    />
  )
}

