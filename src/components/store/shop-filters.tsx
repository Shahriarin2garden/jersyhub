"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SIZES } from "@/lib/constants";

type Cat = { slug: string; name: string };

export function ShopFilters({ categories }: { categories: Cat[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const activeCats = new Set((params.get("category") ?? "").split(",").filter(Boolean));
  const activeSizes = new Set((params.get("size") ?? "").split(",").filter(Boolean));

  const update = (key: string, value: string | null) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value);
    else sp.delete(key);
    sp.delete("page");
    router.push(`/shop?${sp.toString()}`);
  };

  const toggle = (key: string, set: Set<string>, val: string) => {
    if (set.has(val)) set.delete(val);
    else set.add(val);
    update(key, [...set].join(",") || null);
  };

  const clearAll = () => router.push("/shop");
  const hasFilters =
    activeCats.size > 0 ||
    activeSizes.size > 0 ||
    params.get("minPrice") ||
    params.get("maxPrice");

  const body = (
    <div className="space-y-6">
      <fieldset>
        <legend className="mb-2 text-sm font-semibold uppercase text-foreground">
          Category
        </legend>
        <div className="space-y-0.5">
          {categories.map((c) => (
            // min-h-11 gives the whole row a thumb-sized hit area, not just the box.
            <label
              key={c.slug}
              className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-text-secondary"
            >
              <input
                type="checkbox"
                checked={activeCats.has(c.slug)}
                onChange={() => toggle("category", activeCats, c.slug)}
                className="size-4 accent-primary"
              />
              {c.name}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold uppercase text-foreground">
          Size
        </legend>
        <div className="flex flex-wrap gap-2">
          {SIZES.map((s) => (
            <label key={s} className="cursor-pointer">
              <input
                type="checkbox"
                checked={activeSizes.has(s)}
                onChange={() => toggle("size", activeSizes, s)}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-button border border-border px-3 text-sm text-foreground peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white">
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold uppercase text-foreground">
          Price (৳)
        </legend>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            defaultValue={params.get("minPrice") ?? ""}
            onBlur={(e) => update("minPrice", e.target.value || null)}
          />
          <span className="text-text-muted">–</span>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={params.get("maxPrice") ?? ""}
            onBlur={(e) => update("maxPrice", e.target.value || null)}
          />
        </div>
      </fieldset>

      {hasFilters && (
        <Button variant="ghost" fullWidth onClick={clearAll}>
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="mb-4 lg:hidden">
        <Button variant="outline" onClick={() => setOpen(true)}>
          <SlidersHorizontal className="size-4" /> Filters
        </Button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 lg:block">{body}</aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-80 max-w-[85%] overflow-y-auto bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-2 flex size-11 items-center justify-center rounded-button hover:bg-muted"
              >
                <X className="size-5 text-text-muted" />
              </button>
            </div>
            {body}
            <Button fullWidth className="mt-6" onClick={() => setOpen(false)}>
              Apply
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
