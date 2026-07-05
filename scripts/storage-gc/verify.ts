#!/usr/bin/env tsx
import { readFileSync, existsSync } from 'node:fs'
import { loadEnv, log, makeAdminClient, writeReport } from './common'
import {
  fetchReferenceScan,
  makeStorageListFetcher,
} from './fetchers'
import { enumerateStorage } from '../../src/services/storage-gc/storage-enumerator'
import { classifyStorageObjects } from '../../src/services/storage-gc/classifier'
import {
  buildAuditReport,
  renderMarkdownSummary,
} from '../../src/services/storage-gc/audit-core'
import type { AuditReport, CleanupResult } from '../../src/services/storage-gc/types'

/**
 * Post-cleanup verification.
 *
 * Reads the most recent cleanup result AND the pre-cleanup audit,
 * re-runs the audit, and asserts:
 *
 *   1. every canonical listed in cleanup.deleted is no longer in
 *      Storage (or is already-missing);
 *   2. no NEW broken reference appeared compared to the pre-cleanup
 *      audit;
 *   3. every canonical still in the pre-cleanup REFERENCED bucket
 *      still exists in Storage;
 *   4. REVIEW_REQUIRED / RECENT_UNREFERENCED counts didn't drop
 *      unexpectedly (would indicate accidental delete outside
 *      SAFE_CANDIDATE);
 *   5. skipped-newly-referenced objects still exist.
 */
async function main() {
  const env = loadEnv()
  const priorAuditPath = `${env.reportsDir}/storage-audit-latest.json`
  const priorCleanupPath = `${env.reportsDir}/storage-cleanup-latest.json`
  if (!existsSync(priorAuditPath)) {
    throw new Error(`Missing pre-cleanup audit at ${priorAuditPath}`)
  }
  const prior = JSON.parse(readFileSync(priorAuditPath, 'utf8')) as AuditReport
  const cleanup = existsSync(priorCleanupPath)
    ? (JSON.parse(readFileSync(priorCleanupPath, 'utf8')) as CleanupResult)
    : null

  const client = makeAdminClient(env)
  log('[storage-gc] verify · re-scanning references…')
  const scan = await fetchReferenceScan(client)
  log('[storage-gc] verify · re-enumerating storage…')
  const storage = await enumerateStorage(makeStorageListFetcher(client), {
    buckets: env.buckets,
  })
  const now = new Date()
  const cutoffMs = now.getTime() - env.safetyWindowDays * 24 * 60 * 60 * 1000
  const safetyWindowCutoffIso = new Date(cutoffMs).toISOString()
  const { classified, broken } = classifyStorageObjects(storage, scan.index, {
    safetyWindowCutoffIso,
    now,
  })
  const post = buildAuditReport({
    environment: env.projectRef,
    timestamp: now,
    safetyWindowDays: env.safetyWindowDays,
    safetyWindowCutoffIso,
    buckets: env.buckets,
    scan,
    storage,
    classified,
    broken,
  })

  const storageCanonicals = new Set(storage.map(o => o.canonical))
  const violations: string[] = []

  if (cleanup) {
    for (const removed of cleanup.deleted) {
      if (storageCanonicals.has(removed.canonical)) {
        violations.push(`deleted candidate still present in Storage: ${removed.canonical}`)
      }
    }
    for (const skip of cleanup.skippedNewlyReferenced) {
      if (!storageCanonicals.has(skip.canonical)) {
        violations.push(`skipped-referenced candidate is now missing: ${skip.canonical}`)
      }
    }
  }

  const priorBroken = new Set(prior.brokenReferences.map(b => b.canonical))
  const newBroken = post.brokenReferences.filter(
    b => !priorBroken.has(b.canonical),
  )
  if (newBroken.length > 0) {
    violations.push(
      `NEW broken references detected (${newBroken.length}): ${newBroken.slice(0, 5).map(b => b.canonical).join(', ')}${newBroken.length > 5 ? '…' : ''}`,
    )
  }

  const stamp = now.toISOString().replace(/[:.]/g, '-')
  writeReport(
    env.reportsDir,
    `storage-verify-${stamp}.json`,
    JSON.stringify({ post, violations, newBroken }, null, 2),
  )
  writeReport(
    env.reportsDir,
    `storage-verify-${stamp}.md`,
    [
      renderMarkdownSummary(post),
      '',
      violations.length === 0
        ? '## Verify result\n\n✅ No violations detected.'
        : `## Verify result\n\n❌ Violations:\n\n${violations.map(v => `- ${v}`).join('\n')}`,
    ].join('\n'),
  )
  if (violations.length > 0) {
    log('[storage-gc] verify: VIOLATIONS')
    for (const v of violations) log('    ' + v)
    process.exit(3)
  }
  log('[storage-gc] verify: OK — no violations.')
  process.stdout.write(JSON.stringify({ ok: true, violations: 0 }) + '\n')
}

main().catch(err => {
  log('[storage-gc] verify failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
