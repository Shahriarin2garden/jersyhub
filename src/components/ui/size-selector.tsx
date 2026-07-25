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
              "flex min-h-11 min-w-12 items-center justify-center rounded-button border px-3 text-sm font-medium transition-all active:scale-[0.97]",
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
