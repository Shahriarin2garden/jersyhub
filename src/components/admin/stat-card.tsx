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
    <div className="rounded-card border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <span className={cn("flex size-9 items-center justify-center rounded-full", tones[tone])}>
          <Icon className="size-5" />
        </span>
      </div>
      <p className="tabular mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
