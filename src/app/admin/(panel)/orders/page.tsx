import Link from "next/link";
import type { Prisma, OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { StatusBadge, PaymentBadge } from "@/components/ui/status-badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { OrderFilters } from "@/components/admin/order-filters";
import { ORDER_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

const PAGE_SIZE = 20;
type SP = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function OrdersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const status = str(sp.status);
  const search = str(sp.search);
  const page = Math.max(1, Number(str(sp.page)) || 1);

  const where: Prisma.OrderWhereInput = {};
  if (status && ORDER_STATUSES.includes(status as OrderStatus))
    where.status = status as OrderStatus;
  if (search?.trim()) {
    where.OR = [
      { orderNumber: { contains: search.trim(), mode: "insensitive" } },
      { customer: { name: { contains: search.trim(), mode: "insensitive" } } },
      { customer: { phone: { contains: search.trim() } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, phone: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.order.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
      <OrderFilters />

      {orders.length > 0 ? (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Order #</TH>
                <TH>Customer</TH>
                <TH className="hidden md:table-cell">Phone</TH>
                <TH className="hidden sm:table-cell">Items</TH>
                <TH>Total</TH>
                <TH>Status</TH>
                <TH className="hidden lg:table-cell">Payment</TH>
                <TH className="hidden md:table-cell">Date</TH>
              </TR>
            </THead>
            <tbody>
              {orders.map((o) => (
                <TR
                  key={o.id}
                  className="cursor-pointer hover:bg-muted/40"
                >
                  <TD className="tabular font-medium">
                    <Link href={`/admin/orders/${o.id}`} className="text-ink hover:underline">
                      {o.orderNumber}
                    </Link>
                  </TD>
                  <TD className="max-w-36 truncate sm:max-w-none">{o.customer.name}</TD>
                  <TD className="hidden md:table-cell tabular text-text-muted">
                    {o.customer.phone}
                  </TD>
                  <TD className="hidden sm:table-cell tabular">{o._count.items}</TD>
                  <TD className="tabular">{formatPrice(o.total)}</TD>
                  <TD><StatusBadge status={o.status} /></TD>
                  <TD className="hidden lg:table-cell">
                    <PaymentBadge status={o.paymentStatus} />
                  </TD>
                  <TD className="hidden md:table-cell text-text-muted">
                    {o.createdAt.toLocaleDateString("en-GB")}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/orders"
            params={{ status, search }}
          />
        </>
      ) : (
        <EmptyState title="No orders found" description="Try a different filter." />
      )}
    </div>
  );
}
