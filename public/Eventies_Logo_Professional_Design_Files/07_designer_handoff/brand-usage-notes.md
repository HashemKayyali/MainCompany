# Eventies Brand Export Notes

## Logo variants
1. Black wordmark version
   - For white / light backgrounds.
   - Wordmark target color: `#000000`.

2. White wordmark version
   - For black / dark / gradient backgrounds.
   - Wordmark target color: `#FFFFFF`.

3. Icon-only version
   - Use for favicon, app icons, social avatar, and compact UI spaces.

## Gradient direction
The icon keeps the original Eventies gradient family:
- Purple / violet top area
- Pink / magenta mid area
- Blue / cyan bottom area

## Safe usage
- Keep clear space around the logo.
- Do not add shadows, strokes, glows, or extra outlines to the wordmark.
- Do not recolor the gradient icon unless a full brand system is being made.
- For small sizes, use the icon-only files from `05_favicon_app_icons`.

## Website recommendations
Use WebP for performance where possible:
```html
<picture>
  <source srcset="/assets/eventies-logo-black-wordmark-800w.webp" type="image/webp">
  <img src="/assets/eventies-logo-black-wordmark-800w.png" alt="Eventies" width="800" height="auto">
</picture>
```

Favicons:
```html
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```
