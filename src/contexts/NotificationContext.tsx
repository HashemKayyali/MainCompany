import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useUser } from './UserContext'
import { supabase } from '../lib/supabase'
import {
  markAllNotificationRowsRead,
  markNotificationRowRead,
  mergeNotificationRows,
} from '../lib/notification-state'
import {
  fetchNotificationUnreadCount,
  fetchRecentNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
  type AppNotification,
} from '../services/notifications.service'

type NotificationContextValue = {
  notifications: AppNotification[]
  unreadCount: number
  loading: boolean
  refreshNotifications: () => Promise<void>
  readNotification: (notificationId: string) => Promise<boolean>
  readAllNotifications: () => Promise<number>
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  refreshNotifications: async () => {},
  readNotification: async () => false,
  readAllNotifications: async () => 0,
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { currentUser, loading: userLoading } = useUser()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const refreshTimerRef = useRef<number | null>(null)
  const refreshSequenceRef = useRef(0)

  const refreshNotifications = useCallback(async () => {
    if (!currentUser?.id) {
      ++refreshSequenceRef.current
      setNotifications([])
      setUnreadCount(0)
      return
    }

    const sequence = ++refreshSequenceRef.current
    try {
      const [rows, count] = await Promise.all([
        fetchRecentNotifications(100),
        fetchNotificationUnreadCount(),
      ])
      if (sequence !== refreshSequenceRef.current) return
      setNotifications(rows)
      setUnreadCount(count)
    } catch (error) {
      console.warn('[NotificationContext] refresh failed:', error)
    }
  }, [currentUser?.id])

  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current !== null) return
    refreshTimerRef.current = window.setTimeout(() => {
      refreshTimerRef.current = null
      void refreshNotifications()
    }, 120)
  }, [refreshNotifications])

  useEffect(() => {
    if (userLoading || !currentUser?.id) {
      ++refreshSequenceRef.current
      setNotifications([])
      setUnreadCount(0)
      setLoading(false)
      return undefined
    }

    let active = true
    setLoading(true)
    void refreshNotifications().finally(() => {
      if (active) setLoading(false)
    })

    const channel = subscribeToNotifications(currentUser.id, {
      onInsert: notification => {
        setNotifications(current => mergeNotificationRows(current, notification))
        scheduleRefresh()
      },
      onUpdate: notification => {
        setNotifications(current => mergeNotificationRows(current, notification))
        scheduleRefresh()
      },
      onReady: () => scheduleRefresh(),
    })

    const catchUp = () => {
      if (document.visibilityState === 'visible') void refreshNotifications()
    }
    document.addEventListener('visibilitychange', catchUp)
    window.addEventListener('focus', catchUp)

    return () => {
      active = false
      if (refreshTimerRef.current !== null) {
        window.clearTimeout(refreshTimerRef.current)
        refreshTimerRef.current = null
      }
      document.removeEventListener('visibilitychange', catchUp)
      window.removeEventListener('focus', catchUp)
      void supabase.removeChannel(channel)
    }
  }, [currentUser?.id, refreshNotifications, scheduleRefresh, userLoading])

  const readNotification = useCallback(async (notificationId: string) => {
    const previous = notifications.find(item => item.id === notificationId)
    if (!previous) return false
    if (previous.read_at) return true

    const readAt = new Date().toISOString()
    setNotifications(current => markNotificationRowRead(current, notificationId, readAt))
    setUnreadCount(count => Math.max(0, count - 1))

    try {
      const ok = await markNotificationRead(notificationId)
      if (!ok) await refreshNotifications()
      return ok
    } catch (error) {
      console.warn('[NotificationContext] mark read failed:', error)
      await refreshNotifications()
      return false
    }
  }, [notifications, refreshNotifications])

  const readAllNotifications = useCallback(async () => {
    const readAt = new Date().toISOString()
    setNotifications(current => markAllNotificationRowsRead(current, readAt))
    setUnreadCount(0)

    try {
      const count = await markAllNotificationsRead()
      return count
    } catch (error) {
      console.warn('[NotificationContext] mark all read failed:', error)
      await refreshNotifications()
      return 0
    }
  }, [refreshNotifications])

  const value = useMemo<NotificationContextValue>(() => ({
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    readNotification,
    readAllNotifications,
  }), [loading, notifications, readAllNotifications, readNotification, refreshNotifications, unreadCount])

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export const useNotifications = () => useContext(NotificationContext)
