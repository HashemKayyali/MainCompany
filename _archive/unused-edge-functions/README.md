# Unused Edge Functions (archived)

These Supabase Edge Functions are **not wired into the app**. A repo-wide search
finds no `supabase.functions.invoke(...)` calls (or any other reference) to
`invite-admin` / `remove-admin`.

Admin management is done entirely through SECURITY DEFINER RPCs instead:

- `set_admin_role(target_id, new_role)`
- `remove_admin(target_id)`

(see `supabase/migrations/20260402_auth_admin_rpc_and_contact_rls.sql` and
`src/pages/admin/AdminUsersPage.tsx`).

They are kept here for reference only. If you ever decide to use an Edge Function
for admin invites, move the relevant folder back under `supabase/functions/` and
deploy it — but first confirm it doesn't duplicate the RPC path.
