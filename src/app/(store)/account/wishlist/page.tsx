import Link from "next/link";
import { Heart } from "lucide-react";
import { requireCustomer } from "@/lib/guard";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/i18n/server";
import { ProductCard } from "@/components/store/product-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata = { title: "My wishlist" };

export default async function WishlistPage() {
  const session = await requireCustomer();
  const locale = await getLocale();

  const items = await prisma.wishlistItem.findMany({
    where: { customerId: session!.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: { include: { category: { select: { name: true } } } },
    },
  });

  const published = items.filter((i) => i.product.status === "PUBLISHED");

  if (published.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Tap the heart on any jersey to save it here."
        action={
          <Link href="/shop">
            <Button>Browse jerseys</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-foreground">My wishlist</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {published.map((i) => (
          <ProductCard key={i.id} product={i.product} locale={locale} />
        ))}
      </div>
    </div>
  );
}
