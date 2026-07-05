#!/usr/bin/env tsx
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

async function main() {
  const env = loadEnv()
  log(`[storage-gc] Audit start · project=${env.projectRef} · safety=${env.safetyWindowDays}d`)

  const client = makeAdminClient(env)
  log('[storage-gc] Scanning reference sources…')
  const scan = await fetchReferenceScan(client)
  log(
    `[storage-gc] Reference sources scanned=${scan.sourcesScanned.length}` +
      ` failed=${scan.sourcesFailed.length} unique=${scan.index.size} raw=${scan.rawReferenceCount}`,
  )
  if (scan.sourcesFailed.length > 0) {
    log('[storage-gc] Failed sources:')
    for (const line of scan.sourcesFailed) log('    ' + line)
    log('[storage-gc] Report will note this — cleanup mode will refuse to run.')
  }

  log('[storage-gc] Enumerating storage buckets…')
  const storageObjects = await enumerateStorage(makeStorageListFetcher(client), {
    buckets: env.buckets,
    onProgress: msg => log(`    ${msg}`),
  })
  log(`[storage-gc] Enumerated ${storageObjects.length} storage entries`)

  const now = new Date()
  const cutoffMs = now.getTime() - env.safetyWindowDays * 24 * 60 * 60 * 1000
  const safetyWindowCutoffIso = new Date(cutoffMs).toISOString()

  const { classified, broken } = classifyStorageObjects(storageObjects, scan.index, {
    safetyWindowCutoffIso,
    now,
  })

  const report = buildAuditReport({
    environment: env.projectRef,
    timestamp: now,
    safetyWindowDays: env.safetyWindowDays,
    safetyWindowCutoffIso,
    buckets: env.buckets,
    scan,
    storage: storageObjects,
    classified,
    broken,
  })

  // Explicit note on scan failures so a consumer of the JSON sees
  // it too, even without reading the summary.
  const jsonPayload = {
    ...report,
    sourcesScanned: scan.sourcesScanned,
    sourcesFailed: scan.sourcesFailed,
  }

  const stamp = now.toISOString().replace(/[:.]/g, '-')
  const jsonPath = writeReport(
    env.reportsDir,
    `storage-audit-${stamp}.json`,
    JSON.stringify(jsonPayload, null, 2),
  )
  const mdPath = writeReport(
    env.reportsDir,
    `storage-audit-${stamp}.md`,
    renderMarkdownSummary(report),
  )
  // A stable "latest" symlink-equivalent for cleanup / verify to
  // find without needing to pass the exact stamp.
  writeReport(
    env.reportsDir,
    'storage-audit-latest.json',
    JSON.stringify(jsonPayload, null, 2),
  )
  writeReport(
    env.reportsDir,
    'storage-audit-latest.md',
    renderMarkdownSummary(report),
  )

  log(`[storage-gc] Report → ${jsonPath}`)
  log(`[storage-gc] Summary → ${mdPath}`)
  log(`[storage-gc] SAFE_CANDIDATES=${report.totals.safeCandidates}` +
    ` REVIEW_REQUIRED=${report.totals.reviewRequired}` +
    ` BROKEN=${report.totals.brokenReferences}`)
  log(`[storage-gc] Integrity hash: ${report.integrityHash}`)

  // stdout gets a very small JSON summary so CI can grep it.
  process.stdout.write(
    JSON.stringify({
      environment: env.projectRef,
      totals: report.totals,
      integrityHash: report.integrityHash,
      sourcesFailed: scan.sourcesFailed,
    }) + '\n',
  )
}

main().catch(err => {
  log('[storage-gc] audit failed:', err instanceof Error ? err.message : err)
  process.exit(1)
})
