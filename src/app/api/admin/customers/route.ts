import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { paginated, fail, getPage } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const sp = req.nextUrl.searchParams;
  const { page, limit, skip } = getPage(sp, 20);

  const where: Prisma.CustomerWhereInput = {};
  const search = sp.get("search")?.trim();
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        orders: {
          select: { total: true, createdAt: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.customer.count({ where }),
  ]);

  const data = customers.map((c) => {
    const paidOrders = c.orders.filter((o) => o.status !== "CANCELLED");
    return {
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      totalOrders: c.orders.length,
      totalSpent: paidOrders.reduce((s, o) => s + o.total, 0),
      lastOrderDate: c.orders.reduce<Date | null>(
        (latest, o) => (!latest || o.createdAt > latest ? o.createdAt : latest),
        null,
      ),
    };
  });

  return paginated(data, { page, limit, total });
}
