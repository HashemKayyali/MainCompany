# Role / Audience Matrix

| Capability | Client | Admin | Super Admin |
|---|---:|---:|---:|
| Read own notifications | Yes | Yes | Yes |
| Read another user's notifications | No | No | No |
| Mark own notification read | Yes | Yes | Yes |
| Mark all own notifications read | Yes | Yes | Yes |
| Insert arbitrary notification rows | No | No | No |
| Receive rental/quote operational notifications | No | Yes | Yes |
| Receive contact operational notifications | No | Yes | Yes |
| Receive customer chat notifications | No | No | Yes |
| Receive reply to own chat | Yes | N/A | N/A |
| Access chat inbox | No | No | Yes |
| Send custom broadcast | No | No | Yes |
| Access custom broadcast page | No | No | Yes |
| Choose Clients audience | No | No | Yes |
| Choose Admins audience | No | No | Yes |
| Choose Super Admins audience | No | No | Yes |

Security is enforced at multiple layers: navigation visibility, route guards, RPC authorization, table privileges, and RLS.
