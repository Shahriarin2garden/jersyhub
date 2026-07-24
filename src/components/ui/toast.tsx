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
  success: "border-accent/40 text-accent",
  error: "border-destructive/40 text-destructive",
  info: "border-primary/40 text-primary",
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
      <div className="fixed bottom-4 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 sm:left-auto sm:right-4 sm:translate-x-0">
        {toasts.map((t) => {
          const Icon = icons[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "flex items-center gap-2 rounded-card border bg-card px-4 py-3 shadow-lg",
                styles[t.variant],
              )}
            >
              <Icon className="size-5 shrink-0" />
              <p className="flex-1 text-sm text-foreground">{t.message}</p>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
                <X className="size-4 text-text-muted" />
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
