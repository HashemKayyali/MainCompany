# Installation Notes

## Apply order

1. Back up the Supabase database.
2. Confirm the Live Chat migration is already applied and working.
3. Apply:

```text
supabase/migrations/20260706_notification_system.sql
```

4. Copy the delivered `src/` files into the matching project paths.
5. Run the project's normal checks in the real repository:

```bash
npx tsc --noEmit
npm test
npm run build
```

6. Deploy the frontend only after the database migration succeeds.
7. Smoke test with three real roles:
   - client
   - admin
   - superadmin

## Required smoke tests

- Client submits rental request: client acknowledgement + admin/superadmin notifications.
- Client submits quote request: client acknowledgement + admin/superadmin notifications.
- Contact form: admin/superadmin notifications; client acknowledgement only for authenticated client submissions.
- Rental/quote status transitions: exact owner receives only the expected lifecycle notification.
- Client chat message: Super Admin receives notification; normal admin does not.
- Super Admin reply: exact customer receives notification.
- Admin A reads own notification: Admin B copy remains unread.
- Super Admin sends custom notification to each audience selection and combined selections.
- Unsafe external/dangerous target URL is rejected.

## Important

Do not deploy the frontend before applying the migration. The UI depends on the new table and RPC functions.
