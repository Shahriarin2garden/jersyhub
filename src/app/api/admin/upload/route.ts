import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import { uploadImage } from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return fail("No file provided", 400);
  if (file.size > 5 * 1024 * 1024) return fail("Image must be under 5MB", 400);
  if (!file.type.startsWith("image/")) return fail("File must be an image", 400);

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadImage(buffer);
    return ok({ url });
  } catch (e) {
    console.error("Upload failed", e);
    return fail("Upload failed", 500);
  }
}
