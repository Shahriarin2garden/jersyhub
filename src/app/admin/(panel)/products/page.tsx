import Image from "next/image";
import Link from "next/link";
import { Package, Pencil } from "lucide-react";
import type { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { ProductToolbar } from "@/components/admin/product-toolbar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Products" };

const PAGE_SIZE = 20;
type SP = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ProductsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const status = str(sp.status);
  const search = str(sp.search);
  const page = Math.max(1, Number(str(sp.page)) || 1);

  const where: Prisma.ProductWhereInput = {};
  if (status === "PUBLISHED" || status === "DRAFT")
    where.status = status as ProductStatus;
  if (search?.trim()) where.name = { contains: search.trim(), mode: "insensitive" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Products</h1>
      <ProductToolbar />

      {products.length > 0 ? (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Product</TH>
                <TH className="hidden sm:table-cell">Category</TH>
                <TH>Price</TH>
                <TH className="hidden md:table-cell">Stock</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <tbody>
              {products.map((p) => {
                const stock = p.variants.reduce((s, v) => s + v.stock, 0);
                return (
                  <TR key={p.id}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded bg-muted">
                          {p.images[0] && (
                            <Image
                              src={p.images[0]}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <span className="max-w-40 truncate font-medium text-foreground sm:max-w-none">
                          {p.name}
                        </span>
                      </div>
                    </TD>
                    <TD className="hidden sm:table-cell">{p.category.name}</TD>
                    <TD className="tabular">{formatPrice(p.price)}</TD>
                    <TD className="hidden md:table-cell tabular">{stock}</TD>
                    <TD>
                      <Badge
                        className={
                          p.status === "PUBLISHED"
                            ? "bg-accent-light text-ink-dark"
                            : "bg-muted text-text-muted"
                        }
                      >
                        {p.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Badge>
                    </TD>
                    <TD>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="inline-flex min-h-11 items-center gap-1 text-ink hover:underline"
                      >
                        <Pencil className="size-4" /> Edit
                      </Link>
                    </TD>
                  </TR>
                );
              })}
            </tbody>
          </Table>
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/products"
            params={{ status, search }}
          />
        </>
      ) : (
        <EmptyState
          icon={Package}
          title="No products yet"
          description="Add your first jersey to the catalog."
          action={
            <Link href="/admin/products/new">
              <span className="text-ink hover:underline">Add product</span>
            </Link>
          }
        />
      )}
    </div>
  );
}
