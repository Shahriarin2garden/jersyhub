import type { NextRequest } from "next/server";
import type { Prisma, ProductStatus, Size } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok, paginated, fail, fromZod, getPage } from "@/lib/api";
import { requireAdmin } from "@/lib/guard";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { revalidateCatalogue } from "@/lib/cached";

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);
  const sp = req.nextUrl.searchParams;
  const { page, limit, skip } = getPage(sp, 20);

  const where: Prisma.ProductWhereInput = {};
  const status = sp.get("status");
  if (status === "PUBLISHED" || status === "DRAFT")
    where.status = status as ProductStatus;
  const search = sp.get("search")?.trim();
  if (search) where.name = { contains: search, mode: "insensitive" };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        category: { select: { name: true } },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);
  return paginated(products, { page, limit, total });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return fail("Unauthorized", 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON", 400);
  }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return fromZod(parsed.error);
  const d = parsed.data;

  // Unique slug.
  const base = slugify(d.name);
  let slug = base;
  for (let i = 2; await prisma.product.findUnique({ where: { slug } }); i++) {
    slug = `${base}-${i}`;
  }

  const product = await prisma.product.create({
    data: {
      name: d.name,
      nameBn: d.nameBn || null,
      slug,
      description: d.description || null,
      descriptionBn: d.descriptionBn || null,
      price: d.price,
      compareAtPrice: d.compareAtPrice ?? null,
      categoryId: d.categoryId,
      images: d.images,
      status: d.status,
      featured: d.featured,
      variants: {
        create: d.variants.map((v) => ({ size: v.size as Size, stock: v.stock })),
      },
    },
    include: { variants: true },
  });
  revalidateCatalogue();
  return ok(product, 201);
}
