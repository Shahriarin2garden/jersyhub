import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { paginated, fail, getPage } from "@/lib/api";
import { buildProductWhere, buildProductOrderBy } from "@/lib/product-query";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = getPage(sp, 12);
    const where = buildProductWhere({
      category: sp.get("category") ?? undefined,
      size: sp.get("size") ?? undefined,
      minPrice: sp.get("minPrice") ?? undefined,
      maxPrice: sp.get("maxPrice") ?? undefined,
      search: sp.get("search") ?? undefined,
    });

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: { select: { name: true, slug: true } } },
        orderBy: buildProductOrderBy(sp.get("sort") ?? undefined),
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return paginated(products, { page, limit, total });
  } catch {
    return fail("Failed to load products", 500);
  }
}
