"use client";

import * as React from "react";
import { ShoppingCart } from "lucide-react";
import type { Size } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { SizeSelector } from "@/components/ui/size-selector";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/components/ui/toast";
import { SIZES } from "@/lib/constants";

type Variant = { id: string; size: Size; stock: number };

export function BuyBox({
  product,
}: {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    variants: Variant[];
  };
}) {
  const { addItem } = useCart();
  const toast = useToast();
  const [size, setSize] = React.useState<Size | null>(null);
  const [qty, setQty] = React.useState(1);

  const stockBySize: Partial<Record<Size, number>> = {};
  const variantBySize: Partial<Record<Size, Variant>> = {};
  for (const v of product.variants) {
    stockBySize[v.size] = v.stock;
    variantBySize[v.size] = v;
  }

  const selected = size ? variantBySize[size] : undefined;
  const maxQty = selected?.stock ?? 1;
  // Clamp displayed quantity to available stock for the chosen size.
  const qtyClamped = Math.min(qty, maxQty || 1);

  const add = () => {
    if (!size || !selected) {
      toast("Please select a size", "error");
      return;
    }
    addItem({
      productId: product.id,
      variantId: selected.id,
      name: product.name,
      size,
      price: product.price,
      quantity: qtyClamped,
      image: product.image,
    });
    toast(`Added ${qtyClamped} × ${product.name} (${size})`, "success");
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Size</p>
        <SizeSelector
          sizes={SIZES}
          value={size}
          onChange={setSize}
          stockBySize={stockBySize}
        />
        {selected && (
          <p className="mt-2 text-sm text-text-muted">
            {selected.stock > 0
              ? `${selected.stock} in stock`
              : "Out of stock"}
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-foreground">Quantity</p>
        <QuantityStepper value={qtyClamped} onChange={setQty} min={1} max={maxQty || 1} />
      </div>

      <Button
        variant="accent"
        size="lg"
        fullWidth
        onClick={add}
        disabled={product.variants.every((v) => v.stock <= 0)}
      >
        <ShoppingCart className="size-5" />
        Add to cart
      </Button>
    </div>
  );
}
