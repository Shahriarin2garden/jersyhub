import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/store/product-gallery";
import { BuyBox } from "@/components/store/buy-box";
import { ProductCard } from "@/components/store/product-card";
import { SIZES } from "@/lib/constants";

export const revalidate = 60;

async function getProduct(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, variants: true },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? "Product" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: { category: { select: { name: true } } },
    take: 4,
  });

  // Order variants by canonical size order.
  const variants = [...product.variants].sort(
    (a, b) => SIZES.indexOf(a.size) - SIZES.indexOf(b.size),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="hover:text-primary"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[55%_45%]">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="space-y-5">
          <div className="space-y-2">
            <Badge className="bg-primary-light text-primary">
              {product.category.name}
            </Badge>
            <h1 className="text-3xl font-semibold text-foreground">
              {product.name}
            </h1>
            <p className="tabular text-2xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
          </div>

          <BuyBox
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              image: product.images[0] ?? "",
              variants: variants.map((v) => ({
                id: v.id,
                size: v.size,
                stock: v.stock,
              })),
            }}
          />

          {product.description && (
            <div className="border-t border-border pt-5">
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Description
              </h2>
              <p className="leading-relaxed text-text-secondary">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold uppercase text-foreground">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
