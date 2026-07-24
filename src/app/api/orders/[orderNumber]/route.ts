import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderNumber: string }> },
) {
  const { orderNumber } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      customer: true,
      items: { include: { product: true, variant: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) return fail("Order not found", 404);
  return ok(order);
}
