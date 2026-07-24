import type { Prisma, Size } from "@prisma/client";

export type ProductFilters = {
  category?: string; // comma-separated slugs
  size?: string; // comma-separated sizes
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sort?: string;
};

export function buildProductWhere(f: ProductFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { status: "PUBLISHED" };

  const cats = (f.category ?? "").split(",").filter(Boolean);
  if (cats.length) where.category = { slug: { in: cats } };

  const sizes = (f.size ?? "").split(",").filter(Boolean) as Size[];
  if (sizes.length) {
    where.variants = { some: { size: { in: sizes }, stock: { gt: 0 } } };
  }

  const min = Number(f.minPrice);
  const max = Number(f.maxPrice);
  if (f.minPrice && !Number.isNaN(min)) where.price = { ...(where.price as object), gte: min };
  if (f.maxPrice && !Number.isNaN(max)) where.price = { ...(where.price as object), lte: max };

  if (f.search?.trim()) {
    where.name = { contains: f.search.trim(), mode: "insensitive" };
  }

  return where;
}

export function buildProductOrderBy(
  sort?: string,
): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    default:
      return { createdAt: "desc" };
  }
}
