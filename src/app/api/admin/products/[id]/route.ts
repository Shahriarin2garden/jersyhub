import type { NextRequest } from "next/server";
import type { Size } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, fail, fromZod } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import { productSchema } from "@/lib/validations";

const updateSchema = productSchema.partial();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true },
  });
  if (!product) return fail("Product not found", 404);
  return ok(product);
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
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return fail("Product not found", 404);

  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id },
      data: {
        ...(d.name !== undefined && { name: d.name }),
        ...(d.description !== undefined && { description: d.description || null }),
        ...(d.price !== undefined && { price: d.price }),
        ...(d.categoryId !== undefined && { categoryId: d.categoryId }),
        ...(d.images !== undefined && { images: d.images }),
        ...(d.status !== undefined && { status: d.status }),
        ...(d.featured !== undefined && { featured: d.featured }),
      },
    });

    if (d.variants) {
      const keepSizes = d.variants.map((v) => v.size as Size);
      // Upsert incoming sizes.
      for (const v of d.variants) {
        await tx.productVariant.upsert({
          where: { productId_size: { productId: id, size: v.size as Size } },
          update: { stock: v.stock },
          create: { productId: id, size: v.size as Size, stock: v.stock },
        });
      }
      // Remove sizes no longer present, only if unreferenced by orders.
      const removable = await tx.productVariant.findMany({
        where: {
          productId: id,
          size: { notIn: keepSizes },
          orderItems: { none: {} },
        },
        select: { id: true },
      });
      if (removable.length) {
        await tx.productVariant.deleteMany({
          where: { id: { in: removable.map((r) => r.id) } },
        });
      }
    }
  });

  const updated = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, category: true },
  });
  return ok(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const { id } = await params;

  // Block delete if product has orders (preserve history) — soft-archive instead.
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    await prisma.product.update({ where: { id }, data: { status: "DRAFT" } });
    return fail(
      "Product has orders and cannot be deleted. It was set to Draft (hidden) instead.",
      409,
    );
  }

  await prisma.product.delete({ where: { id } });
  return ok({ id });
}
