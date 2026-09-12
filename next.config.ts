import type { NextConfig } from "next";

/**
 * Launch-readiness hardening. This app loads no external images,
 * scripts, or fonts anywhere (confirmed by inspection before writing
 * this policy) - every resource is same-origin, so a strict
 * default-src 'self' is safe rather than a guess. Re-check this
 * policy if the app ever adds an external resource (a CDN script, an
 * external image domain, etc.) - it will need an explicit CSP
 * allowance at that point, not a silent failure.
 *
 * 'unsafe-eval' is added to script-src ONLY in development - Next.js's
 * own Fast Refresh/HMR uses eval() for source-mapped hot reloading in
 * `next dev`, which this strict CSP otherwise blocks outright (found
 * via live verification: the dev server loaded but every page hung on
 * "Loading..." forever, since Fast Refresh's own eval() call was the
 * thing silently failing). Production builds never use eval() for
 * this, so production stays fully strict with no 'unsafe-eval'.
 */
const isDev = process.env.NODE_ENV !== "production";

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`, // Next.js inlines small hydration scripts; no external script sources exist in this app
  "style-src 'self' 'unsafe-inline'", // Tailwind's generated styles are inlined by Next.js
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'", // the browser only ever talks to this app's own same-origin API proxy routes - never directly to the backend or to CoinGecko
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-Frame-Options", value: "DENY" }, // belt-and-suspenders alongside frame-ancestors for older browsers
        ],
      },
    ];
  },
};

export default nextConfig;
