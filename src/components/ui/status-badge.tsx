import type { OrderStatus, PaymentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const orderStyles: Record<OrderStatus, string> = {
  PENDING: "bg-status-pending-bg text-status-pending-text",
  CONFIRMED: "bg-status-confirmed-bg text-status-confirmed-text",
  SHIPPED: "bg-status-shipped-bg text-status-shipped-text",
  DELIVERED: "bg-status-delivered-bg text-status-delivered-text",
  CANCELLED: "bg-status-cancelled-bg text-status-cancelled-text",
};

const label: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge px-2.5 py-0.5 text-xs font-medium",
        orderStyles[status],
        className,
      )}
    >
      {label[status]}
    </span>
  );
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-badge px-2.5 py-0.5 text-xs font-medium",
        status === "PAID"
          ? "bg-status-delivered-bg text-status-delivered-text"
          : "bg-status-pending-bg text-status-pending-text",
      )}
    >
      {status === "PAID" ? "Paid" : "Unpaid"}
    </span>
  );
}
