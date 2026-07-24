import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, required, children, ...props }, ref) => {
    const autoId = React.useId();
    const selId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selId} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive"> *</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selId}
            required={required}
            aria-invalid={!!error}
            className={cn(
              "h-11 w-full appearance-none rounded-button border bg-card px-3 pr-9 text-base text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-background",
              error ? "border-destructive" : "border-border",
              className,
            )}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
        </div>
        {error && (
          <p className="text-sm text-destructive" aria-live="polite">{error}</p>
        )}
      </div>
    );
  },
);
Select.displayName = "Select";
