# Cloudinary admin signed-preset contract

The Cloudinary dashboard preset named by `CLOUDINARY_ADMIN_UPLOAD_PRESET` must be **signed** and configured with:

- allowed formats: `jpg,jpeg,png,webp,avif`
- maximum file size: `10485760` bytes
- overwrite disabled
- unique filename enabled
- resource type restricted to image

The Edge Function selects this preset and a whitelisted `eventies/*` folder when `ADMIN_UPLOAD_HARDENING_ENABLED=1`; clients cannot supply the preset or signed security parameters. The response retains all legacy fields and adds `uploadPreset` only in hardened mode. The client must submit the returned preset with the exact signed parameters.

Rollout is blocked until staging has the preset, the durable `consume_admin_upload_quota` RPC, AAL2 test users, UPL-NEG banned-format/oversize evidence, quota-denial evidence, and legacy frozen-client compatibility confirmation. Keep the flag off otherwise.

