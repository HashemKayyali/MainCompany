import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    ;(async () => {
      // Check if this is a password recovery callback
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace('#', ''))
      const type = params.get('type')

      if (type === 'recovery') {
        // Password reset — redirect to reset-password page (keep the hash so Supabase can pick it up)
        window.location.replace(`/reset-password${hash}`)
        return
      }

      // Normal auth callback (login, register, etc.)
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        console.error('exchangeCodeForSession error:', error)
      }

      window.location.replace('/')
    })()
  }, [])

  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <p>Finishing sign in...</p>
    </div>
  )
}
