import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useUser } from './UserContext'
import { fetchChatUnreadCount } from '../services/chat.service'
import { supabase } from '../lib/supabase'

type ChatContextValue = {
  unreadCount: number
  refreshUnread: () => Promise<void>
}

const ChatContext = createContext<ChatContextValue>({
  unreadCount: 0,
  refreshUnread: async () => {},
})

export function ChatProvider({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useUser()
  const [unreadCount, setUnreadCount] = useState(0)

  const canUseChat = Boolean(
    currentUser && currentUser.role !== 'admin'
  )

  const refreshUnread = useCallback(async () => {
    if (!canUseChat) {
      setUnreadCount(0)
      return
    }

    try {
      setUnreadCount(await fetchChatUnreadCount())
    } catch (error) {
      console.warn('[ChatContext] unread count failed:', error)
    }
  }, [canUseChat])

  useEffect(() => {
    if (loading || !currentUser || !canUseChat) {
      setUnreadCount(0)
      return undefined
    }

    void refreshUnread()

    const channel = supabase
      .channel(`chat-unread:${currentUser.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: currentUser.role === 'superadmin'
            ? 'sender_type=eq.customer'
            : 'sender_type=eq.superadmin',
        },
        payload => {
          const senderId = (payload.new as { sender_id?: string }).sender_id
          if (senderId !== currentUser.id) void refreshUnread()
        }
      )
      .subscribe()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refreshUnread()
    }
    const onFocus = () => void refreshUnread()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('focus', onFocus)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('focus', onFocus)
      void supabase.removeChannel(channel)
    }
  }, [canUseChat, currentUser, loading, refreshUnread])

  const value = useMemo(() => ({ unreadCount, refreshUnread }), [refreshUnread, unreadCount])
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export const useChat = () => useContext(ChatContext)
