import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { items: true } } },
      },
    },
  });
  if (!customer) return fail("Customer not found", 404);
  return ok(customer);
}
