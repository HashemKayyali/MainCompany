export type ImageLoadingGroup =
  | 'critical'
  | 'categories'
  | 'products'
  | 'home-gallery'
  | 'gallery-warmup'
  | 'fullscreen'
  | 'other'

type ImageInitiator = 'rendered-img' | 'preload'

interface PreloadTrace {
  group: ImageLoadingGroup
  initiator: ImageInitiator
  logicalUrl: string
  url: string
  startTime: number
  completionTime?: number
}

interface ImageResourceTrace {
  group: ImageLoadingGroup
  initiator: ImageInitiator
  logicalUrl: string
  url: string
  width: number | null
  startTime: number
  completionTime: number
  duration: number
  transferSize: number
  encodedBodySize: number
  decodedBodySize: number
}

interface ImageTraceSnapshot {
  resources: ImageResourceTrace[]
  duplicates: Array<{
    logicalUrl: string
    widths: number[]
    urls: string[]
  }>
  summary: {
    requestCount: number
    transferredBytes: number
    networkFinish: number
    lcp: { time: number; size: number; url: string } | null
    groups: Record<string, { count: number; firstStart: number; lastCompletion: number }>
  }
}

interface ImageTraceApi {
  snapshot: () => ImageTraceSnapshot
  print: () => ImageTraceSnapshot
}

declare global {
  interface Window {
    __EVENTIES_IMAGE_TRACE__?: ImageTraceApi
  }
}

const resourceEntries: PerformanceResourceTiming[] = []
const preloadTraces = new Map<string, PreloadTrace>()
let installed = false
let publishTimer: number | null = null
let latestLcp: { time: number; size: number; url: string } | null = null

function normalizeUrl(value: string) {
  try {
    return new URL(value, window.location.href).toString()
  } catch {
    return value
  }
}

function cloudinaryDetails(value: string) {
  try {
    const url = new URL(value, window.location.href)
    const marker = '/image/upload/'
    const markerIndex = url.pathname.indexOf(marker)
    if (url.hostname !== 'res.cloudinary.com' || markerIndex < 0) {
      return { logicalUrl: `${url.origin}${url.pathname}`, width: null }
    }

    const tail = url.pathname.slice(markerIndex + marker.length)
    const deliveryPrefix = url.pathname.slice(0, markerIndex)
    const segments = tail.split('/').filter(Boolean)
    const versionIndex = segments.findIndex(segment => /^v\d+$/.test(segment))
    const assetPath = versionIndex >= 0 ? segments.slice(versionIndex).join('/') : tail
    const transformPath = versionIndex >= 0 ? segments.slice(0, versionIndex).join('/') : ''
    const widthMatch = transformPath.match(/(?:^|,)w_(\d+)(?:,|$)/)

    return {
      logicalUrl: `${url.origin}${deliveryPrefix}${marker}${assetPath}`,
      width: widthMatch ? Number(widthMatch[1]) : null,
    }
  } catch {
    return { logicalUrl: value, width: null }
  }
}

function renderedGroups() {
  const groups = new Map<string, ImageLoadingGroup>()
  document.querySelectorAll<HTMLImageElement>('img[data-image-group]').forEach(image => {
    const group = (image.dataset.imageGroup || 'other') as ImageLoadingGroup
    if (image.currentSrc) groups.set(normalizeUrl(image.currentSrc), group)
    if (image.src) groups.set(normalizeUrl(image.src), group)
  })
  return groups
}

function createSnapshot(): ImageTraceSnapshot {
  const groupsByUrl = renderedGroups()
  const resources = resourceEntries.map(entry => {
    const url = normalizeUrl(entry.name)
    const preload = preloadTraces.get(url)
    const details = cloudinaryDetails(url)
    return {
      group: preload?.group ?? groupsByUrl.get(url) ?? 'other',
      initiator: preload?.initiator ?? 'rendered-img',
      logicalUrl: preload?.logicalUrl ?? details.logicalUrl,
      url,
      width: details.width,
      startTime: Math.round(entry.startTime),
      completionTime: Math.round(entry.responseEnd),
      duration: Math.round(entry.duration),
      transferSize: entry.transferSize,
      encodedBodySize: entry.encodedBodySize,
      decodedBodySize: entry.decodedBodySize,
    } satisfies ImageResourceTrace
  }).sort((left, right) => left.startTime - right.startTime)

  const duplicateGroups = new Map<string, ImageResourceTrace[]>()
  resources.forEach(resource => {
    if (!duplicateGroups.has(resource.logicalUrl)) duplicateGroups.set(resource.logicalUrl, [])
    duplicateGroups.get(resource.logicalUrl)?.push(resource)
  })
  const duplicates = Array.from(duplicateGroups.entries()).flatMap(([logicalUrl, entries]) => {
    const widths = Array.from(new Set(entries.map(entry => entry.width).filter((width): width is number => width !== null)))
    const urls = Array.from(new Set(entries.map(entry => entry.url)))
    return widths.length > 1 ? [{ logicalUrl, widths, urls }] : []
  })

  const groupSummary: ImageTraceSnapshot['summary']['groups'] = {}
  resources.forEach(resource => {
    const current = groupSummary[resource.group]
    groupSummary[resource.group] = current
      ? {
          count: current.count + 1,
          firstStart: Math.min(current.firstStart, resource.startTime),
          lastCompletion: Math.max(current.lastCompletion, resource.completionTime),
        }
      : { count: 1, firstStart: resource.startTime, lastCompletion: resource.completionTime }
  })

  return {
    resources,
    duplicates,
    summary: {
      requestCount: resources.length,
      transferredBytes: resources.reduce((total, resource) => total + resource.transferSize, 0),
      networkFinish: resources.reduce((latest, resource) => Math.max(latest, resource.completionTime), 0),
      lcp: latestLcp,
      groups: groupSummary,
    },
  }
}

function publishSnapshotSoon() {
  if (typeof window === 'undefined') return
  if (publishTimer !== null) return
  publishTimer = window.setTimeout(() => {
    publishTimer = null
    let output = document.getElementById('eventies-image-loading-trace')
    if (!output) {
      output = document.createElement('script')
      output.id = 'eventies-image-loading-trace'
      output.setAttribute('type', 'application/json')
      output.hidden = true
      document.body.appendChild(output)
    }
    output.textContent = JSON.stringify(createSnapshot())
  }, 800)
}

export function installImageLoadingTrace() {
  if (!import.meta.env.DEV || typeof window === 'undefined' || installed) return
  installed = true

  const observer = new PerformanceObserver(list => {
    list.getEntries().forEach(entry => {
      if (entry.entryType !== 'resource') return
      const resource = entry as PerformanceResourceTiming
      if (resource.initiatorType === 'img' || preloadTraces.has(normalizeUrl(resource.name))) {
        resourceEntries.push(resource)
      }
    })
    publishSnapshotSoon()
  })
  observer.observe({ type: 'resource', buffered: true })

  if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
    const lcpObserver = new PerformanceObserver(list => {
      const entries = list.getEntries()
      const entry = entries[entries.length - 1] as PerformanceEntry & { size?: number; url?: string }
      if (!entry) return
      latestLcp = {
        time: Math.round(entry.startTime),
        size: Math.round(entry.size ?? 0),
        url: entry.url ?? '',
      }
      publishSnapshotSoon()
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
  }

  window.__EVENTIES_IMAGE_TRACE__ = {
    snapshot: createSnapshot,
    print: () => {
      const snapshot = createSnapshot()
      console.table(snapshot.resources)
      if (snapshot.duplicates.length > 0) console.table(snapshot.duplicates)
      return snapshot
    },
  }
}

export function traceImagePreloadStart(
  url: string,
  logicalUrl: string,
  group: ImageLoadingGroup = 'other',
  candidateUrls: string[] = [],
) {
  if (!import.meta.env.DEV || typeof window === 'undefined') return
  const startTime = performance.now()
  Array.from(new Set([url, ...candidateUrls])).forEach(candidateUrl => {
    const normalizedUrl = normalizeUrl(candidateUrl)
    if (preloadTraces.has(normalizedUrl)) return
    preloadTraces.set(normalizedUrl, {
      group,
      initiator: 'preload',
      logicalUrl: cloudinaryDetails(logicalUrl).logicalUrl,
      url: normalizedUrl,
      startTime,
    })
  })
  publishSnapshotSoon()
}

export function traceImagePreloadComplete(url: string) {
  if (!import.meta.env.DEV || typeof window === 'undefined') return
  const trace = preloadTraces.get(normalizeUrl(url))
  if (trace) trace.completionTime = performance.now()
  publishSnapshotSoon()
}
