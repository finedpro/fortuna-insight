/**
 * Absolute base URL used for link previews (Open Graph / X cards need
 * absolute image URLs). Order: an explicit NEXT_PUBLIC_SITE_URL, then
 * Netlify's own `URL` build variable (the site's primary domain, so it
 * follows a custom domain automatically after the next deploy), then the
 * Netlify subdomain.
 */
export const DEFAULT_SITE_URL = "https://fortunainsight.netlify.app";

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.URL ?? DEFAULT_SITE_URL;
  try {
    return new URL(raw).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}
