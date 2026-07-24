"use client";

import { Minus, Plus } from "lucide-react";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));

  return (
    <div className="inline-flex items-center rounded-button border border-border">
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        aria-label="Decrease quantity"
        className="flex size-10 items-center justify-center text-foreground disabled:opacity-40"
      >
        <Minus className="size-4" />
      </button>
      <span className="tabular w-10 text-center text-base font-medium text-foreground">
        {value}
      </span>
      <button
        type="button"
        onClick={inc}
        disabled={value >= max}
        aria-label="Increase quantity"
        className="flex size-10 items-center justify-center text-foreground disabled:opacity-40"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
