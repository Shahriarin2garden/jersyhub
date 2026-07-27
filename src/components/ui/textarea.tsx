import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helper, id, required, ...props }, ref) => {
    const autoId = React.useId();
    const taId = id ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={taId} className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="text-destructive"> *</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={taId}
          required={required}
          aria-invalid={!!error}
          className={cn(
            "min-h-24 w-full rounded-button border bg-card px-3 py-2 text-base text-foreground",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-1 focus:ring-offset-background",
            error ? "border-destructive" : "border-border",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-sm text-destructive" aria-live="polite">{error}</p>
        ) : helper ? (
          <p className="text-sm text-text-muted">{helper}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
