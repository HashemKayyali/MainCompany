export const ADMIN_MUTATION_ENTITIES = [
  'product',
  'category',
  'part',
  'build',
  'customer',
  'gallery',
] as const
export type AdminMutationEntity = (typeof ADMIN_MUTATION_ENTITIES)[number]
