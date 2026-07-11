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
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);
