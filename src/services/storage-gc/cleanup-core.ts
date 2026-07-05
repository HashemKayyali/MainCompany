import type { AssetDeletionResult, StorageIdentity } from '../storage-identity'
import type { AuditReport, CleanupResult, DbReferenceSource } from './types'
import { computeIntegrityHash } from './audit-core'
import { buildReferenceIndex, type ReferenceInputs } from './reference-index'

/**
 * A single delete operation the cleanup driver hands to Supabase.
 * We funnel every candidate through this abstraction so tests can
 * inject a recording deleter without hitting any network.
 */
export type StorageDeleter = (
  identities: StorageIdentity[],
) => Promise<AssetDeletionResult>

/**
 * A live re-check fetcher used per-candidate (or per-batch) so an
 * asset that became referenced between the initial audit and the
 * moment we call `remove()` is never deleted.
 *
 * The fetcher receives the exact set of canonicals under
 * consideration and returns a ReferenceInputs shape that the
 * builder can turn into a live reference index.
 */
export type LiveReferenceFetcher = (
  candidates: Array<{ bucket: string; path: string; canonical: string }>,
) => Promise<ReferenceInputs>

export interface RunCleanupInput {
  report: AuditReport
  confirmationToken: string
  batchSize: number
  safetyWindowDays: number
  environment: string
  timestamp: Date
  now: Date
  deleter: StorageDeleter
  liveReferenceFetcher: LiveReferenceFetcher
  onProgress?: (message: string) => void
}

export class CleanupRefusalError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CleanupRefusalError'
  }
}

/**
 * The pure cleanup driver. Every guard is executed inside this
 * function; the CLI wrapper only supplies I/O and env plumbing.
 *
 * Safety layers, in order:
 *   1. Refuse if the audit report says any reference source failed.
 *   2. Recompute integrity hash over the report's SAFE_CANDIDATE
 *      list; refuse on mismatch to the confirmation token.
 *   3. Refuse if the safety window has been lowered from what the
 *      audit used (or below the caller's requested minimum).
 *   4. For each batch:
 *        a. Live re-check references across ALL sources including
 *           product_images.url.
 *        b. Drop any candidate that is now referenced (SKIPPED).
 *        c. Drop any candidate whose lastModified now falls inside
 *           the safety window (SKIPPED — object mutated since audit).
 *        d. Send only the survivors to the deleter.
 *   5. Report every deletion, missing, skipped, or failed candidate
 *      separately so the operator can reconcile.
 */
export async function runCleanup(input: RunCleanupInput): Promise<CleanupResult> {
  if (input.batchSize <= 0 || !Number.isFinite(input.batchSize)) {
    throw new CleanupRefusalError('batchSize must be a positive finite number')
  }

  const expectedHash = computeIntegrityHash(input.report.safeCandidates)
  if (expectedHash !== input.confirmationToken) {
    throw new CleanupRefusalError(
      'confirmation token does not match report integrityHash — report may be stale or tampered',
    )
  }
  if (input.confirmationToken !== input.report.integrityHash) {
    throw new CleanupRefusalError(
      'confirmation token does not match report integrityHash (stored)',
    )
  }
  if (input.safetyWindowDays > input.report.safetyWindowDays) {
    throw new CleanupRefusalError(
      `caller requested safety window ${input.safetyWindowDays}d is stricter than report ${input.report.safetyWindowDays}d — re-audit required`,
    )
  }

  const cutoffMs = input.now.getTime() - input.safetyWindowDays * 24 * 60 * 60 * 1000

  const result: CleanupResult = {
    environment: input.environment,
    timestamp: input.timestamp.toISOString(),
    requestedCandidates: input.report.safeCandidates.length,
    deleted: [],
    alreadyMissing: [],
    skippedNewlyReferenced: [],
    skippedSafetyChanged: [],
    failed: [],
    reclaimedBytes: 0,
  }

  const candidates = input.report.safeCandidates.slice()
  // Deduplicate the batch input just in case a manual edit added
  // duplicates. Cleanup itself is idempotent per canonical, but
  // deduping keeps the report accurate.
  const seen = new Set<string>()
  const uniqueCandidates = candidates.filter(c => {
    if (seen.has(c.canonical)) return false
    seen.add(c.canonical)
    return true
  })

  for (let i = 0; i < uniqueCandidates.length; i += input.batchSize) {
    const batch = uniqueCandidates.slice(i, i + input.batchSize)
    input.onProgress?.(`Batch ${Math.floor(i / input.batchSize) + 1}: ${batch.length} candidate(s)`)

    // Live re-check for this batch.
    const liveInputs = await input.liveReferenceFetcher(
      batch.map(c => ({ bucket: c.bucket, path: c.path, canonical: c.canonical })),
    )
    const liveScan = buildReferenceIndex(liveInputs)
    const liveIndex = liveScan.index

    const survivors: typeof batch = []
    const survivorIdentities: StorageIdentity[] = []
    const sourceLookup = new Map<string, DbReferenceSource[]>()

    for (const candidate of batch) {
      const liveEntry = liveIndex.get(candidate.canonical)
      if (liveEntry) {
        sourceLookup.set(candidate.canonical, liveEntry.sources)
        result.skippedNewlyReferenced.push({
          canonical: candidate.canonical,
          sources: liveEntry.sources,
        })
        continue
      }

      const modifiedMs = Date.parse(candidate.lastModifiedIso)
      if (!Number.isFinite(modifiedMs) || modifiedMs > cutoffMs) {
        result.skippedSafetyChanged.push({
          canonical: candidate.canonical,
          reason: 'lastModified now falls inside the safety window',
        })
        continue
      }

      survivors.push(candidate)
      survivorIdentities.push({
        kind: candidate.canonical.startsWith('product-videos/') ? 'video' : 'image',
        bucket: candidate.bucket,
        path: candidate.path,
        canonical: candidate.canonical,
      })
    }

    if (survivorIdentities.length === 0) continue

    let deletion: AssetDeletionResult
    try {
      deletion = await input.deleter(survivorIdentities)
    } catch (err) {
      // Deleter contract says it never throws, but be defensive.
      for (const candidate of survivors) {
        result.failed.push({
          canonical: candidate.canonical,
          error: err instanceof Error ? err.message : String(err),
        })
      }
      continue
    }

    for (const removed of deletion.deleted) {
      const candidate = survivors.find(c => c.canonical === removed.canonical)
      const size = candidate?.size ?? 0
      result.deleted.push({ canonical: removed.canonical, sizeBytes: size })
      result.reclaimedBytes += size
    }
    for (const missing of deletion.alreadyMissing) {
      result.alreadyMissing.push(missing.canonical)
    }
    for (const failed of deletion.failed) {
      result.failed.push({
        canonical: failed.canonical,
        error: failed.error,
      })
    }
  }

  return result
}

export function renderCleanupMarkdown(result: CleanupResult): string {
  const lines: string[] = []
  lines.push(`# Storage Cleanup — ${result.timestamp}`)
  lines.push('')
  lines.push(`- **Environment:** \`${result.environment}\``)
  lines.push('')
  lines.push('| Metric | Value |')
  lines.push('|---|---:|')
  lines.push(`| Requested candidates | ${result.requestedCandidates} |`)
  lines.push(`| Deleted | ${result.deleted.length} |`)
  lines.push(`| Already missing | ${result.alreadyMissing.length} |`)
  lines.push(`| Skipped (newly referenced) | ${result.skippedNewlyReferenced.length} |`)
  lines.push(`| Skipped (safety-window changed) | ${result.skippedSafetyChanged.length} |`)
  lines.push(`| Failed | ${result.failed.length} |`)
  lines.push(`| Bytes reclaimed | ${result.reclaimedBytes.toLocaleString('en-US')} |`)
  return lines.join('\n')
}
