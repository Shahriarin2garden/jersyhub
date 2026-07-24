"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  className,
  size = "md",
}: {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      className={cn(
        "flex items-center justify-center rounded-full bg-card/90 shadow-sm transition-colors hover:bg-card",
        size === "md" ? "size-9" : "size-8",
        className,
      )}
    >
      <Heart
        className={cn(
          size === "md" ? "size-5" : "size-4",
          active ? "fill-destructive text-destructive" : "text-text-secondary",
        )}
      />
    </button>
  );
}
