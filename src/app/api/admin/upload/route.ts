import { ok, fail } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import {
  cloudinaryConfigured,
  signUpload,
  MAX_IMAGE_BYTES,
} from "@/lib/cloudinary";

export const runtime = "nodejs";

/**
 * Issue a one-shot signature so the browser can upload straight to Cloudinary.
 *
 * This route used to receive the image itself and forward it. That put every
 * byte through a serverless function — against a request-body limit a 5MB
 * image is close to breaching, and paying function time and bandwidth to act
 * as a pipe. Now only a signature crosses this boundary; the file goes from
 * the admin's browser to Cloudinary directly.
 *
 * Admin-only: an open signing endpoint is an open write endpoint on our
 * Cloudinary account, since possession of a valid signature is all an upload
 * requires.
 */
export async function POST() {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);

  if (!cloudinaryConfigured()) {
    // Named explicitly rather than reported as a generic failure. Left vague,
    // this is indistinguishable from a broken upload feature and costs an
    // afternoon to trace back to three unset variables.
    return fail(
      "Image uploads are not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET, then restart the server.",
      503,
    );
  }

  return ok({ ...signUpload(), maxBytes: MAX_IMAGE_BYTES });
}
