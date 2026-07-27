"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProductToolbar() {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get("status") ?? "";
  const [search, setSearch] = React.useState(params.get("search") ?? "");

  const push = (next: URLSearchParams) => {
    next.delete("page");
    router.push(`/admin/products?${next.toString()}`);
  };

  const setStatus = (s: string) => {
    const next = new URLSearchParams(params.toString());
    if (s) next.set("status", s);
    else next.delete("status");
    push(next);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (search.trim()) next.set("search", search.trim());
    else next.delete("search");
    push(next);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={submit} className="relative w-64 max-w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-11 w-full rounded-button border border-border bg-card pl-9 pr-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </form>
        <div className="flex gap-2">
          {[
            { v: "", l: "All" },
            { v: "PUBLISHED", l: "Published" },
            { v: "DRAFT", l: "Draft" },
          ].map((t) => (
            <button
              key={t.v || "all"}
              onClick={() => setStatus(t.v)}
              className={cn(
                "rounded-badge px-3 py-1.5 text-sm font-medium transition-colors",
                status === t.v
                  ? "bg-primary text-white"
                  : "bg-muted text-text-secondary hover:bg-primary-light",
              )}
            >
              {t.l}
            </button>
          ))}
        </div>
      </div>

      <Link href="/admin/products/new">
        <Button>
          <Plus className="size-4" /> Add product
        </Button>
      </Link>
    </div>
  );
}
