"use client";

import type { Size } from "@prisma/client";
import { cn } from "@/lib/utils";

export function SizeSelector({
  sizes,
  value,
  onChange,
  stockBySize,
}: {
  sizes: Size[];
  value: Size | null;
  onChange: (s: Size) => void;
  /** stock per size; 0 or missing = unavailable */
  stockBySize: Partial<Record<Size, number>>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((s) => {
        const stock = stockBySize[s] ?? 0;
        const disabled = stock <= 0;
        const active = value === s;
        return (
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => onChange(s)}
            aria-pressed={active}
            className={cn(
              "min-w-12 rounded-button border px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-white"
                : "border-border bg-card text-foreground hover:border-primary",
              disabled &&
                "cursor-not-allowed border-border bg-muted text-text-muted line-through hover:border-border",
            )}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}
