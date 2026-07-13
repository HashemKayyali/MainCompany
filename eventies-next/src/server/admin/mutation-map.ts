import 'server-only'

import { invalidationSet } from '@/server/cache/tags'
import { ADMIN_MUTATION_ENTITIES, type AdminMutationEntity } from '@/shared/contracts/admin'

export { ADMIN_MUTATION_ENTITIES }

export function tagsForAdminMutation(entity: AdminMutationEntity, slug?: string) {
  return invalidationSet(entity, slug)
}

export function revalidationRequest(entity: AdminMutationEntity, slug?: string) {
  return { entity, ...(slug ? { slug } : {}) }
}
