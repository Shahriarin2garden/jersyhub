/**
 * Cloudinary URL helpers — pure string work, no SDK.
 *
 * Kept apart from `lib/cloudinary.ts` deliberately: that module calls
 * `cloudinary.config()` with the API secret at import time and pulls in the
 * Node SDK. Importing it from a client component would drag both into the
 * browser bundle, so anything the client needs lives here instead.
 */

/**
 * Add delivery-time transformations to a Cloudinary URL.
 *
 * We store the original once and let Cloudinary derive what each browser
 * asks for: `f_auto` serves AVIF/WebP where supported, `q_auto` picks a
 * quality per image, and `c_limit` caps the long edge without upscaling
 * anything smaller. Transforming at upload time instead would bake one size
 * in permanently and spend credits per upload rather than on cached delivery.
 *
 * Non-Cloudinary URLs (the seeded Unsplash art) pass through untouched.
 */
export function deliveryUrl(url: string, width = 1200): string {
  const marker = "/image/upload/";
  if (!url.includes("res.cloudinary.com") || !url.includes(marker)) return url;

  const [head, tail] = url.split(marker);
  // Already carries a transformation — don't stack another on top.
  if (/^(f_|q_|w_|c_|dpr_|e_|g_)/.test(tail)) return url;

  return `${head}${marker}f_auto,q_auto,c_limit,w_${width}/${tail}`;
}
