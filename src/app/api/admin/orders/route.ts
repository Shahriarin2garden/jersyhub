import type { NextRequest } from "next/server";
import type { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paginated, fail, getPage } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import { ORDER_STATUSES } from "@/lib/constants";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);

  const sp = req.nextUrl.searchParams;
  const { page, limit, skip } = getPage(sp, 20);

  const where: Prisma.OrderWhereInput = {};
  const status = sp.get("status");
  if (status && ORDER_STATUSES.includes(status as OrderStatus)) {
    where.status = status as OrderStatus;
  }
  const search = sp.get("search")?.trim();
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { customer: { phone: { contains: search } } },
    ];
  }

  try {
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    return paginated(orders, { page, limit, total });
  } catch {
    return fail("Failed to load orders", 500);
  }
}
