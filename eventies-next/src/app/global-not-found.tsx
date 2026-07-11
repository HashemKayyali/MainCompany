/* eslint-disable @next/next/no-html-link-for-pages --
   global-not-found bypasses the app's rendering entirely: there is no router
   context, a plain anchor is the documented pattern here. */
/**
 * Global not-found: catches URLs that match no route at all. Bilingual static
 * copy on purpose — no request/locale context exists out here. Note D-P1-01:
 * URLs that PARTIALLY match the [locale] tree render Next's PPR 404 fallback
 * (HTTP 200 + robots noindex + client 404 UI) instead of reaching this file;
 * the real-404 strategy is a P2 decision gated by SEO-404.
 */
export const metadata = {
  title: 'Page not found | Eventies',
  robots: { index: false, follow: false },
}

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body>
        <main>
          <h1>Page not found · الصفحة غير موجودة</h1>
          <p>The page you are looking for does not exist or has moved.</p>
          <p dir="rtl">الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>
          <a href="/">Back to home · العودة إلى الرئيسية</a>
        </main>
      </body>
    </html>
  )
}
