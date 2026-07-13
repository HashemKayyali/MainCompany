import { RealtimeProvider } from '@/features/realtime/RealtimeProvider'
import { NotificationsView } from '@/features/realtime/notifications/NotificationsView'

export default function NotificationsPage() {
  return (
    <div className="site-container py-12">
      <RealtimeProvider>
        <NotificationsView />
      </RealtimeProvider>
    </div>
  )
}
