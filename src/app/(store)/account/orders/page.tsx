import Link from "next/link";
import { requireCustomer } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "My orders" };

export default async function AccountOrders() {
  const session = await requireCustomer();
  const orders = await prisma.order.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true, variant: true } } },
  });

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="Your orders will show up here."
        action={
          <Link href="/shop">
            <Button>Start shopping</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">My orders</h1>
      {orders.map((o) => (
        <div key={o.id} className="rounded-card border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={`/order/${o.orderNumber}`}
              className="tabular font-semibold text-primary hover:underline"
            >
              {o.orderNumber}
            </Link>
            <StatusBadge status={o.status} />
            <span className="text-sm text-text-muted">
              {o.createdAt.toLocaleDateString("en-GB")}
            </span>
            <span className="tabular font-bold text-foreground">
              {formatPrice(o.total)}
            </span>
          </div>
          <ul className="mt-2 text-sm text-text-secondary">
            {o.items.map((it) => (
              <li key={it.id}>
                {it.product.name} ({it.variant.size}) × {it.quantity}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
