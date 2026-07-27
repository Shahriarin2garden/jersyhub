import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Phone, Mail, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaymentBadge } from "@/components/ui/status-badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { OrderStatusControl } from "@/components/admin/order-status-control";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order detail" };

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true, variant: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-ink hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="tabular text-2xl font-semibold text-foreground">
          {order.orderNumber}
        </h1>
        <p className="text-sm text-text-muted">
          {order.createdAt.toLocaleString("en-GB")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Items + totals */}
        <div className="space-y-4">
          <Table>
            <THead>
              <TR>
                <TH>Product</TH>
                <TH>Size</TH>
                <TH>Qty</TH>
                <TH>Unit</TH>
                <TH>Total</TH>
              </TR>
            </THead>
            <tbody>
              {order.items.map((it) => (
                <TR key={it.id}>
                  <TD className="font-medium text-foreground">{it.product.name}</TD>
                  <TD>{it.variant.size}</TD>
                  <TD className="tabular">{it.quantity}</TD>
                  <TD className="tabular">{formatPrice(it.unitPrice)}</TD>
                  <TD className="tabular">{formatPrice(it.totalPrice)}</TD>
                </TR>
              ))}
            </tbody>
          </Table>

          <Card>
            <dl className="space-y-2 text-sm">
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
              <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                <dt className="text-foreground">Total</dt>
                <dd className="tabular text-ink">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Customer</h2>
            <p className="font-medium text-foreground">{order.customer.name}</p>
            <a
              href={`tel:${order.customer.phone}`}
              className="flex items-center gap-2 text-sm text-ink hover:underline"
            >
              <Phone className="size-4" /> {order.customer.phone}
            </a>
            {order.customer.email && (
              <p className="flex items-center gap-2 text-sm text-text-secondary">
                <Mail className="size-4" /> {order.customer.email}
              </p>
            )}
            <p className="flex items-start gap-2 text-sm text-text-secondary">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              {order.customer.address}, {order.customer.district}, {order.customer.division}
            </p>
          </Card>

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-foreground">Status</h2>
            <OrderStatusControl orderId={order.id} current={order.status} />
          </Card>

          <Card className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Payment</h2>
            <div className="flex items-center gap-2 text-sm">
              <Badge>{order.paymentMethod === "COD" ? "Cash on delivery" : "bKash"}</Badge>
              <PaymentBadge status={order.paymentStatus} />
            </div>
            {order.bkashTxnId && (
              <p className="tabular text-sm text-text-secondary">
                Txn: {order.bkashTxnId}
              </p>
            )}
          </Card>

          {order.notes && (
            <Card>
              <h2 className="mb-1 text-lg font-semibold text-foreground">Notes</h2>
              <p className="text-sm text-text-secondary">{order.notes}</p>
            </Card>
          )}

          <Card>
            <h2 className="mb-3 text-lg font-semibold text-foreground">History</h2>
            <ol className="space-y-2 text-sm">
              {order.statusHistory.map((h) => (
                <li key={h.id} className="flex justify-between gap-2">
                  <span className="capitalize text-text-secondary">
                    {h.status.toLowerCase()}
                    {h.note && ` — ${h.note}`}
                  </span>
                  <span className="shrink-0 text-text-muted">
                    {h.createdAt.toLocaleDateString("en-GB")}
                  </span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
