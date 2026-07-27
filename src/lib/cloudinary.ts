import { v2 as cloudinary } from "cloudinary";

/**
 * Cloudinary — image storage and delivery.
 *
 * Uploads go **directly from the browser to Cloudinary**, signed by us. The
 * bytes never pass through our own server. That matters on the hosting we
 * deploy to: a serverless function has a hard request-body limit (~6MB on
 * Netlify/Lambda), so proxying a 5MB image plus multipart overhead sits right
 * at the edge of failing, and every upload would otherwise burn function
 * invocation time and bandwidth to do nothing but forward bytes.
 *
 * We sign rather than use an unsigned preset so the API secret stays on the
 * server and only an authenticated admin can obtain permission to upload.
 */

export const UPLOAD_FOLDER = "jersyhub/products";

/** Per-image ceiling. Enforced in the browser to keep credit use predictable. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Whether real credentials are present.
 *
 * `.env.example` ships `demo` / `000` / `000` as placeholders, and with those
 * in place the app starts, the admin panel renders, the file picker opens, and
 * the failure only surfaces as a 401 from Cloudinary after the admin has
 * chosen their files. A missing configuration should announce itself, not
 * masquerade as a broken feature — so this is checked up front and reported
 * as configuration, with the fix named.
 */
export function cloudinaryConfigured(): boolean {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud || !key || !secret) return false;
  // The shipped placeholders. Treated as absent rather than as credentials,
  // because "demo" is a real Cloudinary cloud that accepts no writes.
  if (cloud === "demo" || cloud === "your-cloud-name") return false;
  if (key === "000" || key === "your-api-key") return false;
  if (secret === "000" || secret === "your-api-secret") return false;
  return true;
}

/**
 * Short-lived credentials for one browser upload. The signature covers the
 * folder and timestamp, so a leaked signature cannot be replayed into a
 * different folder and expires with Cloudinary's own timestamp window.
 */
export function signUpload(): {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
} {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder: UPLOAD_FOLDER, timestamp };
  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!,
  );
  return {
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    folder: UPLOAD_FOLDER,
    signature,
  };
}

// Re-exported so server code has one import site for Cloudinary concerns,
// while client components import it from `lib/cloudinary-url` and avoid
// pulling the SDK and the API secret into the browser bundle.
export { deliveryUrl } from "./cloudinary-url";

export default cloudinary;
