import 'server-only'

export function evaluateSuperadminChange(input: {
  targetId: string
  targetRole: string
  nextRole: string
  activeSuperadminIds: string[]
}): 'allow' | 'final-superadmin-denied' {
  if (input.targetRole !== 'superadmin' || input.nextRole === 'superadmin') return 'allow'
  return input.activeSuperadminIds.some((id) => id !== input.targetId)
    ? 'allow'
    : 'final-superadmin-denied'
}
