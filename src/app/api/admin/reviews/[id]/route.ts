import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import { revalidateReviews } from "@/lib/cached";

const schema = z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  const review = await prisma.review.update({
    where: { id },
    data: { status: parsed.data.status },
  });
  revalidateReviews();
  return ok(review);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  await prisma.review.delete({ where: { id } });
  revalidateReviews();
  return ok({ id });
}
