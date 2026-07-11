import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

/**
 * Report-only security headers per 05_SECURITY_CONSTITUTION §Headers
 * (FOUND-013, SEC-011). Rollout: report-only P1 → enforce P7 (CUT-008).
 * Origins inventoried from the audited Vite code; extend only with evidence.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com https://challenges.cloudflare.com",
  "img-src 'self' data: blob: https://res.cloudinary.com https://*.supabase.co",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
  // Confirmed Vercel default in the BASE-005 baseline; emitted explicitly for parity.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
];

const nextConfig: NextConfig = {
  // Monorepo-style layout: the Vite app owns the repo root; scope tracing here.
  outputFileTracingRoot: __dirname,
  // ADR-08 / IMG: custom Cloudinary loader; Vercel optimizer bypassed (no image
  // billing). The loader delegates to the KEPT toCloudinaryTransformUrl.
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader-entry.ts',
  },
  // ADR-19: Cache Components is the single primary cache model.
  cacheComponents: true,
  experimental: {
    // Documented escape hatch for apps whose root layout lives in a top-level
    // dynamic segment ([locale]): unmatched URLs get a real 404 at the routing
    // level (see src/app/global-not-found.tsx).
    globalNotFound: true,
  },
  cacheLife: {
    // 06_DATA_AND_CACHE_CONSTITUTION: named profiles defined ONCE here;
    // DAL functions reference them via cacheLife('catalog') / cacheLife('daily').
    catalog: {
      stale: 300, // client may reuse for 5 min without asking
      revalidate: 3600, // ≤1h backstop — missed tag invalidation self-heals (ADR-07/19)
      expire: 86400,
    },
    daily: {
      stale: 3600,
      revalidate: 86400,
      expire: 604800,
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  // CAT-018 — 308 permanent redirects for aliases → canonical primaries, for
  // both the unprefixed (EN) and /ar forms. Edge-level, before render, so the
  // alias never returns 200 content (11_SEO_CONSTITUTION §Redirects).
  async redirects() {
    const pairs: [string, string][] = [
      ["/privacy", "/privacy-policy"],
      ["/terms-of-service", "/terms"],
      ["/cookies", "/cookie-policy"],
      ["/user-login", "/login"],
      ["/forgot-password", "/reset-password"],
    ];
    return pairs.flatMap(([from, to]) => [
      { source: from, destination: to, permanent: true },
      { source: `/ar${from}`, destination: `/ar${to}`, permanent: true },
    ]);
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
