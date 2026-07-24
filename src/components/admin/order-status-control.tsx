"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/components/ui/toast";
import { ORDER_STATUSES } from "@/lib/constants";

export function OrderStatusControl({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = React.useState<OrderStatus>(current);
  const [loading, setLoading] = React.useState(false);

  async function patch(next: OrderStatus, note?: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next, note }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast(json.error ?? "Update failed", "error");
        return;
      }
      toast(`Order marked ${next.toLowerCase()}`, "success");
      router.refresh();
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">Current:</span>
        <StatusBadge status={current} />
      </div>

      {current === "PENDING" && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="accent"
            onClick={() => patch("CONFIRMED", "Order accepted")}
            loading={loading}
          >
            Accept
          </Button>
          <Button
            variant="destructive"
            onClick={() => patch("CANCELLED", "Order declined")}
            loading={loading}
          >
            Decline
          </Button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Select
            label="Update status"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </Select>
        </div>
        <Button
          onClick={() => patch(status)}
          loading={loading}
          disabled={status === current}
        >
          Update
        </Button>
      </div>
    </div>
  );
}
