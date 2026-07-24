import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { createOrderSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import { calcDeliveryFee } from "@/lib/constants";
import { evaluateCoupon } from "@/lib/coupon";
import { sendEmail, orderPlacedEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const { customer, items, paymentMethod, bkashTxnId, couponCode, notes } =
    parsed.data;

  // Look the coupon up outside the transaction — it is re-checked against the
  // authoritative subtotal inside, but the network round-trip stays out of the
  // transaction budget.
  const couponRow = couponCode?.trim()
    ? await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      })
    : null;

  try {
    const order = await prisma.$transaction(async (tx) => {
      // Load variants + product prices for the requested items.
      const variantIds = items.map((i) => i.variantId);
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: { select: { id: true, price: true, name: true } } },
      });
      const byId = new Map(variants.map((v) => [v.id, v]));

      let subtotal = 0;
      const orderItems = items.map((i) => {
        const v = byId.get(i.variantId);
        if (!v) throw new OrderError(`Item no longer available`);
        if (v.stock < i.quantity)
          throw new OrderError(`Not enough stock for ${v.product.name} (${v.size})`);
        const unitPrice = v.product.price;
        const totalPrice = unitPrice * i.quantity;
        subtotal += totalPrice;
        return {
          productId: v.product.id,
          variantId: v.id,
          quantity: i.quantity,
          unitPrice,
          totalPrice,
        };
      });

      const deliveryFee = calcDeliveryFee(subtotal);

      // Coupon (re-validated server-side).
      let discount = 0;
      let couponId: string | null = null;
      let appliedCode: string | null = null;
      if (couponCode?.trim()) {
        const result = evaluateCoupon(couponRow, subtotal);
        if (!result.ok) throw new OrderError(result.error);
        discount = result.discount;
        couponId = result.coupon.id;
        appliedCode = result.coupon.code;
        await tx.coupon.update({
          where: { id: result.coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      // Find or create customer by phone.
      const cust = await tx.customer.upsert({
        where: { phone: customer.phone },
        update: {
          name: customer.name,
          email: customer.email || null,
          division: customer.division,
          district: customer.district,
          address: customer.address,
        },
        create: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || null,
          division: customer.division,
          district: customer.district,
          address: customer.address,
        },
      });

      // Deduct stock.
      for (const i of items) {
        await tx.productVariant.update({
          where: { id: i.variantId },
          data: { stock: { decrement: i.quantity } },
        });
      }

      // Create order with a unique number (retry on collision).
      for (let attempt = 0; attempt < 5; attempt++) {
        const orderNumber = generateOrderNumber();
        try {
          return await tx.order.create({
            data: {
              orderNumber,
              customerId: cust.id,
              status: "PENDING",
              paymentMethod,
              paymentStatus: "UNPAID",
              bkashTxnId: paymentMethod === "BKASH" ? bkashTxnId : null,
              subtotal,
              discount,
              couponId,
              couponCode: appliedCode,
              deliveryFee,
              total: subtotal - discount + deliveryFee,
              notes: notes || null,
              items: { create: orderItems },
              statusHistory: { create: [{ status: "PENDING", note: "Order placed" }] },
            },
            select: { orderNumber: true },
          });
        } catch (e) {
          if (
            e instanceof Prisma.PrismaClientKnownRequestError &&
            e.code === "P2002"
          )
            continue; // order number collision, retry
          throw e;
        }
      }
      throw new OrderError("Could not generate order number");
    },
    // Neon free tier adds latency per round-trip; the default 5s budget is not
    // enough for the read + stock updates + order insert on a multi-item cart.
    { timeout: 20_000, maxWait: 10_000 });

    // Fire order-confirmation email (best-effort).
    if (customer.email) {
      const full = await prisma.order.findUnique({
        where: { orderNumber: order.orderNumber },
        select: { total: true },
      });
      await sendEmail({
        to: customer.email,
        subject: `Order ${order.orderNumber} received — JersyHub`,
        html: orderPlacedEmail(
          order.orderNumber,
          customer.name,
          `৳${(full?.total ?? 0).toLocaleString("en-BD")}`,
        ),
      }).catch(() => {});
    }

    return ok({ orderNumber: order.orderNumber }, 201);
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409);
    console.error("Order creation failed", e);
    return fail("Could not place order", 500);
  }
}

class OrderError extends Error {}
