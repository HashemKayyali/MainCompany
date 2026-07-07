import NotificationList from '../../components/notifications/NotificationList'
import { usePageMeta } from '../../hooks/usePageMeta'

export default function AdminNotificationsPage() {
  usePageMeta({ title: 'Notifications', noIndex: true })
  return <NotificationList mode="admin" />
}
