# Legacy SQL (archived — DO NOT RUN)

These files are **historical artifacts** and **do not reflect the real database
schema**. They are kept only for reference and must never be executed against any
database (local, staging, or production).

## Files

- `schema.sql` — an early full-schema bootstrap script.
- `migration.sql` — an early one-off "run once" column-addition script.

## Why they are wrong

They describe a schema that conflicts with the live one:

| Legacy file says | Actual schema (source of truth) |
| --- | --- |
| `products.name` | `products.title` |
| `products.rental_price_per_day` | `products.price` |
| separate `admin_users` table | role lives on `profiles.role` |
| separate `app_users` table | users live in `profiles` |

## ⚠️ Critical warning

**Do NOT run `schema.sql`.** It creates an `admin_users` table and RLS policies
that key admin access off `admin_users`. The live app authorizes admins via
`profiles.role` (see `supabase/migrations/20260402_auth_admin_rpc_and_contact_rls.sql`
and `20260515_lock_profile_role.sql`). Running `schema.sql` would introduce a
parallel, contradictory admin model and **break admin permissions**.

## Source of truth

The authoritative schema is the dated migration chain in
[`supabase/migrations/`](../../supabase/migrations/). The **newest** migration
wins. When the schema changes, add a new dated migration there — never edit or
re-run these archived files.
