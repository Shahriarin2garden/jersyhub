import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";

export async function GET() {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);

  try {
    const [totalOrders, pending, delivered, revenue, recent] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "DELIVERED" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { name: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);

    return ok({
      stats: {
        totalOrders,
        pendingOrders: pending,
        deliveredOrders: delivered,
        totalRevenue: revenue._sum.total ?? 0,
      },
      recentOrders: recent,
    });
  } catch {
    return fail("Failed to load dashboard", 500);
  }
}
