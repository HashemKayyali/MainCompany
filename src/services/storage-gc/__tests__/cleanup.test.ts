import { describe, it, expect, vi } from 'vitest'
import { CleanupRefusalError, runCleanup } from '../cleanup-core'
import { buildAuditReport, computeIntegrityHash } from '../audit-core'
import { buildReferenceIndex } from '../reference-index'
import { classifyStorageObjects } from '../classifier'
import { IMAGE_BUCKET } from '../../storage.service'
import type { AuditReport, StorageObject } from '../types'

const PROJECT = 'https://example.supabase.co'
const url = (bucket: string, path: string) =>
  `${PROJECT}/storage/v1/object/public/${bucket}/${path}`

function makeReport(candidates: Array<{ canonical: string; path: string; size?: number; lastModifiedIso?: string }>): AuditReport {
  const storage: StorageObject[] = candidates.map(c => ({
    bucket: IMAGE_BUCKET,
    path: c.path,
    canonical: c.canonical,
    size: c.size ?? 100,
    lastModifiedIso: c.lastModifiedIso ?? '2020-01-01T00:00:00Z',
    isDirectoryPlaceholder: false,
  }))
  const NOW = new Date('2026-02-01T00:00:00Z')
  const CUTOFF = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const scan = buildReferenceIndex({})
  const { classified, broken } = classifyStorageObjects(storage, scan.index, {
    safetyWindowCutoffIso: CUTOFF,
    now: NOW,
  })
  return buildAuditReport({
    environment: 'test',
    timestamp: NOW,
    safetyWindowDays: 7,
    safetyWindowCutoffIso: CUTOFF,
    buckets: [IMAGE_BUCKET],
    scan,
    storage,
    classified,
    broken,
  })
}

const emptyLive = async () => ({})

const successDeleter = () => {
  const calls: string[][] = []
  const fn = vi.fn(async (identities: Array<{ canonical: string; bucket: string; path: string; kind: 'image' | 'video' }>) => {
    calls.push(identities.map(i => i.canonical))
    return {
      requested: identities.length,
      deleted: identities.slice(),
      alreadyMissing: [],
      failed: [],
    }
  })
  return { fn, calls }
}

/* ------------------------------------------------------------------ */

describe('cleanup: safety guards', () => {
  it('17. report hash / confirmation mismatch blocks delete mode', async () => {
    const report = makeReport([
      { canonical: `${IMAGE_BUCKET}/products/a.webp`, path: 'products/a.webp' },
    ])
    const { fn: deleter } = successDeleter()
    await expect(
      runCleanup({
        report,
        confirmationToken: 'garbage-hash',
        batchSize: 10,
        safetyWindowDays: 7,
        environment: 'test',
        timestamp: new Date(),
        now: new Date(),
        deleter,
        liveReferenceFetcher: emptyLive,
      }),
    ).rejects.toBeInstanceOf(CleanupRefusalError)
  })

  it('8. one reference-source failure in report → operators must re-audit (checked by cli); core still enforces hash', async () => {
    const report = makeReport([])
    // Even an empty candidate list has a hash — must match.
    await expect(
      runCleanup({
        report,
        confirmationToken: 'wrong',
        batchSize: 10,
        safetyWindowDays: 7,
        environment: 'test',
        timestamp: new Date(),
        now: new Date(),
        deleter: successDeleter().fn,
        liveReferenceFetcher: emptyLive,
      }),
    ).rejects.toBeInstanceOf(CleanupRefusalError)
  })

  it('refuses when safety window is loosened compared to the audit', async () => {
    const report = makeReport([])
    await expect(
      runCleanup({
        report,
        confirmationToken: report.integrityHash,
        batchSize: 10,
        safetyWindowDays: 30, // stricter than report? No — 30 > 7 → refuse
        environment: 'test',
        timestamp: new Date(),
        now: new Date(),
        deleter: successDeleter().fn,
        liveReferenceFetcher: emptyLive,
      }),
    ).rejects.toBeInstanceOf(CleanupRefusalError)
  })
})

describe('cleanup: happy path & idempotence', () => {
  it('deletes all SAFE_CANDIDATE items when nothing new references them', async () => {
    const report = makeReport([
      { canonical: `${IMAGE_BUCKET}/products/a.webp`, path: 'products/a.webp', size: 100 },
      { canonical: `${IMAGE_BUCKET}/products/b.webp`, path: 'products/b.webp', size: 200 },
    ])
    const { fn: deleter, calls } = successDeleter()
    const result = await runCleanup({
      report,
      confirmationToken: report.integrityHash,
      batchSize: 10,
      safetyWindowDays: 7,
      environment: 'test',
      timestamp: new Date(),
      now: new Date('2026-02-01T00:00:00Z'),
      deleter,
      liveReferenceFetcher: emptyLive,
    })
    expect(result.deleted).toHaveLength(2)
    expect(result.reclaimedBytes).toBe(300)
    expect(calls.flat().sort()).toEqual([
      `${IMAGE_BUCKET}/products/a.webp`,
      `${IMAGE_BUCKET}/products/b.webp`,
    ])
  })

  it('7. live re-check: candidate now referenced → SKIPPED', async () => {
    const target = `${IMAGE_BUCKET}/products/a.webp`
    const report = makeReport([
      { canonical: target, path: 'products/a.webp', size: 100 },
    ])
    // Live fetcher reports the file is now referenced by a
    // category — cleanup must skip.
    const liveFetcher = async () => ({
      categories: [{ id: 'c1', image: url(IMAGE_BUCKET, 'products/a.webp') }],
    })
    const { fn: deleter, calls } = successDeleter()
    const result = await runCleanup({
      report,
      confirmationToken: report.integrityHash,
      batchSize: 10,
      safetyWindowDays: 7,
      environment: 'test',
      timestamp: new Date(),
      now: new Date('2026-02-01T00:00:00Z'),
      deleter,
      liveReferenceFetcher: liveFetcher,
    })
    expect(calls).toHaveLength(0)
    expect(result.skippedNewlyReferenced).toHaveLength(1)
    expect(result.deleted).toHaveLength(0)
  })

  it('11. duplicate candidate paths → one deletion attempt', async () => {
    const target = `${IMAGE_BUCKET}/products/dup.webp`
    const report = makeReport([
      { canonical: target, path: 'products/dup.webp' },
    ])
    // Manually add a duplicate to the candidate list to simulate
    // a broken/edited report.
    report.safeCandidates.push({ ...report.safeCandidates[0] })
    // Recompute hash so cleanup accepts the doctored report.
    report.integrityHash = computeIntegrityHash(report.safeCandidates)
    const { fn: deleter, calls } = successDeleter()
    await runCleanup({
      report,
      confirmationToken: report.integrityHash,
      batchSize: 10,
      safetyWindowDays: 7,
      environment: 'test',
      timestamp: new Date(),
      now: new Date('2026-02-01T00:00:00Z'),
      deleter,
      liveReferenceFetcher: emptyLive,
    })
    // Only one deletion attempt despite the duplicate.
    expect(calls.flat().filter(c => c === target)).toHaveLength(1)
  })

  it('12. already-missing candidate handled idempotently', async () => {
    const target = `${IMAGE_BUCKET}/products/gone.webp`
    const report = makeReport([{ canonical: target, path: 'products/gone.webp' }])
    const deleter = async () => ({
      requested: 1,
      deleted: [],
      alreadyMissing: [
        {
          canonical: target,
          bucket: IMAGE_BUCKET,
          path: 'products/gone.webp',
          kind: 'image' as const,
        },
      ],
      failed: [],
    })
    const result = await runCleanup({
      report,
      confirmationToken: report.integrityHash,
      batchSize: 10,
      safetyWindowDays: 7,
      environment: 'test',
      timestamp: new Date(),
      now: new Date('2026-02-01T00:00:00Z'),
      deleter,
      liveReferenceFetcher: emptyLive,
    })
    expect(result.deleted).toHaveLength(0)
    expect(result.alreadyMissing).toEqual([target])
  })

  it('13. partial batch deletion failure reported', async () => {
    const a = `${IMAGE_BUCKET}/products/a.webp`
    const b = `${IMAGE_BUCKET}/products/b.webp`
    const report = makeReport([
      { canonical: a, path: 'products/a.webp' },
      { canonical: b, path: 'products/b.webp' },
    ])
    const deleter = async (
      identities: Array<{ canonical: string; bucket: string; path: string; kind: 'image' | 'video' }>,
    ) => ({
      requested: identities.length,
      deleted: [identities[0]],
      alreadyMissing: [],
      failed: [{
        canonical: identities[1].canonical,
        bucket: identities[1].bucket,
        path: identities[1].path,
        error: 'rate limited',
      }],
    })
    const result = await runCleanup({
      report,
      confirmationToken: report.integrityHash,
      batchSize: 10,
      safetyWindowDays: 7,
      environment: 'test',
      timestamp: new Date(),
      now: new Date('2026-02-01T00:00:00Z'),
      deleter,
      liveReferenceFetcher: emptyLive,
    })
    expect(result.deleted).toHaveLength(1)
    expect(result.failed).toHaveLength(1)
    expect(result.failed[0].error).toContain('rate limited')
  })

  it('19. REVIEW_REQUIRED is never sent to delete API', async () => {
    // The audit report by construction only lists SAFE_CANDIDATE
    // items in safeCandidates. REVIEW_REQUIRED lives in a different
    // array cleanup never reads. Prove that by feeding a report
    // whose safeCandidates is empty even when review items exist.
    const report = makeReport([])
    report.reviewRequired.push({
      bucket: IMAGE_BUCKET,
      path: 'products/review.webp',
      canonical: `${IMAGE_BUCKET}/products/review.webp`,
      reason: 'test',
      lastModifiedIso: '2020-01-01T00:00:00Z',
    })
    const { fn: deleter, calls } = successDeleter()
    await runCleanup({
      report,
      confirmationToken: report.integrityHash,
      batchSize: 10,
      safetyWindowDays: 7,
      environment: 'test',
      timestamp: new Date(),
      now: new Date('2026-02-01T00:00:00Z'),
      deleter,
      liveReferenceFetcher: emptyLive,
    })
    expect(calls).toEqual([])
  })

  it('batches candidates according to batchSize', async () => {
    const targets = Array.from({ length: 5 }).map((_, i) => ({
      canonical: `${IMAGE_BUCKET}/products/x${i}.webp`,
      path: `products/x${i}.webp`,
    }))
    const report = makeReport(targets)
    const { fn: deleter, calls } = successDeleter()
    await runCleanup({
      report,
      confirmationToken: report.integrityHash,
      batchSize: 2,
      safetyWindowDays: 7,
      environment: 'test',
      timestamp: new Date(),
      now: new Date('2026-02-01T00:00:00Z'),
      deleter,
      liveReferenceFetcher: emptyLive,
    })
    // 5 items / batchSize 2 → 3 deleter calls (2 + 2 + 1).
    expect(calls).toHaveLength(3)
    expect(calls.flat().sort()).toEqual(targets.map(t => t.canonical).sort())
  })

  it('skips candidate whose lastModified moved inside the safety window since audit', async () => {
    const target = `${IMAGE_BUCKET}/products/moving.webp`
    const report = makeReport([{ canonical: target, path: 'products/moving.webp' }])
    // Force the candidate's lastModified to be very recent for this
    // run — simulates the object having been overwritten since the
    // audit was captured.
    report.safeCandidates[0].lastModifiedIso = '2026-02-01T00:00:00Z'
    report.integrityHash = computeIntegrityHash(report.safeCandidates)
    const { fn: deleter } = successDeleter()
    const result = await runCleanup({
      report,
      confirmationToken: report.integrityHash,
      batchSize: 10,
      safetyWindowDays: 7,
      environment: 'test',
      timestamp: new Date(),
      now: new Date('2026-02-01T00:00:00Z'),
      deleter,
      liveReferenceFetcher: emptyLive,
    })
    expect(result.skippedSafetyChanged).toHaveLength(1)
    expect(result.deleted).toHaveLength(0)
  })
})

describe('post-cleanup verification (20)', () => {
  it('20. no new broken references should be reported by a fresh audit after a clean SAFE_CANDIDATE-only cleanup', () => {
    // Simulate: pre-cleanup audit + post-cleanup audit both use the
    // same live reference index; deleted objects were SAFE_CANDIDATE
    // (not referenced), so the post-cleanup broken count MUST equal
    // the pre-cleanup broken count.
    const NOW = new Date('2026-02-15T00:00:00Z')
    const CUTOFF = new Date(NOW.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const target: StorageObject = {
      bucket: IMAGE_BUCKET,
      path: 'products/gone.webp',
      canonical: `${IMAGE_BUCKET}/products/gone.webp`,
      size: 10,
      lastModifiedIso: '2020-01-01T00:00:00Z',
      isDirectoryPlaceholder: false,
    }
    const scan = buildReferenceIndex({})
    const beforeCleanup = classifyStorageObjects([target], scan.index, {
      safetyWindowCutoffIso: CUTOFF,
      now: NOW,
    })
    expect(beforeCleanup.classified[0].classification).toBe('SAFE_CANDIDATE')
    expect(beforeCleanup.broken).toHaveLength(0)

    // Simulate deletion.
    const afterCleanup = classifyStorageObjects([], scan.index, {
      safetyWindowCutoffIso: CUTOFF,
      now: NOW,
    })
    // No new broken references (the DB never pointed at this file
    // to begin with).
    expect(afterCleanup.broken).toHaveLength(0)
  })
})
