"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

/**
 * Cart link with its item count. Client-only because the cart lives in
 * localStorage — the server has no way to know the count, and `hydrated`
 * gates the badge so the markup matches on first paint instead of flashing
 * a zero and then correcting itself.
 */
export function CartLink({ label }: { label: string }) {
  const { count, hydrated } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={
        hydrated && count > 0 ? `${label} (${count})` : label
      }
      className="relative flex size-11 items-center justify-center rounded-button hover:bg-muted"
    >
      <ShoppingCart className="size-5 text-foreground" />
      {hydrated && count > 0 && (
        <span className="tabular absolute right-0.5 top-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-primary-dark">
          {count}
        </span>
      )}
    </Link>
  );
}
