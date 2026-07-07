# Eventies — Cloudinary image pipeline setup

This branch uses a hybrid image architecture:

- Existing Supabase image URLs remain unchanged and continue to render.
- New uploads can be switched to Cloudinary with one Vite environment variable.
- Cloudinary URLs are delivered responsively with `c_limit`, `f_auto`, and `q_auto`.
- Upload signing and Cloudinary deletion are handled by an authenticated Supabase Edge Function.
- The Cloudinary API secret never enters the browser bundle.
- No database migration is required for phase 1 because existing media columns already store string URLs.

## 1. Configure Supabase Edge Function secrets

Get the values from the Cloudinary console API Keys area, then run from the project root:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_SUPABASE_PROJECT_REF
npx supabase secrets set CLOUDINARY_CLOUD_NAME=vcax8jxb CLOUDINARY_API_KEY=YOUR_API_KEY CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

Do not put `CLOUDINARY_API_SECRET` in `.env`, `VITE_*`, GitHub, or Vercel frontend variables.

## 2. Deploy the Edge Function

```powershell
npx supabase functions deploy cloudinary-assets
```

The function supports two authenticated admin-only actions:

- `sign-upload`: creates a short-lived signed upload payload for direct browser-to-Cloudinary uploads.
- `delete`: deletes Cloudinary images when editors cancel, replace, remove, or delete an entity.

## 3. Switch new image uploads to Cloudinary

Local `.env.local`:

```env
VITE_IMAGE_UPLOAD_PROVIDER=cloudinary
```

Add the same variable in Vercel for the environments where the branch is being tested, then redeploy.

To roll back new uploads to the existing Supabase path without reverting code:

```env
VITE_IMAGE_UPLOAD_PROVIDER=supabase
```

## 4. Old Supabase images

No migration is required before enabling the branch.

The delivery layer detects the provider from the URL:

```text
Old Supabase URL -> existing Supabase delivery behavior
New Cloudinary URL -> responsive Cloudinary CDN transformations
```

The editor asset session also understands both providers, so replacing an old Supabase image with a new Cloudinary image performs the correct provider-specific cleanup only after a successful save.

## 5. Required smoke test order

1. Upload a new Gallery image and save.
2. Confirm the stored URL starts with `https://res.cloudinary.com/`.
3. Open the public Gallery page and confirm the Network panel requests width-specific Cloudinary URLs.
4. Upload an image, then cancel the editor; confirm the temporary Cloudinary asset is removed.
5. Replace a persisted image, save, and confirm the old provider asset is cleaned up.
6. Delete an entity with Cloudinary images and confirm cleanup succeeds.
7. Open products/albums that still use Supabase URLs and confirm they remain unchanged.

## 6. Files added for the pipeline

```text
src/services/cloudinary.service.ts
src/services/cloudinary-identity.ts
src/services/managed-asset-identity.ts
supabase/functions/cloudinary-assets/index.ts
supabase/functions/cloudinary-assets/deno.json
```

The main integration points changed are:

```text
src/services/storage.service.ts
src/services/asset-session.ts
src/lib/image-delivery.ts
```
