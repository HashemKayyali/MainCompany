'use client'

import { useEffect } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { runAuthBridge } from './bridge'

export function AuthSessionLifecycle() {
  useEffect(() => {
    let active = true
    runAuthBridge().then((result) => {
      if (!active || !['adopted', 'failed'].includes(result.status)) return
      void fetch('/api/auth/bridge-event', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: result.status }),
      })
    })

    // AUTH-006: exactly one browser listener. TOKEN_REFRESHED deliberately
    // does not remount providers or change component keys, preserving modals.
    const { data } = getSupabaseBrowserClient().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') window.dispatchEvent(new Event('eventies:signed-out'))
    })
    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])
  return null
}
