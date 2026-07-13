'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'
import type { ChatConversationRow, NotificationRow } from '@/shared/types/database.types'
import {
  countUnreadNotificationRows,
  markAllNotificationRowsRead,
  markNotificationRowRead,
  mergeNotificationRows,
} from '@/shared/lib/notification-state'
import {
  chatStateFromSnapshot,
  chatWatermark,
  EMPTY_CHAT_STATE,
  ingestChatMessage,
  reconcileChatEcho,
  type ChatState,
} from './chat-state'
import { BufferedStream, watermarkMinus60Seconds } from './stream-protocol'
import {
  acquireConversationChannel,
  acquireNotificationChannel,
  fetchChatSnapshot,
  fetchLatestConversation,
  fetchNotifications,
  getChatUnreadCount,
  getNotificationUnreadCount,
  getRealtimeUserId,
  markAllNotificationsRead,
  markConversationRead,
  markNotificationRead,
  sendMessage,
  startConversation,
} from './client'

type RealtimeValue = {
  userId: string | null
  conversation: ChatConversationRow | null
  chat: ChatState
  chatUnread: number
  notifications: NotificationRow[]
  notificationUnread: number
  loading: boolean
  send: (body: string, quickQuestionId?: string) => Promise<void>
  readConversation: () => Promise<void>
  readNotification: (id: string) => Promise<void>
  readAllNotifications: () => Promise<void>
}

const Context = createContext<RealtimeValue | null>(null)

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ChatConversationRow | null>(null)
  const [chat, dispatchChat] = useReducer(
    (state: ChatState, action: Parameters<typeof reconcileChatEcho>[1]) =>
      reconcileChatEcho(state, action),
    EMPTY_CHAT_STATE
  )
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [chatUnread, setChatUnread] = useState(0)
  const [notificationUnread, setNotificationUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const chatStream = useRef(
    new BufferedStream(EMPTY_CHAT_STATE, ingestChatMessage, chatStateFromSnapshot)
  )
  const notificationStream = useRef(
    new BufferedStream<NotificationRow, NotificationRow[]>([], mergeNotificationRows, (rows) =>
      rows.reduce((state, row) => mergeNotificationRows(state, row), [] as NotificationRow[])
    )
  )

  useEffect(() => {
    let active = true
    void getRealtimeUserId()
      .then(async (id) => {
        if (!active) return
        setUserId(id)
        if (!id) {
          setLoading(false)
          return
        }
        const [latest, recent, cu, nu] = await Promise.all([
          fetchLatestConversation(),
          fetchNotifications(),
          getChatUnreadCount(),
          getNotificationUnreadCount(),
        ])
        if (!active) return
        setConversation(latest)
        setNotifications(recent)
        setChatUnread(cu)
        setNotificationUnread(nu)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!conversation) return
    const stream = chatStream.current
    stream.subscribe()
    const subscription = acquireConversationChannel(conversation.id, {
      onMessage: (row) => {
        stream.receive(row)
        if (stream.phase === 'LIVE') dispatchChat(row)
      },
      onStatus: (status) => {
        if (status === 'SUBSCRIBED') {
          const since =
            stream.phase === 'RECONNECTING'
              ? watermarkMinus60Seconds(chatWatermark(stream.state))
              : null
          void fetchChatSnapshot(conversation.id, since).then((rows) => {
            const next = stream.snapshot(rows)
            for (const row of next.ordered) dispatchChat(row)
            void getChatUnreadCount().then(setChatUnread)
          })
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          stream.reconnect()
        }
      },
    })
    return subscription.release
  }, [conversation])

  useEffect(() => {
    if (!userId) return
    const stream = notificationStream.current
    stream.subscribe()
    const subscription = acquireNotificationChannel(userId, {
      onRow: (row) => {
        stream.receive(row)
        if (stream.phase === 'LIVE') setNotifications((state) => mergeNotificationRows(state, row))
      },
      onStatus: (status) => {
        if (status === 'SUBSCRIBED') {
          const watermark = stream.state[0]?.created_at ?? null
          const since = stream.phase === 'RECONNECTING' ? watermarkMinus60Seconds(watermark) : null
          void fetchNotifications(since).then((rows) => {
            const next = stream.snapshot(rows)
            setNotifications(next)
            void getNotificationUnreadCount().then(setNotificationUnread)
          })
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          stream.reconnect()
        }
      },
    })
    return subscription.release
  }, [userId])

  const send = useCallback(
    async (body: string, quickQuestionId?: string) => {
      if (!userId) throw new Error('AUTH_REQUIRED')
      let target = conversation
      if (!target || target.status === 'resolved') {
        const id = await startConversation({
          type: 'page',
          ref: location.pathname,
          label: document.title,
          url: location.pathname,
        })
        target = { ...(await fetchLatestConversation())!, id }
        setConversation(target)
      }
      const clientMessageId = crypto.randomUUID()
      const row = await sendMessage({
        conversationId: target.id,
        body: body.trim().slice(0, 4000),
        kind: quickQuestionId ? 'quick_question' : 'text',
        quickQuestionId,
        clientMessageId,
      })
      dispatchChat(row)
    },
    [conversation, userId]
  )

  const readConversation = useCallback(async () => {
    if (!conversation) return
    setChatUnread(await markConversationRead(conversation.id))
  }, [conversation])
  const readNotification = useCallback(async (id: string) => {
    const at = new Date().toISOString()
    setNotifications((state) => markNotificationRowRead(state, id, at))
    setNotificationUnread(await markNotificationRead(id))
  }, [])
  const readAll = useCallback(async () => {
    const at = new Date().toISOString()
    setNotifications((state) => markAllNotificationRowsRead(state, at))
    setNotificationUnread(await markAllNotificationsRead())
  }, [])

  const value = useMemo(
    () => ({
      userId,
      conversation,
      chat,
      chatUnread,
      notifications,
      notificationUnread: Number.isFinite(notificationUnread)
        ? notificationUnread
        : countUnreadNotificationRows(notifications),
      loading,
      send,
      readConversation,
      readNotification,
      readAllNotifications: readAll,
    }),
    [
      userId,
      conversation,
      chat,
      chatUnread,
      notifications,
      notificationUnread,
      loading,
      send,
      readConversation,
      readNotification,
      readAll,
    ]
  )
  return <Context.Provider value={value}>{children}</Context.Provider>
}

export function useRealtime() {
  const value = useContext(Context)
  if (!value) throw new Error('useRealtime must be inside RealtimeProvider')
  return value
}
