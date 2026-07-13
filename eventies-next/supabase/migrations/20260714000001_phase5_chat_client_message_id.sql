-- DBMIG-008 / CHAT-002: additive, frozen-Vite-compatible client message IDs.
-- HUMAN GATE: apply to staging and verify before enabling optimistic chat.

alter table public.chat_messages
  add column if not exists client_message_id uuid;

create unique index if not exists chat_messages_sender_client_message_id_uidx
  on public.chat_messages (sender_id, client_message_id)
  where client_message_id is not null;

comment on column public.chat_messages.client_message_id is
  'Client-generated retry/dedup key. Nullable while the frozen Vite client remains live.';

