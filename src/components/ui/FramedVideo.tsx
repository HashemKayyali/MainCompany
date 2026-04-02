import { forwardRef, type VideoHTMLAttributes } from 'react'
import {
  getMediaObjectStyle,
  parseMediaValue,
  type MediaFrameTransform,
} from '../../utils/media-frame'

interface Props extends Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'poster'> {
  media?: string
  posterMedia?: string
  fallbackTransform?: Partial<MediaFrameTransform>
  extraScale?: number
}

const FramedVideo = forwardRef<HTMLVideoElement, Props>(function FramedVideo(
  {
    media = '',
    posterMedia,
    fallbackTransform,
    extraScale,
    style,
    ...props
  },
  ref
) {
  const parsed = parseMediaValue(media, fallbackTransform)
  const poster = posterMedia ? parseMediaValue(posterMedia).src : undefined

  return (
    <video
      {...props}
      ref={ref}
      src={parsed.src}
      poster={poster}
      style={{
        ...getMediaObjectStyle(media, { fallback: fallbackTransform, extraScale }),
        ...style,
      }}
    />
  )
})

export default FramedVideo

