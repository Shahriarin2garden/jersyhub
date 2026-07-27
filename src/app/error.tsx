"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary.
 *
 * Without this, an unhandled render error in production shows Next's default
 * grey screen: no branding, no explanation, and no way back into the shop.
 *
 * `reset()` re-renders the segment, which recovers a transient failure — a
 * dropped database connection on a cold serverless invocation is the likely
 * case here — without a full page load. The digest is surfaced because it is
 * the only handle a customer can quote and we can match against the logs; the
 * message itself is deliberately not shown, since it can carry internals.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Route error", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-24 text-center">
      <span className="flex size-16 items-center justify-center rounded-full bg-destructive-light">
        <AlertTriangle aria-hidden className="size-8 text-destructive" />
      </span>
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Something went wrong
        </h1>
        <p className="mt-2 text-text-secondary">
          This page failed to load. Trying again usually fixes it.
        </p>
        {error.digest && (
          <p className="mt-3 text-xs text-text-muted">
            Reference: <span className="tabular">{error.digest}</span>
          </p>
        )}
      </div>
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button variant="accent" size="lg" fullWidth onClick={reset}>
          <RotateCw className="size-5" />
          Try again
        </Button>
        <Link href="/" className="sm:w-auto">
          <Button variant="outline" size="lg" fullWidth>
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
