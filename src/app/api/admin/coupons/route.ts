import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import { couponSchema } from "@/lib/validations";

export async function GET() {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return ok(coupons);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code: d.code.toUpperCase().trim(),
        type: d.type,
        value: d.value,
        minSubtotal: d.minSubtotal,
        maxDiscount: d.maxDiscount ?? null,
        usageLimit: d.usageLimit ?? null,
        active: d.active,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      },
    });
    return ok(coupon, 201);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002")
      return fail("A coupon with this code already exists", 409);
    throw e;
  }
}
