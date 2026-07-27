import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Banknote,
  Eye,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatCard } from "@/components/admin/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [totalOrders, pending, delivered, revenue, recent] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "DELIVERED" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true } },
        _count: { select: { items: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total orders" value={totalOrders} icon={ShoppingBag} />
        <StatCard label="Pending" value={pending} icon={Clock} tone="amber" />
        <StatCard label="Delivered" value={delivered} icon={CheckCircle2} tone="green" />
        <StatCard
          label="Revenue"
          value={formatPrice(revenue._sum.total ?? 0)}
          icon={Banknote}
          tone="green"
        />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-foreground">Recent orders</h2>
        {recent.length > 0 ? (
          <Table>
            <THead>
              <TR>
                <TH>Order #</TH>
                <TH>Customer</TH>
                <TH className="hidden sm:table-cell">Items</TH>
                <TH>Total</TH>
                <TH>Status</TH>
                <TH className="hidden md:table-cell">Date</TH>
                <TH></TH>
              </TR>
            </THead>
            <tbody>
              {recent.map((o) => (
                <TR key={o.id}>
                  <TD className="tabular font-medium text-foreground">
                    {o.orderNumber}
                  </TD>
                  <TD className="max-w-36 truncate sm:max-w-none">{o.customer.name}</TD>
                  <TD className="hidden sm:table-cell tabular">{o._count.items}</TD>
                  <TD className="tabular">{formatPrice(o.total)}</TD>
                  <TD><StatusBadge status={o.status} /></TD>
                  <TD className="hidden md:table-cell text-text-muted">
                    {o.createdAt.toLocaleDateString("en-GB")}
                  </TD>
                  <TD>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex min-h-11 items-center gap-1 text-ink hover:underline"
                    >
                      <Eye className="size-4" /> View
                    </Link>
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState title="No orders yet" description="Orders will appear here." />
        )}
      </div>
    </div>
  );
}
