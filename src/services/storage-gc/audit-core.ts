import { createHash } from 'node:crypto'
import type {
  AuditReport,
  AuditTotals,
  BrokenReference,
  ClassifiedObject,
  StorageObject,
} from './types'
import type { ReferenceScanReport } from './reference-index'

export interface BuildAuditReportInput {
  environment: string
  timestamp: Date
  safetyWindowDays: number
  safetyWindowCutoffIso: string
  buckets: string[]
  scan: ReferenceScanReport
  storage: StorageObject[]
  classified: ClassifiedObject[]
  broken: BrokenReference[]
}

/**
 * Compose the on-disk audit report from a completed scan + classify
 * pass. Pure — no I/O, no supabase, so easy to test.
 *
 * Cleanup mode requires the `integrityHash` on the report to match
 * a re-computation over the report's SAFE_CANDIDATE list. Any
 * tamper / stale-report scenario is rejected at run time.
 */
export function buildAuditReport(input: BuildAuditReportInput): AuditReport {
  const safeCandidates = input.classified
    .filter(o => o.classification === 'SAFE_CANDIDATE')
    .map(o => ({
      bucket: o.storage.bucket,
      path: o.storage.path,
      canonical: o.storage.canonical,
      size: o.storage.size,
      lastModifiedIso: o.storage.lastModifiedIso,
    }))

  const reviewRequired = input.classified
    .filter(o => o.classification === 'REVIEW_REQUIRED')
    .map(o => ({
      bucket: o.storage.bucket,
      path: o.storage.path,
      canonical: o.storage.canonical,
      reason: o.reason,
      lastModifiedIso: o.storage.lastModifiedIso,
    }))

  const recentUnreferenced = input.classified
    .filter(o => o.classification === 'RECENT_UNREFERENCED')
    .map(o => ({
      canonical: o.storage.canonical,
      ageHours: o.ageHours,
      lastModifiedIso: o.storage.lastModifiedIso,
    }))

  const unknownOrUnparseable = input.classified
    .filter(o => o.classification === 'UNKNOWN_OR_UNPARSEABLE')
    .map(o => ({
      bucket: o.storage.bucket,
      path: o.storage.path,
      reason: o.reason,
    }))

  const referenced = input.classified.filter(
    o => o.classification === 'REFERENCED',
  ).length

  const perFolder: Record<string, { count: number; bytes: number }> = {}
  for (const object of input.storage) {
    const [top] = object.path.split('/')
    const key = `${object.bucket}/${top || '(root)'}`
    if (!perFolder[key]) perFolder[key] = { count: 0, bytes: 0 }
    perFolder[key].count += 1
    perFolder[key].bytes += object.size
  }

  const totals: AuditTotals = {
    dbReferencesRaw: input.scan.rawReferenceCount,
    dbReferencesUnique: input.scan.index.size,
    storageObjects: input.storage.length,
    referenced,
    safeCandidates: safeCandidates.length,
    reviewRequired: reviewRequired.length,
    recentUnreferenced: recentUnreferenced.length,
    unknownOrUnparseable: unknownOrUnparseable.length,
    brokenReferences: input.broken.length,
    duplicateDbReferences: input.scan.duplicateCount,
    estimatedReclaimableBytes: safeCandidates.reduce(
      (sum, c) => sum + c.size,
      0,
    ),
  }

  const integrityHash = computeIntegrityHash(safeCandidates)

  return {
    environment: input.environment,
    timestamp: input.timestamp.toISOString(),
    safetyWindowDays: input.safetyWindowDays,
    safetyWindowCutoffIso: input.safetyWindowCutoffIso,
    buckets: input.buckets,
    totals,
    perFolder,
    safeCandidates,
    reviewRequired,
    recentUnreferenced,
    brokenReferences: input.broken,
    unknownOrUnparseable,
    integrityHash,
  }
}

/**
 * Deterministic hash over the exact SAFE_CANDIDATE set the report
 * proposes for deletion. Any mutation of the candidate list — or an
 * older/newer report — produces a different hash and cleanup mode
 * refuses to run unless the caller provides the matching value.
 */
export function computeIntegrityHash(
  candidates: Array<{ canonical: string; size: number; lastModifiedIso: string }>,
): string {
  const sorted = candidates
    .map(c => `${c.canonical}|${c.size}|${c.lastModifiedIso}`)
    .sort()
  const payload = sorted.join('\n')
  return createHash('sha256').update(payload).digest('hex')
}

/**
 * Serialize a Markdown summary suitable for reviewers. Never
 * includes sensitive DB values — only counts, per-folder rollups,
 * and canonical paths.
 */
export function renderMarkdownSummary(report: AuditReport): string {
  const t = report.totals
  const lines: string[] = []
  lines.push(`# Storage Audit — ${report.timestamp}`)
  lines.push('')
  lines.push(`- **Environment:** \`${report.environment}\``)
  lines.push(`- **Buckets:** ${report.buckets.map(b => `\`${b}\``).join(', ')}`)
  lines.push(`- **Safety window:** ${report.safetyWindowDays} days`)
  lines.push(`- **Cutoff:** ${report.safetyWindowCutoffIso}`)
  lines.push('')
  lines.push('## Totals')
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|---|---:|')
  lines.push(`| DB references (raw) | ${t.dbReferencesRaw} |`)
  lines.push(`| DB references (unique canonical) | ${t.dbReferencesUnique} |`)
  lines.push(`| Duplicate DB references | ${t.duplicateDbReferences} |`)
  lines.push(`| Storage objects enumerated | ${t.storageObjects} |`)
  lines.push(`| Referenced | ${t.referenced} |`)
  lines.push(`| SAFE_CANDIDATE | ${t.safeCandidates} |`)
  lines.push(`| REVIEW_REQUIRED | ${t.reviewRequired} |`)
  lines.push(`| RECENT_UNREFERENCED | ${t.recentUnreferenced} |`)
  lines.push(`| UNKNOWN_OR_UNPARSEABLE | ${t.unknownOrUnparseable} |`)
  lines.push(`| BROKEN_REFERENCE | ${t.brokenReferences} |`)
  lines.push(`| Estimated reclaimable bytes (SAFE_CANDIDATE only) | ${t.estimatedReclaimableBytes.toLocaleString('en-US')} |`)
  lines.push('')
  lines.push('## Per-folder breakdown')
  lines.push('')
  lines.push('| Folder | Objects | Bytes |')
  lines.push('|---|---:|---:|')
  for (const [folder, entry] of Object.entries(report.perFolder).sort()) {
    lines.push(`| \`${folder}\` | ${entry.count} | ${entry.bytes.toLocaleString('en-US')} |`)
  }
  lines.push('')
  lines.push(`## Integrity hash`)
  lines.push('')
  lines.push('```')
  lines.push(report.integrityHash)
  lines.push('```')
  lines.push('')
  lines.push('_Cleanup mode requires this hash as `--confirm`. Any edit to the SAFE_CANDIDATE list changes the hash._')
  return lines.join('\n')
}
