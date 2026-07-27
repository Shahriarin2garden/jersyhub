import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "amber" | "green";
}) {
  const tones = {
    default: "bg-primary-light text-primary",
    amber: "bg-status-pending-bg text-status-pending-text",
    green: "bg-accent-light text-primary-dark",
  };
  return (
    // min-w-0 + truncate keep a long revenue figure inside the card at the
    // two-column mobile width instead of forcing the grid wider.
    <div className="min-w-0 rounded-card border border-border bg-card p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-sm leading-snug text-text-muted">{label}</p>
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full sm:size-9",
            tones[tone],
          )}
        >
          <Icon className="size-4 sm:size-5" />
        </span>
      </div>
      <p className="tabular mt-2 truncate text-xl font-bold text-foreground sm:text-2xl">
        {value}
      </p>
    </div>
  );
}
