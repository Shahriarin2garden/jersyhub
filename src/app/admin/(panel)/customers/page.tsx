import type { Prisma } from "@prisma/client";
import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { SearchBar } from "@/components/admin/search-bar";
import { CustomerDetailButton } from "@/components/admin/customer-detail";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

const PAGE_SIZE = 20;
type SP = Promise<Record<string, string | string[] | undefined>>;
const str = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CustomersPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const search = str(sp.search);
  const page = Math.max(1, Number(str(sp.page)) || 1);

  const where: Prisma.CustomerWhereInput = {};
  if (search?.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { phone: { contains: search.trim() } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: { orders: { select: { total: true, createdAt: true, status: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.customer.count({ where }),
  ]);

  const rows = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    totalOrders: c.orders.length,
    totalSpent: c.orders
      .filter((o) => o.status !== "CANCELLED")
      .reduce((s, o) => s + o.total, 0),
    lastOrder: c.orders.reduce<Date | null>(
      (l, o) => (!l || o.createdAt > l ? o.createdAt : l),
      null,
    ),
  }));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Customers</h1>
      <SearchBar basePath="/admin/customers" placeholder="Search name or phone…" />

      {rows.length > 0 ? (
        <>
          <Table>
            <THead>
              <TR>
                <TH>Name</TH>
                <TH>Phone</TH>
                <TH className="hidden md:table-cell">Email</TH>
                <TH>Orders</TH>
                <TH>Spent</TH>
                <TH className="hidden lg:table-cell">Last order</TH>
                <TH></TH>
              </TR>
            </THead>
            <tbody>
              {rows.map((c) => (
                <TR key={c.id}>
                  <TD className="font-medium text-foreground">{c.name}</TD>
                  <TD className="tabular">{c.phone}</TD>
                  <TD className="hidden md:table-cell text-text-muted">
                    {c.email ?? "—"}
                  </TD>
                  <TD className="tabular">{c.totalOrders}</TD>
                  <TD className="tabular">{formatPrice(c.totalSpent)}</TD>
                  <TD className="hidden lg:table-cell text-text-muted">
                    {c.lastOrder ? c.lastOrder.toLocaleDateString("en-GB") : "—"}
                  </TD>
                  <TD>
                    <CustomerDetailButton customerId={c.id} />
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
          <Pagination
            page={page}
            totalPages={totalPages}
            basePath="/admin/customers"
            params={{ search }}
          />
        </>
      ) : (
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Customers appear after their first order."
        />
      )}
    </div>
  );
}
