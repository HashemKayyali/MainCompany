export type ImageLoadingGroup =
  | 'critical'
  | 'categories'
  | 'products'
  | 'home-gallery'
  | 'gallery-warmup'
  | 'fullscreen'
  | 'other'

type ImageInitiator = 'rendered-img' | 'preload' | 'css-background' | 'other-image'

interface PreloadTrace {
  group: ImageLoadingGroup
  initiator: 'preload'
  logicalUrl: string
  url: string
  startTime: number
  completionTime?: number
}

interface ImageResourceTrace {
  group: ImageLoadingGroup
  initiator: ImageInitiator
  tracked: boolean
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
  exactUrlDuplicates: Array<{
    url: string
    logicalUrl: string
    requestCount: number
    startTimes: number[]
    initiators: ImageInitiator[]
  }>
  summary: {
    requestCount: number
    trackedRequestCount: number
    unclassifiedRequestCount: number
    transferredBytes: number
    networkFinish: number
    lcp: { time: number; size: number; url: string } | null
    groups: Record<string, { count: number; firstStart: number; lastCompletion: number }>
    initiators: Record<ImageInitiator, number>
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

const IMAGE_FILE_PATTERN = /\.(?:avif|bmp|gif|ico|jpe?g|png|svg|webp)$/i
const CSS_URL_PATTERN = /url\((?:['"]?)(.*?)(?:['"]?)\)/g

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

function extractCssImageUrls(value: string) {
  const urls: string[] = []
  for (const match of value.matchAll(CSS_URL_PATTERN)) {
    const candidate = match[1]?.trim()
    if (candidate && candidate !== 'none' && !candidate.startsWith('data:')) {
      urls.push(normalizeUrl(candidate))
    }
  }
  return urls
}

function renderedGroups() {
  const groups = new Map<string, ImageLoadingGroup>()
  document.querySelectorAll<HTMLElement>('[data-image-group]').forEach(element => {
    const group = (element.dataset.imageGroup || 'other') as ImageLoadingGroup
    if (element instanceof HTMLImageElement) {
      if (element.currentSrc) groups.set(normalizeUrl(element.currentSrc), group)
      if (element.src) groups.set(normalizeUrl(element.src), group)
    }

    extractCssImageUrls(window.getComputedStyle(element).backgroundImage).forEach(url => {
      groups.set(url, group)
    })
  })
  return groups
}

function inlineBackgroundUrls() {
  const urls = new Set<string>()
  document.querySelectorAll<HTMLElement>('[style*="background"]').forEach(element => {
    extractCssImageUrls(window.getComputedStyle(element).backgroundImage).forEach(url => urls.add(url))
  })
  return urls
}

function isLikelyImageResource(resource: PerformanceResourceTiming) {
  const normalizedUrl = normalizeUrl(resource.name)
  if (resource.initiatorType === 'img' || preloadTraces.has(normalizedUrl)) return true

  try {
    const url = new URL(normalizedUrl)
    return (
      url.pathname.includes('/image/upload/')
      || url.pathname.includes('/storage/v1/render/image/')
      || IMAGE_FILE_PATTERN.test(url.pathname)
    )
  } catch {
    return IMAGE_FILE_PATTERN.test(normalizedUrl.split(/[?#]/, 1)[0] || '')
  }
}

function getImageInitiator(
  entry: PerformanceResourceTiming,
  url: string,
  backgroundUrls: Set<string>,
): ImageInitiator {
  if (preloadTraces.has(url)) return 'preload'
  if (entry.initiatorType === 'img') return 'rendered-img'
  if (entry.initiatorType === 'css' || backgroundUrls.has(url)) return 'css-background'
  return 'other-image'
}

function createSnapshot(): ImageTraceSnapshot {
  const groupsByUrl = renderedGroups()
  const backgroundUrls = inlineBackgroundUrls()
  const resources = resourceEntries.map(entry => {
    const url = normalizeUrl(entry.name)
    const preload = preloadTraces.get(url)
    const explicitGroup = preload?.group ?? groupsByUrl.get(url)
    const details = cloudinaryDetails(url)
    return {
      group: explicitGroup ?? 'other',
      initiator: getImageInitiator(entry, url, backgroundUrls),
      tracked: Boolean(preload || groupsByUrl.has(url)),
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

  const exactUrlGroups = new Map<string, ImageResourceTrace[]>()
  resources.forEach(resource => {
    if (!exactUrlGroups.has(resource.url)) exactUrlGroups.set(resource.url, [])
    exactUrlGroups.get(resource.url)?.push(resource)
  })
  const exactUrlDuplicates = Array.from(exactUrlGroups.entries()).flatMap(([url, entries]) => {
    if (entries.length < 2) return []
    return [{
      url,
      logicalUrl: entries[0]?.logicalUrl ?? url,
      requestCount: entries.length,
      startTimes: entries.map(entry => entry.startTime),
      initiators: Array.from(new Set(entries.map(entry => entry.initiator))),
    }]
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

  const initiatorSummary: ImageTraceSnapshot['summary']['initiators'] = {
    'rendered-img': 0,
    preload: 0,
    'css-background': 0,
    'other-image': 0,
  }
  resources.forEach(resource => {
    initiatorSummary[resource.initiator] += 1
  })

  const trackedRequestCount = resources.filter(resource => resource.tracked).length

  return {
    resources,
    duplicates,
    exactUrlDuplicates,
    summary: {
      requestCount: resources.length,
      trackedRequestCount,
      unclassifiedRequestCount: resources.length - trackedRequestCount,
      transferredBytes: resources.reduce((total, resource) => total + resource.transferSize, 0),
      networkFinish: resources.reduce((latest, resource) => Math.max(latest, resource.completionTime), 0),
      lcp: latestLcp,
      groups: groupSummary,
      initiators: initiatorSummary,
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
      if (isLikelyImageResource(resource)) resourceEntries.push(resource)
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
      if (snapshot.exactUrlDuplicates.length > 0) console.table(snapshot.exactUrlDuplicates)
      console.table([snapshot.summary])
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
