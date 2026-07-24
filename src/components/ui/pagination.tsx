import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Server-friendly pagination. Builds hrefs by merging `page` into params. */
export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) sp.set(k, v);
    sp.set("page", String(p));
    return `${basePath}?${sp.toString()}`;
  };

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <Link
        href={href(prev)}
        aria-disabled={page <= 1}
        className={cn(
          "flex size-9 items-center justify-center rounded-button border border-border bg-card text-foreground hover:bg-muted",
          page <= 1 && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="size-4" />
      </Link>
      <span className="tabular px-2 text-sm text-text-secondary">
        Page {page} of {totalPages}
      </span>
      <Link
        href={href(next)}
        aria-disabled={page >= totalPages}
        className={cn(
          "flex size-9 items-center justify-center rounded-button border border-border bg-card text-foreground hover:bg-muted",
          page >= totalPages && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="size-4" />
      </Link>
    </nav>
  );
}
