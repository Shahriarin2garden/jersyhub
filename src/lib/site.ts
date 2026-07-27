/**
 * Public origin of the deployed site, used for absolute URLs in robots.txt and
 * the sitemap.
 *
 * Falls back to NEXTAUTH_URL (already required in production) and then to
 * localhost for development, so nothing breaks before the domain is attached.
 */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}
