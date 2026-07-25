"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = React.useState(0);
  const main = images[active] ?? images[0];

  return (
    <div className="space-y-3">
      <div className="relative aspect-4/5 overflow-hidden rounded-card bg-muted">
        {main && (
          <Image
            src={main}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        )}
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "relative aspect-4/5 w-16 shrink-0 overflow-hidden rounded-button border-2 transition-colors",
                i === active
                  ? "border-primary"
                  : "border-transparent hover:border-border",
              )}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
