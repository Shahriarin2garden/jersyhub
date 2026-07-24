import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { category: true, variants: true },
  });
  if (!product) return fail("Product not found", 404);
  return ok(product);
}
