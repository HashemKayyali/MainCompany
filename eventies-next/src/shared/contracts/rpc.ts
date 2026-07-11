/**
 * FOUND-018 — RPC name contracts: THE single source (grep the repo — any
 * string duplicate of these is a violation). Enumerated from the audited Vite
 * codebase; CT-RPC (FOUND-028) locks the shapes against the DB.
 */
export const RPC = {
  // chat
  getOrCreateChatConversation: 'get_or_create_chat_conversation',
  markChatConversationRead: 'mark_chat_conversation_read',
  getChatUnreadCount: 'get_chat_unread_count',
  getSuperadminChatInbox: 'get_superadmin_chat_inbox',
  setChatConversationStatus: 'set_chat_conversation_status',
  // availability / transactions
  getRentalAvailability: 'get_rental_availability',
  createRentalRequest: 'create_rental_request',
  createPurchaseQuoteRequest: 'create_purchase_quote_request',
  // admin requests
  approveRentalRequest: 'approve_rental_request',
  updateRequestStatus: 'update_request_status',
  // notifications
  getNotificationUnreadCount: 'get_notification_unread_count',
  markNotificationRead: 'mark_notification_read',
  markAllNotificationsRead: 'mark_all_notifications_read',
  previewNotificationAudience: 'preview_notification_audience',
  sendCustomNotification: 'send_custom_notification',
  // admin / roles (SECURITY DEFINER; assurance hardening lands via SEC-018/DBMIG-010)
  getAllAdmins: 'get_all_admins',
  setAdminRole: 'set_admin_role',
  removeAdmin: 'remove_admin',
  getAllUsers: 'get_all_users',
  adminUpdateUser: 'admin_update_user',
} as const

export type RpcName = (typeof RPC)[keyof typeof RPC]
