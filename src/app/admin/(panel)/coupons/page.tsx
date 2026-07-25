import { Ticket } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TH, TR, TD } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { CouponForm } from "@/components/admin/coupon-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Coupons</h1>
      <CouponForm />

      {coupons.length > 0 ? (
        <Table>
          <THead>
            <TR>
              <TH>Code</TH>
              <TH>Discount</TH>
              <TH className="hidden sm:table-cell">Min order</TH>
              <TH className="hidden md:table-cell">Used</TH>
              <TH>Status</TH>
            </TR>
          </THead>
          <tbody>
            {coupons.map((c) => (
              <TR key={c.id}>
                <TD className="font-medium text-foreground">{c.code}</TD>
                <TD className="tabular">
                  {c.type === "PERCENT" ? `${c.value}%` : formatPrice(c.value)}
                  {c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ""}
                </TD>
                <TD className="hidden sm:table-cell tabular">
                  {c.minSubtotal ? formatPrice(c.minSubtotal) : "—"}
                </TD>
                <TD className="hidden md:table-cell tabular">
                  {c._count.orders}
                  {c.usageLimit ? ` / ${c.usageLimit}` : ""}
                </TD>
                <TD>
                  <Badge
                    className={
                      c.active
                        ? "bg-accent-light text-primary-dark"
                        : "bg-muted text-text-muted"
                    }
                  >
                    {c.active ? "Active" : "Inactive"}
                  </Badge>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      ) : (
        <EmptyState icon={Ticket} title="No coupons yet" description="Create one above." />
      )}
    </div>
  );
}
