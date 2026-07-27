"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { EmptyState } from "@/components/ui/empty-state";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/constants";

export default function CartPage() {
  const { items, subtotal, deliveryFee, total, setQuantity, removeItem, hydrated } =
    useCart();

  if (!hydrated) {
    return <div className="mx-auto max-w-7xl px-4 py-16" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Browse our jerseys and add your favorites."
          action={
            <Link href="/shop">
              <Button>Start shopping</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold uppercase text-foreground">
        Your cart
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Items */}
        <div className="divide-y divide-border rounded-card border border-border bg-card">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-4 p-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-button bg-muted">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground">{item.name}</h3>
                  {/* -m-2 keeps the 44px hit area from pushing the title around. */}
                  <button
                    onClick={() => removeItem(item.variantId)}
                    aria-label="Remove item"
                    className="-m-2 flex size-11 shrink-0 items-center justify-center rounded-button text-text-muted hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <Badge className="w-fit">Size {item.size}</Badge>
                <p className="tabular text-sm text-text-muted">
                  {formatPrice(item.price)} each
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(n) => setQuantity(item.variantId, n)}
                    min={1}
                    max={20}
                  />
                  <p className="tabular font-bold text-foreground">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <Card className="h-fit lg:sticky lg:top-20">
          <h2 className="mb-4 text-lg font-semibold text-foreground">
            Order summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Subtotal</dt>
              <dd className="tabular text-foreground">{formatPrice(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-text-secondary">Delivery</dt>
              <dd className="tabular text-foreground">
                {deliveryFee === 0 ? "Free" : formatPrice(deliveryFee)}
              </dd>
            </div>
            {deliveryFee > 0 && (
              <p className="text-xs text-text-muted">
                Free delivery over {formatPrice(FREE_DELIVERY_THRESHOLD)}
              </p>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-base font-bold">
              <dt className="text-foreground">Total</dt>
              <dd className="tabular text-ink">{formatPrice(total)}</dd>
            </div>
          </dl>
          <Link href="/checkout" className="mt-5 block">
            <Button variant="accent" fullWidth size="lg">
              Proceed to checkout
            </Button>
          </Link>
          <Link
            href="/shop"
            className="mt-3 block text-center text-sm text-ink hover:underline"
          >
            Continue shopping
          </Link>
        </Card>
      </div>
    </div>
  );
}
