import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { usePageMeta } from '../hooks/usePageMeta'

function getSafeRedirect(path: string | null) {
  if (!path) return '/'
  return path.startsWith('/') && !path.startsWith('//') ? path : '/'
}

export default function AuthCallback() {
  usePageMeta({ title: 'Auth Callback', noIndex: true })

  useEffect(() => {
    ;(async () => {
      const hash = window.location.hash
      const hashParams = new URLSearchParams(hash.replace('#', ''))
      const type = hashParams.get('type')
      const queryParams = new URLSearchParams(window.location.search)
      const safeRedirect = getSafeRedirect(queryParams.get('redirect'))

      if (type === 'recovery') {
        window.location.replace(`/reset-password${hash}`)
        return
      }

      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)
      if (error) {
        console.error('exchangeCodeForSession error:', error)
        window.location.replace('/login')
        return
      }

      window.location.replace(safeRedirect)
    })()
  }, [])

  return (
    <section className="site-section">
      <div className="site-container max-w-[30rem]">
        <div className="glass rounded-[28px] px-6 py-8 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-violet-400/70 border-t-transparent" />
          <h1 className="mt-5 font-display text-[1.8rem] font-black text-white">
            Finishing your sign-in
          </h1>
          <p className="mt-3 text-sm leading-7 text-purple-100/68">
            We&apos;re securing your session and taking you to the right place.
          </p>
        </div>
      </div>
    </section>
  )
}
