import Link from "next/link";
import { Package, Heart, Clock } from "lucide-react";
import { requireCustomer } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "My account" };

export default async function AccountOverview() {
  const session = await requireCustomer();
  const customerId = session!.user.id;

  const [customer, orderCount, wishlistCount, recent] = await Promise.all([
    prisma.customer.findUnique({ where: { id: customerId } }),
    prisma.order.count({ where: { customerId } }),
    prisma.wishlistItem.count({ where: { customerId } }),
    prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { _count: { select: { items: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Hi {customer?.name}
        </h1>
        <p className="text-text-muted">{customer?.phone}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Link href="/account/orders">
          <Card className="flex items-center gap-3 hover:border-ink">
            <Package className="size-6 text-ink" />
            <div>
              <p className="tabular text-xl font-bold text-foreground">{orderCount}</p>
              <p className="text-sm text-text-muted">Orders</p>
            </div>
          </Card>
        </Link>
        <Link href="/account/wishlist">
          <Card className="flex items-center gap-3 hover:border-ink">
            <Heart className="size-6 text-ink" />
            <div>
              <p className="tabular text-xl font-bold text-foreground">{wishlistCount}</p>
              <p className="text-sm text-text-muted">Wishlist</p>
            </div>
          </Card>
        </Link>
      </div>

      <div>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Clock className="size-5" /> Recent orders
        </h2>
        {recent.length > 0 ? (
          <div className="space-y-2">
            {recent.map((o) => (
              <Link
                key={o.id}
                href={`/order/${o.orderNumber}`}
                className="flex items-center justify-between gap-2 rounded-card border border-border bg-card p-3 hover:border-ink"
              >
                <span className="tabular font-medium text-foreground">
                  {o.orderNumber}
                </span>
                <span className="text-sm text-text-muted">
                  {o._count.items} items
                </span>
                <StatusBadge status={o.status} />
                <span className="tabular text-sm text-foreground">
                  {formatPrice(o.total)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
