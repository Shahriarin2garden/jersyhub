import { Check, Ban } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_FLOW } from "@/lib/constants";
import { cn } from "@/lib/utils";

const stepLabels: Partial<Record<OrderStatus, string>> = {
  PENDING: "Order placed",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
};

export function StatusTimeline({
  status,
  timestamps,
}: {
  status: OrderStatus;
  timestamps?: Partial<Record<OrderStatus, Date>>;
}) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-card bg-destructive-light p-4">
        <div className="flex size-9 items-center justify-center rounded-full bg-destructive text-white">
          <Ban className="size-5" />
        </div>
        <div>
          <p className="font-semibold text-destructive">Order cancelled</p>
          <p className="text-sm text-text-muted">
            Contact us on WhatsApp if you have questions.
          </p>
        </div>
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

  return (
    <ol className="relative space-y-6">
      {ORDER_STATUS_FLOW.map((step, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        const ts = timestamps?.[step];
        return (
          <li key={step} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 transition-colors",
                  done
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-text-muted",
                )}
              >
                {done ? <Check className="size-4" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              {i < ORDER_STATUS_FLOW.length - 1 && (
                <div
                  className={cn(
                    "mt-1 h-8 w-0.5",
                    i < currentIndex ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  "font-medium",
                  isCurrent ? "text-primary" : done ? "text-foreground" : "text-text-muted",
                )}
              >
                {stepLabels[step]}
              </p>
              {ts && (
                <p className="text-xs text-text-muted">
                  {ts.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
