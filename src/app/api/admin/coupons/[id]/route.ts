import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import { couponSchema } from "@/lib/validations";

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
  const parsed = couponSchema.partial().safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const coupon = await prisma.coupon.update({
    where: { id },
    data: {
      ...(d.code !== undefined && { code: d.code.toUpperCase().trim() }),
      ...(d.type !== undefined && { type: d.type }),
      ...(d.value !== undefined && { value: d.value }),
      ...(d.minSubtotal !== undefined && { minSubtotal: d.minSubtotal }),
      ...(d.maxDiscount !== undefined && { maxDiscount: d.maxDiscount ?? null }),
      ...(d.usageLimit !== undefined && { usageLimit: d.usageLimit ?? null }),
      ...(d.active !== undefined && { active: d.active }),
      ...(d.expiresAt !== undefined && {
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      }),
    },
  });
  return ok(coupon);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  await prisma.coupon.update({ where: { id }, data: { active: false } });
  return ok({ id, deactivated: true });
}
