import type { AvatarFields } from './avatar'

export const PROFILE_UPDATED_EVENT = 'bikeland:profile-updated'

export type ProfileUpdatedDetail = AvatarFields & {
  userId: string
  name?: string | null
  phone?: string | null
}

export function emitProfileUpdated(detail: ProfileUpdatedDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<ProfileUpdatedDetail>(PROFILE_UPDATED_EVENT, { detail }))
}

export function onProfileUpdated(handler: (detail: ProfileUpdatedDetail) => void) {
  if (typeof window === 'undefined') {
    return () => undefined
  }

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<ProfileUpdatedDetail>
    if (customEvent.detail) {
      handler(customEvent.detail)
    }
  }

  window.addEventListener(PROFILE_UPDATED_EVENT, listener)
  return () => window.removeEventListener(PROFILE_UPDATED_EVENT, listener)
}
