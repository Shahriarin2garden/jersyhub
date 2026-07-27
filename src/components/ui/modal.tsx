"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./button";

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;

    // Return focus to whatever opened the dialog once it closes, so keyboard
    // users don't get dropped back at the top of the document.
    const opener = document.activeElement as HTMLElement | null;

    // Lock the page behind the scrim. Without this the background scrolls
    // under the dialog on mobile, which reads as the dialog itself moving.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );

    // Move focus into the dialog. Falls back to the panel itself (tabIndex -1)
    // when there is nothing focusable inside.
    (focusables()[0] ?? panelRef.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Trap Tab inside the dialog: an aria-modal dialog that lets focus walk
      // out into the inert page behind it is worse than no dialog semantics.
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    // The scrim is a presentational backdrop, not the dialog. `role="dialog"`
    // belongs on the panel — putting it on the full-screen overlay makes the
    // whole viewport the dialog's accessible bounds.
    <div
      className="scrim-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="panel-in max-h-[85vh] w-full max-w-md overflow-y-auto rounded-modal bg-card p-5 shadow-xl focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="-m-1.5 flex size-11 shrink-0 items-center justify-center rounded-button text-text-muted transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="text-text-secondary">{children}</div>
        {footer && <div className="mt-5 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  loading,
  destructive,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  destructive?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={destructive ? "destructive" : "primary"}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
