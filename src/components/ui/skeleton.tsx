import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("shimmer rounded-button bg-muted", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-card border border-border bg-card p-3">
      <Skeleton className="aspect-4/5 w-full rounded-button" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/3" />
      <Skeleton className="mt-3 h-5 w-1/4" />
    </div>
  );
}

export function RowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
