import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { WishlistButton } from "@/components/store/wishlist-button";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  nameBn?: string | null;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  category?: { name: string } | null;
};

export function ProductCard({
  product,
  locale = "en",
}: {
  product: ProductCardData;
  locale?: "bn" | "en";
}) {
  const img = product.images[0];
  const name =
    locale === "bn" && product.nameBn ? product.nameBn : product.name;
  const hasDiscount =
    product.compareAtPrice != null && product.compareAtPrice > product.price;
  const off = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100,
      )
    : 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-card border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg">
      <WishlistButton productId={product.id} className="absolute right-2 top-2 z-10" />
      {hasDiscount && (
        <span className="absolute left-2 top-2 z-10 rounded-badge bg-destructive px-2 py-0.5 text-xs font-bold text-white">
          -{off}%
        </span>
      )}
      <Link href={`/shop/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative aspect-4/5 overflow-hidden bg-muted">
          {img && (
            <Image
              src={img}
              alt={name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-3">
          {product.category && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
              {product.category.name}
            </span>
          )}
          <h3 className="line-clamp-2 text-base font-medium text-foreground transition-colors group-hover:text-primary">
            {name}
          </h3>
          <div className="mt-auto flex items-baseline gap-2 pt-1">
            <p className="tabular text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            {hasDiscount && (
              <p className="tabular text-sm text-text-muted line-through">
                {formatPrice(product.compareAtPrice!)}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
