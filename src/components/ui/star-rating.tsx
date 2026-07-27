"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Read-only star display. */
export function StarRating({
  value,
  count,
  size = 16,
}: {
  value: number;
  count?: number;
  size?: number;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(
              i <= Math.round(value)
                ? "fill-rating text-rating"
                : "fill-muted text-border",
            )}
          />
        ))}
      </span>
      {count != null && (
        <span className="text-sm text-text-muted">
          {value.toFixed(1)} ({count})
        </span>
      )}
    </span>
  );
}

/** Interactive star input. */
export function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = React.useState(0);
  return (
    <div className="flex" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          className="flex size-11 items-center justify-center rounded-button transition-transform active:scale-95"
        >
          <Star
            className={cn(
              "size-7",
              i <= (hover || value)
                ? "fill-rating text-rating"
                : "fill-muted text-border",
            )}
          />
        </button>
      ))}
    </div>
  );
}
