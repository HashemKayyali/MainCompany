# Supabase migrations — source of truth

This dated migration chain is the **authoritative schema** for the project. The
**newest** migration always wins. When the schema changes, add a new dated file
here (`YYYYMMDD_description.sql`); never edit an already-applied migration or
re-run the archived bootstrap scripts in `_archive/legacy-sql/` (see that
folder's README for why).

## Design notes

### `request_status_history` is polymorphic *on purpose*

`request_status_history` (created in `20260401_rental_commerce.sql`) links to a
request via two plain columns:

```sql
request_type text NOT NULL CHECK (request_type IN ('rental', 'purchase_quote')),
request_id   uuid NOT NULL,   -- intentionally NOT a foreign key
```

There is **deliberately no foreign key** to `rental_requests` /
`purchase_quote_requests`. Two consequences are intended:

1. One history table can record status changes for **both** request types.
2. When a request row is deleted, its history rows are **kept** (they are not
   cascade-deleted), preserving an audit trail of what happened to a request
   even after the request itself is gone.

Because of (2), **orphaned history rows** (rows whose `request_id` no longer
points at a live request) are a known, accepted state — not a data-integrity
bug. Do not "fix" them with a foreign key or a cleanup job unless the audit-trail
requirement changes.

### `contact_submissions` admin RLS

The authoritative `contacts_admin_update` policy (and the rest of the contact
RLS) lives in `20260402_auth_admin_rpc_and_contact_rls.sql`:

```sql
CREATE POLICY "contacts_admin_update"
  ON public.contact_submissions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
```

An **older, weaker** definition of the same policy (missing the `WITH CHECK`
clause) existed in the archived `_archive/legacy-sql/migration.sql`. That file is
archived and must not be run — see `_archive/legacy-sql/README.md`. There is no
duplicate within the active migration chain, so no new migration is needed.
