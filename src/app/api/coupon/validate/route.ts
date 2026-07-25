import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { evaluateCoupon } from "@/lib/coupon";

const schema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().min(0),
});

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);

  const coupon = await prisma.coupon.findUnique({
    where: { code: parsed.data.code.toUpperCase().trim() },
  });
  const result = evaluateCoupon(coupon, parsed.data.subtotal);
  if (!result.ok) return fail(result.error, 422);

  return ok({
    code: result.coupon.code,
    discount: result.discount,
    type: result.coupon.type,
    value: result.coupon.value,
  });
}
