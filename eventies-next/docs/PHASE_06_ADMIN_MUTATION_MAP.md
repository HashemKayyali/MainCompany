# Phase 6 admin mutation → invalidation map

Every catalog mutation is represented by `AdminMutationEntity` and must call the trusted `/api/revalidate` boundary after the database commit. Personal/admin grids are no-store and refresh explicitly; they never receive public cache tags.

| Legacy mutation surface | Operations | Entity contract | Required tags |
|---|---|---|---|
| Products | create, update, reorder, delete | `product` + old/new slug | `catalog:product:{slug}`, `catalog:products`, `home:content` |
| Categories | create, update, reorder, delete | `category` + old/new slug | `catalog:category:{slug}`, `catalog:categories`, `catalog:products`, `home:content` |
| Parts | create, update, reorder, delete | `part` + affected product slug when known | `catalog:parts`, optional `catalog:product:{slug}` |
| Custom builds | create, update, reorder, delete | `build` | `builds:list`, `builds:categories`, `home:content` |
| Custom-build categories | create, update, reorder, delete | `build` | `builds:list`, `builds:categories`, `home:content` |
| Customers | create, update, reorder, delete | `customer` | `customers:list`, `home:content` |
| Gallery albums/images | create, update, reorder, delete | `gallery` | `gallery:albums`, `home:content` |

The following mutations are intentionally no-store and have no public tag: request/quote status and notes, approval, user/admin role operations, chat, notification broadcast, logs, and contact-submission state.

## Approval lock preservation

`approve_rental_request` remains the sole approval RPC. The existing `20260610_approve_rental_lock.sql` implementation and its `pg_advisory_xact_lock(hashtext('rental_approval:' || product_id))` path are not copied, renamed, or replaced by Phase 6. Admin UI calls the RPC contract only.

