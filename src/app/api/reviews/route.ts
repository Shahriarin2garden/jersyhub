import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { requireCustomer } from "@/lib/guard";
import { reviewSchema } from "@/lib/validations";

/** Submit or update a review. Verified-purchase only; starts PENDING. */
export async function POST(req: NextRequest) {
  const session = await requireCustomer();
  if (!session) return fail("Please log in to review", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const { productId, rating, title, comment } = parsed.data;
  const customerId = session.user.id;

  // Verified purchase: customer must have an order containing this product.
  const purchased = await prisma.orderItem.findFirst({
    where: { productId, order: { customerId } },
    select: { id: true },
  });
  if (!purchased)
    return fail("You can only review products you've ordered", 403);

  const review = await prisma.review.upsert({
    where: { productId_customerId: { productId, customerId } },
    update: { rating, title: title || null, comment: comment || null, status: "PENDING" },
    create: {
      productId,
      customerId,
      rating,
      title: title || null,
      comment: comment || null,
    },
  });

  return ok({ id: review.id, status: review.status }, 201);
}
