import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Truck, MessageCircle, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import { getT, localized } from "@/i18n/server";

export const dynamic = "force-dynamic";

async function getData() {
  const [featured, categories] = await Promise.all([
    prisma.product.findMany({
      where: { status: "PUBLISHED", featured: true },
      include: { category: { select: { name: true } } },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: "asc" },
      include: {
        _count: { select: { products: { where: { status: "PUBLISHED" } } } },
      },
    }),
  ]);
  return { featured, categories };
}

export default async function LandingPage() {
  const { featured, categories } = await getData();
  const { t, locale } = await getT();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary-dark">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-20 sm:py-28">
          <span className="rounded-badge bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/80">
            {t("home.trust.authentic")} • {t("home.trust.cod")}
          </span>
          <h1 className="max-w-2xl font-display text-4xl font-bold uppercase leading-none text-white sm:text-6xl">
            {t("home.hero.title")}
          </h1>
          <p className="max-w-lg text-lg text-white/80">
            {t("home.hero.subtitle")}
          </p>
          <Link href="/shop">
            <Button variant="accent" size="lg">
              {t("home.hero.cta")} <ArrowRight className="size-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-semibold uppercase text-foreground">
          {t("home.popular")}
        </h2>
        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No featured products yet.</p>
        )}
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-semibold uppercase text-foreground">
          {t("home.browseBySport")}
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="group relative flex aspect-video items-end overflow-hidden rounded-card bg-muted"
            >
              {c.image && (
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="relative p-4">
                <p className="font-display text-xl font-bold uppercase text-white">
                  {localized(c, "name", "nameBn", locale)}
                </p>
                <p className="text-sm text-white/70">
                  {c._count.products} jerseys
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 text-center sm:grid-cols-3">
          {[
            { icon: ShieldCheck, label: t("home.trust.authentic") },
            { icon: Truck, label: t("home.trust.cod") },
            { icon: MessageCircle, label: t("home.trust.support") },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <Icon className="size-8 text-primary" />
              <p className="font-medium text-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
