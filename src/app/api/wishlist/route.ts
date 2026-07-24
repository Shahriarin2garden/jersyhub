import type { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { requireCustomer } from "@/lib/guard";

export async function GET() {
  const session = await requireCustomer();
  if (!session) return fail("Unauthorized", 401);
  const items = await prisma.wishlistItem.findMany({
    where: { customerId: session.user.id },
    select: { productId: true },
  });
  return ok(items.map((i) => i.productId));
}

const schema = z.object({ productId: z.string().min(1) });

/** Toggle a product in the wishlist. */
export async function POST(req: NextRequest) {
  const session = await requireCustomer();
  if (!session) return fail("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const { productId } = parsed.data;
  const customerId = session.user.id;

  const existing = await prisma.wishlistItem.findUnique({
    where: { customerId_productId: { customerId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return ok({ wishlisted: false });
  }
  await prisma.wishlistItem.create({ data: { customerId, productId } });
  return ok({ wishlisted: true });
}
