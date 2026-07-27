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
    <div className="group relative flex h-full flex-col overflow-hidden rounded-card border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg">
      {/* right-1/top-1: the button carries 4px of invisible tap area around the
          36px pill, so this lands the pill at the same 8px inset as before. */}
      <WishlistButton productId={product.id} className="absolute right-1 top-1 z-10" />
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
        {/* Every text row holds a fixed height whether or not it has content, so
            a one-word jersey and a three-line one still line their prices up
            across a grid row. Without this the cards read as ragged on mobile,
            where two narrow columns make the mismatch obvious. */}
        <div className="flex flex-1 flex-col gap-1 p-3">
          <span className="block h-4 truncate text-[11px] font-semibold uppercase leading-4 tracking-[0.15em] text-text-muted">
            {product.category?.name ?? ""}
          </span>
          <h3 className="line-clamp-2 min-h-11 text-base font-medium leading-snug text-foreground transition-colors group-hover:text-ink">
            {name}
          </h3>
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 pt-1">
            <p className="tabular text-lg font-bold text-ink">
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
