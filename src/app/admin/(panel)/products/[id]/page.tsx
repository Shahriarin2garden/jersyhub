import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";
import { SIZES } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit product" };

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { variants: true } }),
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();

  const variants = [...product.variants]
    .sort((a, b) => SIZES.indexOf(a.size) - SIZES.indexOf(b.size))
    .map((v) => ({ size: v.size, stock: v.stock }));

  return (
    <div className="space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="size-4" /> Back to products
      </Link>
      <h1 className="text-2xl font-semibold text-foreground">Edit product</h1>
      <ProductForm
        categories={categories}
        productId={product.id}
        initial={{
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          images: product.images,
          status: product.status,
          featured: product.featured,
          variants,
        }}
      />
    </div>
  );
}
