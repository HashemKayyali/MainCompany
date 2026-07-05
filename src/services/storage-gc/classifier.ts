import { IMAGE_BUCKET, VIDEO_BUCKET } from '../storage.service'
import type {
  BrokenReference,
  ClassifiedObject,
  DbReference,
  ReferenceIndex,
  StorageObject,
} from './types'

/**
 * Managed folders per bucket. Anything at a path root that isn't in
 * one of these lands in REVIEW_REQUIRED — the GC refuses to guess
 * ownership of unknown storage areas. Extend cautiously; a new
 * folder here is a licence to auto-delete its contents.
 */
export const MANAGED_FOLDERS: Record<string, string[]> = {
  [IMAGE_BUCKET]: [
    'categories',
    'customers',
    'parts',
    'gallery',
    'custom-builds',
    'products',
    'general',
    'uploads',
  ],
  [VIDEO_BUCKET]: ['products', 'uploads'],
}

export interface ClassifyOptions {
  /**
   * ISO cutoff; objects newer than this are RECENT_UNREFERENCED and
   * never deleted this run. `SAFE_CANDIDATE` requires
   * `lastModifiedIso <= safetyWindowCutoffIso`.
   */
  safetyWindowCutoffIso: string
  now?: Date
}

export interface ClassifyResult {
  classified: ClassifiedObject[]
  broken: BrokenReference[]
}

/**
 * Classify every enumerated storage object against the reference
 * index and safety window. Never deletes anything itself; the
 * classification result is the input the cleanup command mutates
 * storage from.
 */
export function classifyStorageObjects(
  objects: StorageObject[],
  index: ReferenceIndex,
  options: ClassifyOptions,
): ClassifyResult {
  const now = options.now ?? new Date()
  const cutoff = new Date(options.safetyWindowCutoffIso).getTime()
  const classified: ClassifiedObject[] = []

  const seenCanonicals = new Set<string>()

  for (const object of objects) {
    seenCanonicals.add(object.canonical)
    const ageHours = ageInHoursSince(object.lastModifiedIso, now)

    // Directory placeholder — Supabase's list() returns synthetic
    // entries for empty folders. Never a real orphan.
    if (object.isDirectoryPlaceholder) {
      classified.push({
        storage: object,
        classification: 'REVIEW_REQUIRED',
        reason: 'directory placeholder',
        ageHours,
        references: [],
      })
      continue
    }

    const reference = index.get(object.canonical)
    if (reference) {
      classified.push({
        storage: object,
        classification: 'REFERENCED',
        reason: `referenced by ${reference.sources.length} DB source(s)`,
        ageHours,
        references: reference.sources,
      })
      continue
    }

    // Not referenced. Decide between candidate / review / recent.
    const managed = MANAGED_FOLDERS[object.bucket]
    if (!managed) {
      classified.push({
        storage: object,
        classification: 'REVIEW_REQUIRED',
        reason: `unknown bucket "${object.bucket}"`,
        ageHours,
        references: [],
      })
      continue
    }

    const [topFolder] = object.path.split('/')
    if (!topFolder) {
      classified.push({
        storage: object,
        classification: 'REVIEW_REQUIRED',
        reason: 'empty path segment',
        ageHours,
        references: [],
      })
      continue
    }

    if (!managed.includes(topFolder)) {
      classified.push({
        storage: object,
        classification: 'REVIEW_REQUIRED',
        reason: `folder "${topFolder}" not in managed set for bucket "${object.bucket}"`,
        ageHours,
        references: [],
      })
      continue
    }

    if (!Number.isFinite(cutoff)) {
      classified.push({
        storage: object,
        classification: 'UNKNOWN_OR_UNPARSEABLE',
        reason: 'safety-window cutoff is not a valid date',
        ageHours,
        references: [],
      })
      continue
    }

    const modifiedMs = Date.parse(object.lastModifiedIso)
    if (!Number.isFinite(modifiedMs)) {
      classified.push({
        storage: object,
        classification: 'UNKNOWN_OR_UNPARSEABLE',
        reason: 'lastModified is not a valid date',
        ageHours,
        references: [],
      })
      continue
    }

    if (modifiedMs > cutoff) {
      classified.push({
        storage: object,
        classification: 'RECENT_UNREFERENCED',
        reason: `younger than safety window (${ageHours.toFixed(1)}h)`,
        ageHours,
        references: [],
      })
      continue
    }

    classified.push({
      storage: object,
      classification: 'SAFE_CANDIDATE',
      reason: `unreferenced managed object older than safety window (${ageHours.toFixed(1)}h)`,
      ageHours,
      references: [],
    })
  }

  // Broken references: DB rows point at Storage objects that don't
  // exist. Reported but never treated as deletion work.
  const broken: BrokenReference[] = []
  for (const [canonical, reference] of index) {
    if (!seenCanonicals.has(canonical)) {
      broken.push(referenceToBroken(reference))
    }
  }

  return { classified, broken }
}

function ageInHoursSince(iso: string, now: Date): number {
  const t = Date.parse(iso)
  if (!Number.isFinite(t)) return Number.NaN
  return (now.getTime() - t) / (1000 * 60 * 60)
}

function referenceToBroken(reference: DbReference): BrokenReference {
  return {
    canonical: reference.canonical,
    bucket: reference.bucket,
    path: reference.path,
    sources: reference.sources,
  }
}
