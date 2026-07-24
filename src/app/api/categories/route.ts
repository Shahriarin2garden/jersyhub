import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      },
    });
    return ok(categories);
  } catch {
    return fail("Failed to load categories", 500);
  }
}
