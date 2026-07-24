"use client";

import * as React from "react";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { Order, OrderStatus } from "@prisma/client";

type OrderRow = Pick<
  Order,
  "id" | "orderNumber" | "total" | "createdAt"
> & { status: OrderStatus; _count: { items: number } };

type CustomerFull = {
  name: string;
  phone: string;
  email: string | null;
  division: string;
  district: string;
  address: string;
  orders: OrderRow[];
};

export function CustomerDetailButton({ customerId }: { customerId: string }) {
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState<CustomerFull | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    setOpen(true);
    if (data) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`);
      const json = await res.json();
      if (res.ok) setData(json.data);
      else toast(json.error ?? "Failed to load", "error");
    } catch {
      toast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={load} className="text-primary hover:underline">
        View
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Customer">
        {loading && <p className="text-text-muted">Loading…</p>}
        {data && (
          <div className="space-y-4">
            <div>
              <p className="font-semibold text-foreground">{data.name}</p>
              <p className="text-sm text-text-secondary">{data.phone}</p>
              {data.email && (
                <p className="text-sm text-text-secondary">{data.email}</p>
              )}
              <p className="text-sm text-text-secondary">
                {data.address}, {data.district}, {data.division}
              </p>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">
                Orders ({data.orders.length})
              </p>
              <ul className="space-y-2">
                {data.orders.map((o) => (
                  <li
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded-button border border-border p-2 text-sm"
                  >
                    <span className="tabular font-medium text-foreground">
                      {o.orderNumber}
                    </span>
                    <StatusBadge status={o.status} />
                    <span className="tabular text-text-secondary">
                      {formatPrice(o.total)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
