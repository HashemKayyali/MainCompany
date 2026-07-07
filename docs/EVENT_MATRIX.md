# Event Matrix

| Event | Recipient | Trigger source | Target | Dedupe/noise strategy |
|---|---|---|---|---|
| Rental request submitted | Submitting client | Deferred DB trigger after persisted request/items | Client request details | Deterministic submitted key |
| Rental request submitted | Every admin + superadmin | Deferred DB trigger | Exact admin request details | Per-recipient deterministic key |
| Rental confirmed | Request owner | DB status transition trigger | Client request details/tracking | Status-transition key |
| Rental rejected | Request owner | DB status transition trigger | Client request details/tracking | Status-transition key |
| Rental in preparation | Request owner | DB status transition trigger | Client request details/tracking | Status-transition key |
| Rental completed | Request owner | DB status transition trigger | Client request details/tracking | Status-transition key |
| Rental cancelled | Request owner | DB status transition trigger | Client request details/tracking | Status-transition key |
| Purchase quote submitted | Submitting client | Deferred DB trigger after persisted quote/items | Client request details | Deterministic submitted key |
| Purchase quote submitted | Every admin + superadmin | Deferred DB trigger | Exact admin quote details | Per-recipient deterministic key |
| Quote contacted | Quote owner | DB status transition trigger | Client request details | Status-transition key |
| Quote quoted | Quote owner | DB status transition trigger | Client request details | Status-transition key |
| Quote won | Quote owner | DB status transition trigger | Client request details | Status-transition key |
| Quote lost | Quote owner | DB status transition trigger | Client request details | Status-transition key |
| Quote rejected | Quote owner | DB status transition trigger | Client request details | Status-transition key |
| Contact submission | Every admin + superadmin | DB insert trigger | Admin contact detail selection | Per-recipient deterministic key |
| Authenticated client contact submission | Exact submitter | DB insert trigger | Client notifications list | Deterministic acknowledgement key |
| Anonymous contact submission | No client bell recipient | DB insert trigger | Existing form success UI remains | No fake recipient row |
| Customer chat message | Super Admins only | Chat message DB trigger | Exact admin chat conversation | Aggregated by conversation/direction/recipient |
| Super Admin chat reply | Exact customer | Chat message DB trigger | Exact client chat conversation | Aggregated by conversation/direction/recipient |
| Custom broadcast | Explicit selected audiences | Super Admin RPC | Optional safe internal path | One row per resolved recipient; overlapping selection deduped |

Exact quote message implemented:

> Your request has been quoted. Our team will contact you.
