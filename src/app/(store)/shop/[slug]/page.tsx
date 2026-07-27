import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { getLocale, localized } from "@/i18n/server";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/store/product-gallery";
import { BuyBox } from "@/components/store/buy-box";
import { ProductCard } from "@/components/store/product-card";
import { ReviewForm } from "@/components/store/review-form";
import { StarRating } from "@/components/ui/star-rating";
import { SIZES } from "@/lib/constants";

export const dynamic = "force-dynamic";

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
  const [product, locale, session] = await Promise.all([
    getProduct(slug),
    getLocale(),
    auth(),
  ]);
  if (!product) notFound();

  const isCustomer = session?.user?.role === "customer";

  const [related, reviews, ratingAgg] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "PUBLISHED",
        categoryId: product.categoryId,
        id: { not: product.id },
      },
      include: { category: { select: { name: true } } },
      take: 4,
    }),
    prisma.review.findMany({
      where: { productId: product.id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { name: true } } },
      take: 20,
    }),
    prisma.review.aggregate({
      where: { productId: product.id, status: "APPROVED" },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const avgRating = ratingAgg._avg.rating ?? 0;
  const reviewCount = ratingAgg._count;
  const displayName = localized(product, "name", "nameBn", locale);
  const displayDesc = localized(product, "description", "descriptionBn", locale);

  // Order variants by canonical size order.
  const variants = [...product.variants].sort(
    (a, b) => SIZES.indexOf(a.size) - SIZES.indexOf(b.size),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        <ChevronRight className="size-3.5" />
        <Link
          href={`/shop?category=${product.category.slug}`}
          className="hover:text-ink"
        >
          {product.category.name}
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{displayName}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[55%_45%]">
        <ProductGallery images={product.images} alt={displayName} />

        <div className="space-y-5">
          <div className="space-y-2">
            <Badge className="bg-primary-light text-ink">
              {localized(product.category, "name", "nameBn", locale)}
            </Badge>
            <h1 className="text-3xl font-semibold text-foreground">
              {displayName}
            </h1>
            {reviewCount > 0 && (
              <StarRating value={avgRating} count={reviewCount} />
            )}
            <div className="flex items-baseline gap-2">
              <p className="tabular text-2xl font-bold text-ink">
                {formatPrice(product.price)}
              </p>
              {product.compareAtPrice != null &&
                product.compareAtPrice > product.price && (
                  <p className="tabular text-lg text-text-muted line-through">
                    {formatPrice(product.compareAtPrice)}
                  </p>
                )}
            </div>
          </div>

          <BuyBox
            product={{
              id: product.id,
              name: displayName,
              price: product.price,
              image: product.images[0] ?? "",
              variants: variants.map((v) => ({
                id: v.id,
                size: v.size,
                stock: v.stock,
              })),
            }}
          />

          <div className="grid grid-cols-3 gap-2 border-t border-border pt-5 text-center text-xs">
            <div className="min-w-0 rounded-button bg-muted p-2">
              <p className="font-semibold text-foreground">Cash on delivery</p>
              <p className="text-text-muted">Pay when you receive</p>
            </div>
            <div className="min-w-0 rounded-button bg-muted p-2">
              <p className="font-semibold text-foreground">2–4 days</p>
              <p className="text-text-muted">Nationwide delivery</p>
            </div>
            <div className="min-w-0 rounded-button bg-muted p-2">
              <p className="font-semibold text-foreground">Authentic</p>
              <p className="text-text-muted">Quality checked</p>
            </div>
          </div>

          {displayDesc && (
            <div className="border-t border-border pt-5">
              <h2 className="mb-2 text-lg font-semibold text-foreground">
                Description
              </h2>
              <p className="leading-relaxed text-text-secondary">
                {displayDesc}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-2xl font-semibold uppercase text-foreground">
            Reviews
          </h2>
          {reviewCount > 0 && <StarRating value={avgRating} count={reviewCount} />}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <div key={r.id} className="rounded-card border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-foreground">{r.customer.name}</p>
                    <StarRating value={r.rating} size={14} />
                  </div>
                  {r.title && (
                    <p className="mt-1 font-medium text-foreground">{r.title}</p>
                  )}
                  {r.comment && (
                    <p className="mt-1 text-sm text-text-secondary">{r.comment}</p>
                  )}
                  <p className="mt-2 text-xs text-text-muted">
                    {r.createdAt.toLocaleDateString("en-GB")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-text-muted">No reviews yet. Be the first!</p>
            )}
          </div>
          <div>
            <ReviewForm productId={product.id} loggedIn={isCustomer} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold uppercase text-foreground">
            You may also like
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
