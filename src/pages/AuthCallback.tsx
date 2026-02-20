import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    ;(async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)

      if (error) {
        console.error('exchangeCodeForSession error:', error)
      }

      // ✅ رجّعه للصفحة الرئيسية (أو غيرها)
      window.location.replace('/')
    })()
  }, [])

  return (
    <div style={{ padding: 24 }}>
      Finishing sign in...
    </div>
  )
}