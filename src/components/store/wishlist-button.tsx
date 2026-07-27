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
      // The button is a full 44px tap target; the visible pill sits inside it.
      // Sizing the button itself to the pill would leave a 36px target on a
      // control that lives in the corner of a card, where taps are least precise.
      // `group/wish` is named: this button sits inside the product card's own
      // unnamed `group`, and an unnamed nested group would make hovering
      // anywhere on the card light up the heart.
      className={cn("group/wish flex size-11 items-center justify-center", className)}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-card/90 shadow-sm transition-colors group-hover/wish:bg-card",
          size === "md" ? "size-9" : "size-8",
        )}
      >
        <Heart
          className={cn(
            size === "md" ? "size-5" : "size-4",
            active ? "fill-destructive text-destructive" : "text-text-secondary",
          )}
        />
      </span>
    </button>
  );
}
