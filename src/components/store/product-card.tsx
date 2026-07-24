import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export type ProductCardData = {
  slug: string;
  name: string;
  price: number;
  images: string[];
  category?: { name: string } | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = product.images[0];
  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-border bg-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-4/5 overflow-hidden bg-muted">
        {img ? (
          <Image
            src={img}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        {product.category && (
          <span className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {product.category.name}
          </span>
        )}
        <h3 className="line-clamp-2 text-base font-semibold text-foreground">
          {product.name}
        </h3>
        <p className="tabular mt-auto pt-1 text-lg font-bold text-primary">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  );
}
