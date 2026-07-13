import type { AdminMutationEntity } from '@/shared/contracts/admin'

export type RevalidationResult =
  { ok: true; tags: string[] } | { ok: false; retry: () => Promise<RevalidationResult> }

export async function requestAdminRevalidation(
  entity: AdminMutationEntity,
  slug?: string
): Promise<RevalidationResult> {
  const run = async (): Promise<RevalidationResult> => {
    const response = await fetch('/api/revalidate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity, ...(slug ? { slug } : {}) }),
    })
    if (!response.ok) return { ok: false, retry: run }
    const body = (await response.json()) as { revalidated?: string[] }
    return { ok: true, tags: body.revalidated ?? [] }
  }
  return run()
}
