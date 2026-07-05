import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  type ForwardedRef,
  type VideoHTMLAttributes,
} from 'react'
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
  /**
   * Keeps the video mounted and visually unchanged, but pauses playback when
   * it leaves the viewport or the tab becomes hidden. Autoplay resumes when
   * the video becomes active again.
   */
  pauseWhenOffscreen?: boolean
}

function assignRef<T>(ref: ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value)
    return
  }
  if (ref) ref.current = value
}

const FramedVideo = forwardRef<HTMLVideoElement, Props>(function FramedVideo(
  {
    media = '',
    posterMedia,
    fallbackTransform,
    extraScale,
    pauseWhenOffscreen = false,
    autoPlay,
    style,
    ...props
  },
  forwardedRef
) {
  const parsed = parseMediaValue(media, fallbackTransform)
  const poster = posterMedia ? parseMediaValue(posterMedia).src : undefined
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node
      assignRef(forwardedRef, node)
    },
    [forwardedRef]
  )

  useEffect(() => {
    if (!pauseWhenOffscreen || !autoPlay) return undefined

    const video = videoRef.current
    if (!video) return undefined

    let inView = true

    const syncPlayback = () => {
      const shouldPlay = inView && document.visibilityState !== 'hidden'
      if (!shouldPlay) {
        video.pause()
        return
      }

      void video.play().catch(() => {
        // Browser autoplay policy can reject play(); the native controls or a
        // later user interaction can still start playback normally.
      })
    }

    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
          entries => {
            inView = Boolean(entries[0]?.isIntersecting)
            syncPlayback()
          },
          { rootMargin: '160px 0px', threshold: 0.01 }
        )
      : null

    observer?.observe(video)
    document.addEventListener('visibilitychange', syncPlayback)
    syncPlayback()

    return () => {
      observer?.disconnect()
      document.removeEventListener('visibilitychange', syncPlayback)
      video.pause()
    }
  }, [autoPlay, pauseWhenOffscreen])

  return (
    <video
      {...props}
      ref={setVideoRef}
      src={parsed.src}
      poster={poster}
      autoPlay={pauseWhenOffscreen ? false : autoPlay}
      style={{
        ...getMediaObjectStyle(media, { fallback: fallbackTransform, extraScale }),
        ...style,
      }}
    />
  )
})

export default FramedVideo
