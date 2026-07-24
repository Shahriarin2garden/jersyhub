import { Shirt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { ShopFilters } from "@/components/store/shop-filters";
import { SortSelect } from "@/components/store/sort-select";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  buildProductWhere,
  buildProductOrderBy,
  type ProductFilters,
} from "@/lib/product-query";

export const metadata = { title: "Shop" };
export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type SP = Promise<Record<string, string | string[] | undefined>>;

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const filters: ProductFilters = {
    category: str(sp.category),
    size: str(sp.size),
    minPrice: str(sp.minPrice),
    maxPrice: str(sp.maxPrice),
    search: str(sp.search),
    sort: str(sp.sort),
  };
  const page = Math.max(1, Number(str(sp.page)) || 1);

  const where = buildProductWhere(filters);

  const [products, total, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } } },
      orderBy: buildProductOrderBy(filters.sort),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { slug: true, name: true },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paramBag = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v),
  ) as Record<string, string>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold uppercase text-foreground">
          Shop jerseys
        </h1>
        <SortSelect />
      </div>

      <div className="flex gap-8">
        <ShopFilters categories={categories} />

        <div className="flex-1">
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/shop"
                  params={paramBag}
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon={Shirt}
              title="No jerseys found"
              description="Try adjusting your filters."
              action={
                <Link href="/shop">
                  <Button variant="outline">Clear filters</Button>
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
