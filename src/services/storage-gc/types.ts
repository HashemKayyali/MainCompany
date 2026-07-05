import type { StorageAssetKind } from '../storage.service'

/* ------------------------------------------------------------------ *
 *  Reference index                                                    *
 * ------------------------------------------------------------------ */

/**
 * Where a single canonical Storage identity is referenced from the
 * database. Multiple rows/fields can reference the same canonical.
 */
export interface DbReferenceSource {
  table: string
  field: string
  rowKey?: string
}

export interface DbReference {
  canonical: string
  bucket: string
  path: string
  kind: StorageAssetKind
  sources: DbReferenceSource[]
}

export type ReferenceIndex = Map<string, DbReference>

/* ------------------------------------------------------------------ *
 *  Storage enumeration                                                *
 * ------------------------------------------------------------------ */

export interface StorageObject {
  bucket: string
  /** Full path inside the bucket. */
  path: string
  canonical: string
  size: number
  lastModifiedIso: string
  /**
   * Supabase's `list()` sometimes returns synthetic placeholders for
   * empty directories (id === null, name matches folder). We flag
   * them so they never enter the classifier's "orphan" bucket.
   */
  isDirectoryPlaceholder: boolean
}

/* ------------------------------------------------------------------ *
 *  Classification                                                     *
 * ------------------------------------------------------------------ */

export type Classification =
  | 'REFERENCED'
  | 'SAFE_CANDIDATE'
  | 'REVIEW_REQUIRED'
  | 'RECENT_UNREFERENCED'
  | 'UNKNOWN_OR_UNPARSEABLE'

export interface ClassifiedObject {
  storage: StorageObject
  classification: Classification
  reason: string
  ageHours: number
  references: DbReferenceSource[]
}

/* ------------------------------------------------------------------ *
 *  Broken references                                                  *
 * ------------------------------------------------------------------ */

export interface BrokenReference {
  canonical: string
  bucket: string
  path: string
  sources: DbReferenceSource[]
}

/* ------------------------------------------------------------------ *
 *  Reports                                                            *
 * ------------------------------------------------------------------ */

export interface AuditTotals {
  dbReferencesRaw: number
  dbReferencesUnique: number
  storageObjects: number
  referenced: number
  safeCandidates: number
  reviewRequired: number
  recentUnreferenced: number
  unknownOrUnparseable: number
  brokenReferences: number
  duplicateDbReferences: number
  estimatedReclaimableBytes: number
}

export interface AuditReport {
  environment: string
  timestamp: string
  safetyWindowDays: number
  safetyWindowCutoffIso: string
  buckets: string[]
  totals: AuditTotals
  perFolder: Record<string, { count: number; bytes: number }>
  safeCandidates: Array<{
    bucket: string
    path: string
    canonical: string
    size: number
    lastModifiedIso: string
  }>
  reviewRequired: Array<{
    bucket: string
    path: string
    canonical: string
    reason: string
    lastModifiedIso: string
  }>
  recentUnreferenced: Array<{
    canonical: string
    ageHours: number
    lastModifiedIso: string
  }>
  brokenReferences: BrokenReference[]
  unknownOrUnparseable: Array<{
    bucket: string
    path: string
    reason: string
  }>
  /**
   * SHA-256 over a canonical serialization of every candidate the
   * report proposes for deletion. Cleanup mode requires the caller
   * to pass this exact hash so a report cannot be tampered with or
   * mis-applied.
   */
  integrityHash: string
}

/* ------------------------------------------------------------------ *
 *  Cleanup                                                            *
 * ------------------------------------------------------------------ */

export interface CleanupInput {
  reportPath: string
  confirmationToken: string
  batchSize: number
  safetyWindowDays: number
}

export interface CleanupResult {
  environment: string
  timestamp: string
  requestedCandidates: number
  deleted: Array<{ canonical: string; sizeBytes: number }>
  alreadyMissing: string[]
  skippedNewlyReferenced: Array<{ canonical: string; sources: DbReferenceSource[] }>
  skippedSafetyChanged: Array<{ canonical: string; reason: string }>
  failed: Array<{ canonical: string; error: string }>
  reclaimedBytes: number
}
