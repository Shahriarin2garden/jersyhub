import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-x-auto rounded-card border border-border bg-card">
      <table className={cn("w-full text-left text-sm", className)} {...props} />
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wide text-text-muted">
      {children}
    </thead>
  );
}

// Cells default to nowrap: on a phone the table scrolls sideways inside its own
// container, and letting cells wrap instead just produces tall ragged rows.
// Pass `whitespace-normal` on the one content-heavy column that should wrap.
export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("whitespace-nowrap px-3 py-3 font-medium sm:px-4", className)} {...props} />;
}

export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr className={cn("border-b border-border last:border-0", className)} {...props} />
  );
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn("whitespace-nowrap px-3 py-3 text-text-secondary sm:px-4", className)}
      {...props}
    />
  );
}
