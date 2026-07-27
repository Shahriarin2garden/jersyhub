"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant };

const ToastCtx = React.createContext<{
  toast: (message: string, variant?: ToastVariant) => void;
} | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};
const styles = {
  success: "border-success/40 text-success",
  error: "border-destructive/40 text-destructive",
  info: "border-ink/40 text-ink",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, variant }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
    },
    [],
  );

  const dismiss = (id: number) =>
    setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      {/* The live region is the container, not each toast: it exists for the
          whole session so a screen reader announces messages as they are added.
          `polite` means the announcement waits its turn instead of interrupting,
          and it never steals focus from what the user is doing. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-4 sm:translate-x-0"
      >
        {toasts.map((t) => {
          const Icon = icons[t.variant];
          return (
            <div
              key={t.id}
              className={cn(
                "reveal pointer-events-auto flex items-center gap-2 rounded-card border bg-card px-4 py-3 shadow-lg",
                styles[t.variant],
              )}
            >
              <Icon className="size-5 shrink-0" />
              <p className="flex-1 text-sm text-foreground">{t.message}</p>
              {/* Negative margin buys a 44px hit area without making the row
                  taller than the 36px the close glyph visually occupies. */}
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss"
                className="-m-1 flex size-11 shrink-0 items-center justify-center rounded-button text-text-muted transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx.toast;
}
