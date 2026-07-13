begin;

-- The captured legacy schema restricted admin_logs.action to generic CRUD verbs.
-- Phase 6 privileged RPCs intentionally emit a small, typed action vocabulary so
-- audit evidence describes the security-sensitive operation that actually ran.
alter table public.admin_logs
  drop constraint if exists admin_logs_action_check;

alter table public.admin_logs
  add constraint admin_logs_action_check
  check (
    action = any (
      array[
        'create'::text,
        'update'::text,
        'delete'::text,
        'bulk_delete'::text,
        'role_changed'::text,
        'admin_removed'::text,
        'cloudinary_delete_started'::text,
        'cloudinary_delete_retry'::text,
        'cloudinary_delete'::text,
        'upload_quota'::text,
        'notification_broadcast'::text
      ]
    )
  );

comment on constraint admin_logs_action_check on public.admin_logs is
  'Bounded legacy CRUD and Phase 6 privileged-operation audit vocabulary.';

commit;
