'use client'

import dynamic from 'next/dynamic'
import { RealtimeProvider } from './RealtimeProvider'

const ChatWidget = dynamic(() => import('./chat/ChatWidget'), { ssr: false })
const NotificationBell = dynamic(() => import('./notifications/NotificationBell'), { ssr: false })

export function RealtimeShell() {
  return (
    <RealtimeProvider>
      <NotificationBell />
      <ChatWidget />
    </RealtimeProvider>
  )
}
