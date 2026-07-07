# Eventies Notification System — Architecture Report

## Overview

The notification system is implemented as a database-trusted, recipient-scoped event system integrated with the current Eventies Live Chat architecture.

Core flow:

```text
Trusted database event
        ↓
PostgreSQL trigger / SECURITY DEFINER function
        ↓
One notification row per recipient
        ↓
Supabase Realtime recipient-filtered subscription
        ↓
NotificationContext state merge/deduplication
        ↓
Admin or Client bell
        ↓
Explicit read action + safe deep link
```

## Database architecture

- `public.notifications` stores one row per recipient.
- Independent `read_at` per recipient preserves per-user read/unread state.
- A partial unique index on `(recipient_user_id, dedupe_key)` prevents duplicate automatic notifications.
- Automatic notifications are generated from database triggers tied to successful persisted events.
- Clients and admins cannot insert arbitrary notification rows directly.
- Recipient RPCs only act on `auth.uid()`.
- Super Admin broadcast is performed through a guarded RPC, not direct table writes.
- Notification targets are limited to safe internal paths.

## Realtime architecture

Each signed-in user subscribes only to notification INSERT/UPDATE events for their own recipient id. RLS remains the final authorization boundary.

The client state layer:

- loads recent notifications and unread count initially;
- merges Realtime events by notification id;
- avoids double-counting duplicate events;
- catches up after Realtime reconnect, browser focus, and visibility return;
- cleans up channels and timers on unmount/account change;
- prevents stale in-flight fetches from repopulating notifications after logout or account switching.

## Live Chat integration

The implementation reuses the existing chat schema and routes.

- Customer chat messages notify Super Admins only.
- Normal admins receive no chat notification and retain no chat access.
- Super Admin replies notify only the customer who owns the conversation.
- Chat notification noise is controlled by aggregating per conversation/direction/recipient while unread instead of producing an unbounded notification row for every message.
- Chat notification deep links open the exact conversation.

## UI architecture

- Admin notification bell in the Admin layout.
- Client notification bell for authenticated non-staff users.
- Recent notification dropdown with unread badge.
- Opening the dropdown does not mark items read.
- Clicking an item marks only that item read, then navigates.
- Explicit `Mark all as read` affects only the current recipient.
- Dedicated Admin and Client notification list pages.
- Super Admin-only custom notification sender page with audience preview, safe target validation, explicit confirmation, and audit log entry.
- New Admin Contact Submissions page provides a valid deep-link destination for contact notifications.

## Files and scope

The delivery ZIP contains only modified/new source files, the SQL migration, and implementation reports. It does not include the unchanged project tree.

## Not included

Scheduled reminder notifications (for example, rental starts tomorrow or pending-review timeout reminders) are intentionally not implemented because the supplied project does not provide a reliable scheduler/cron architecture. These should be a separate scheduled-notification phase rather than browser timers.
