"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

export function SortSelect() {
  const router = useRouter();
  const params = useSearchParams();

  const onChange = (value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set("sort", value);
    else sp.delete("sort");
    sp.delete("page");
    router.push(`/shop?${sp.toString()}`);
  };

  return (
    <Select
      value={params.get("sort") ?? "newest"}
      onChange={(e) => onChange(e.target.value)}
      className="w-48"
      aria-label="Sort products"
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
    </Select>
  );
}
