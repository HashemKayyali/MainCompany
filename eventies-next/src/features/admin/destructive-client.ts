export type DestructiveEntity = 'product' | 'category' | 'gallery' | 'custom_build'

export async function requestAdminDelete(operation: DestructiveEntity, targetId: string) {
  const response = await fetch('/api/admin/destructive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ operation, targetId, confirmation: 'DELETE' }),
  })
  const body = (await response.json().catch(() => ({}))) as { ok?: boolean; code?: string }
  if (!response.ok || !body.ok) throw new Error(body.code ?? 'DELETE_FAILED')
}
