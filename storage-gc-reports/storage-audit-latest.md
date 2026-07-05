# Storage Audit — 2026-07-05T21:41:37.090Z

- **Environment:** `dqizzlcsioqykfeldtsj`
- **Buckets:** `product-images`, `product-videos`
- **Safety window:** 7 days
- **Cutoff:** 2026-06-28T21:41:37.090Z

## Totals

| Metric | Value |
|---|---:|
| DB references (raw) | 176 |
| DB references (unique canonical) | 146 |
| Duplicate DB references | 30 |
| Storage objects enumerated | 456 |
| Referenced | 144 |
| SAFE_CANDIDATE | 240 |
| REVIEW_REQUIRED | 7 |
| RECENT_UNREFERENCED | 65 |
| UNKNOWN_OR_UNPARSEABLE | 0 |
| BROKEN_REFERENCE | 2 |
| Estimated reclaimable bytes (SAFE_CANDIDATE only) | 21,063,530 |

## Per-folder breakdown

| Folder | Objects | Bytes |
|---|---:|---:|
| `product-images/categories` | 29 | 1,388,198 |
| `product-images/custom-builds` | 19 | 1,326,186 |
| `product-images/customers` | 26 | 3,179,116 |
| `product-images/gallery` | 136 | 334,256,226 |
| `product-images/parts` | 2 | 0 |
| `product-images/products` | 238 | 11,367,224 |
| `product-videos/products` | 6 | 27,574,346 |

## Integrity hash

```
54c491904640ddcb761160209fd62e5a2834e8b0ae880ee9a0d71eb4543b1a4a
```

_Cleanup mode requires this hash as `--confirm`. Any edit to the SAFE_CANDIDATE list changes the hash._