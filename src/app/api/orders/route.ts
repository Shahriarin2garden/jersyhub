import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { createOrderSchema } from "@/lib/validations";
import { generateOrderNumber } from "@/lib/utils";
import { calcDeliveryFee } from "@/lib/constants";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }

  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const { customer, items, paymentMethod, bkashTxnId, notes } = parsed.data;

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
              deliveryFee,
              total: subtotal + deliveryFee,
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
    });

    return ok({ orderNumber: order.orderNumber }, 201);
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409);
    console.error("Order creation failed", e);
    return fail("Could not place order", 500);
  }
}

class OrderError extends Error {}
