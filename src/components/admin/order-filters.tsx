"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

export function OrderFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const currentStatus = params.get("status") ?? "";
  const [search, setSearch] = React.useState(params.get("search") ?? "");

  const push = (next: URLSearchParams) => {
    next.delete("page");
    router.push(`/admin/orders?${next.toString()}`);
  };

  const setStatus = (status: string) => {
    const next = new URLSearchParams(params.toString());
    if (status) next.set("status", status);
    else next.delete("status");
    push(next);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (search.trim()) next.set("search", search.trim());
    else next.delete("search");
    push(next);
  };

  const tabs = ["", ...ORDER_STATUSES];

  return (
    <div className="space-y-3">
      <form onSubmit={submitSearch} className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search order # or customer…"
          className="h-11 w-full rounded-button border border-border bg-card pl-9 pr-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        {tabs.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={cn(
              "rounded-badge px-3 py-1.5 text-sm font-medium capitalize transition-colors",
              currentStatus === s
                ? "bg-primary text-white"
                : "bg-muted text-text-secondary hover:bg-primary-light",
            )}
          >
            {s ? s.toLowerCase() : "all"}
          </button>
        ))}
      </div>
    </div>
  );
}
