import { notFound } from "next/navigation";
import { MessageCircle, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { StatusTimeline } from "@/components/ui/status-timeline";
import { StatusBadge } from "@/components/ui/status-badge";
import { whatsappLink } from "@/lib/constants";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order tracking" };

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { orderNumber: id },
    include: {
      customer: true,
      items: { include: { product: true, variant: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!order) notFound();

  const timestamps: Partial<Record<OrderStatus, Date>> = {};
  for (const h of order.statusHistory) {
    if (!timestamps[h.status]) timestamps[h.status] = h.createdAt;
  }
  timestamps.PENDING ??= order.createdAt;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Card className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-text-muted">Order number</p>
          <p className="tabular font-display text-3xl font-bold text-primary">
            {order.orderNumber}
          </p>
          <div className="mt-2">
            <StatusBadge status={order.status} />
          </div>
        </div>

        <div className="border-t border-border pt-5">
          <StatusTimeline status={order.status} timestamps={timestamps} />
        </div>

        <div className="border-t border-border pt-5">
          <h2 className="mb-3 text-lg font-semibold text-foreground">Items</h2>
          <ul className="space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-text-secondary">
                  {item.product.name} ({item.variant.size}) × {item.quantity}
                </span>
                <span className="tabular text-foreground">
                  {formatPrice(item.totalPrice)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Subtotal</dt>
              <dd className="tabular">{formatPrice(order.subtotal)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-foreground">
                <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                <dd className="tabular">−{formatPrice(order.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-text-secondary">Delivery</dt>
              <dd className="tabular">
                {order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee)}
              </dd>
            </div>
            <div className="flex justify-between text-base font-bold">
              <dt className="text-foreground">Total</dt>
              <dd className="tabular text-primary">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="border-t border-border pt-5">
          <h2 className="mb-2 flex items-center gap-1.5 text-lg font-semibold text-foreground">
            <MapPin className="size-4" /> Delivery to
          </h2>
          <p className="text-text-secondary">{order.customer.name}</p>
          <p className="text-text-secondary">{order.customer.phone}</p>
          <p className="text-text-secondary">
            {order.customer.address}, {order.customer.district}, {order.customer.division}
          </p>
        </div>

        <a
          href={whatsappLink(`Hi, I'm tracking order ${order.orderNumber}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-button bg-accent px-4 py-3 font-medium text-primary-dark hover:bg-accent-dark"
        >
          <MessageCircle className="size-5" />
          Questions? Contact us on WhatsApp
        </a>
      </Card>
    </div>
  );
}
