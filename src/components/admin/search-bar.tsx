"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBar({
  basePath,
  placeholder = "Search…",
}: {
  basePath: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = React.useState(params.get("search") ?? "");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (value.trim()) next.set("search", value.trim());
    else next.delete("search");
    next.delete("page");
    router.push(`${basePath}?${next.toString()}`);
  };

  return (
    <form onSubmit={submit} className="relative w-72 max-w-full">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-button border border-border bg-card pl-9 pr-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </form>
  );
}
