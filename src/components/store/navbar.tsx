"use client";

import Link from "next/link";
import { ShoppingCart, Shirt } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function Navbar() {
  const { count, hydrated } = useCart();

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Shirt className="size-6 text-primary" />
          <span className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
            JersyHub
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/shop"
            className="text-base font-medium text-text-secondary hover:text-primary"
          >
            Shop
          </Link>
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex size-10 items-center justify-center rounded-button hover:bg-muted"
          >
            <ShoppingCart className="size-5 text-foreground" />
            {hydrated && count > 0 && (
              <span className="tabular absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
