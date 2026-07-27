import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, id, required, ...props }, ref) => {
    const autoId = React.useId();
    const inputId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive"> *</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={!!error}
          className={cn(
            "h-11 w-full rounded-button border bg-card px-3 text-base text-foreground",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1 focus:ring-offset-background",
            error ? "border-destructive" : "border-border",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-destructive" aria-live="polite">
            {error}
          </p>
        ) : helper ? (
          <p className="text-sm text-text-muted">{helper}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
