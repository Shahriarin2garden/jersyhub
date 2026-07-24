import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import { updateOrderStatusSchema } from "@/lib/validations";
import { sendEmail, orderStatusEmail } from "@/lib/email";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true, variant: true } },
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) return fail("Order not found", 404);
  return ok(order);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const { status, note } = parsed.data;

  const existing = await prisma.order.findUnique({
    where: { id },
    include: { customer: { select: { name: true, email: true } } },
  });
  if (!existing) return fail("Order not found", 404);

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status,
      // Mark COD paid on delivery.
      ...(status === "DELIVERED" && { paymentStatus: "PAID" }),
      statusHistory: { create: [{ status, note: note || null }] },
    },
    include: { statusHistory: { orderBy: { createdAt: "desc" } } },
  });

  // Notify customer of status change (best-effort).
  if (existing.customer.email && status !== existing.status) {
    await sendEmail({
      to: existing.customer.email,
      subject: `Order ${existing.orderNumber} — ${status.toLowerCase()}`,
      html: orderStatusEmail(existing.orderNumber, existing.customer.name, status),
    }).catch(() => {});
  }

  return ok(updated);
}
