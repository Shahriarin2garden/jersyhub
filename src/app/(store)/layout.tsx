import { Providers } from "@/components/providers";
import { Navbar } from "@/components/store/navbar";
import { Footer } from "@/components/store/footer";
import { getLocale } from "@/i18n/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getNavCategories } from "@/lib/cached";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, session] = await Promise.all([getLocale(), auth()]);
  const isCustomer = session?.user?.role === "customer";

  const [categories, wishlist] = await Promise.all([
    getNavCategories(),
    isCustomer
      ? prisma.wishlistItem.findMany({
          where: { customerId: session!.user.id },
          select: { productId: true },
        })
      : Promise.resolve([]),
  ]);

  return (
    <Providers
      locale={locale}
      loggedIn={isCustomer}
      wishlistIds={wishlist.map((w) => w.productId)}
    >
      <Navbar
        loggedIn={isCustomer}
        userName={isCustomer ? session?.user?.name ?? null : null}
        categories={categories}
      />
      <main className="flex-1">{children}</main>
      <Footer />
    </Providers>
  );
}
