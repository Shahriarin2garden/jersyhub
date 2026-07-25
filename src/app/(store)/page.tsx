import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  MessageCircle,
  ArrowRight,
  Timer,
  Shirt,
  Ticket,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/store/product-card";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { getT, localized } from "@/i18n/server";

export const dynamic = "force-dynamic";

async function getData() {
  const [featured, categories, reviews] = await Promise.all([
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
    // Social proof: approved reviews only, best first.
    prisma.review.findMany({
      where: { status: "APPROVED", rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        customer: { select: { name: true } },
        product: { select: { name: true, nameBn: true, slug: true } },
      },
    }),
  ]);
  return { featured, categories, reviews };
}

export default async function LandingPage() {
  const { featured, categories, reviews } = await getData();
  const { t, locale } = await getT();

  const trust = [
    {
      icon: ShieldCheck,
      label: t("home.trust.authentic"),
      note: t("home.trust.authenticNote"),
    },
    { icon: Truck, label: t("home.trust.cod"), note: t("home.trust.codNote") },
    {
      icon: Timer,
      label: t("home.trust.delivery"),
      note: t("home.trust.deliveryNote"),
    },
    {
      icon: MessageCircle,
      label: t("home.trust.support"),
      note: t("home.trust.supportNote"),
    },
  ];

  return (
    <div>
      {/* ---------------------------------------------------------------- *
       * 1. Hero — one primary CTA (Shop now), one secondary (categories)
       * ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-primary-dark">
        {/* Decorative block field. Flat shapes, no motion, aria-hidden. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-30"
        >
          <div className="absolute -right-16 -top-16 size-72 rounded-full bg-accent/25" />
          <div className="absolute right-40 top-32 size-40 rounded-card bg-secondary/50" />
          <div className="absolute -bottom-20 left-1/3 size-56 rounded-full bg-accent/30" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div className="reveal flex flex-col items-start gap-5">
            <span className="rounded-badge bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/85">
              {t("home.hero.badge")}
            </span>

            <h1 className="max-w-2xl font-display text-5xl font-bold uppercase leading-[0.95] text-white sm:text-7xl">
              {t("home.hero.title")}
            </h1>

            <p className="max-w-lg text-lg leading-relaxed text-white/80">
              {t("home.hero.subtitle")}
            </p>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/shop" className="sm:w-auto">
                <Button variant="accent" size="lg" fullWidth>
                  {t("home.hero.cta")} <ArrowRight className="size-5" />
                </Button>
              </Link>
              <Link href="#categories" className="sm:w-auto">
                <Button
                  size="lg"
                  fullWidth
                  className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  {t("home.hero.secondaryCta")}
                </Button>
              </Link>
            </div>
          </div>

          {/* Product peek. Real featured images when they exist, so the hero
              shows merchandise rather than stock art. */}
          <div className="reveal reveal-delay-2 hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {featured.slice(0, 2).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/shop/${p.slug}`}
                  className={`group relative aspect-4/5 overflow-hidden rounded-card bg-white/10 ${
                    i === 1 ? "mt-10" : ""
                  }`}
                >
                  {p.images[0] ? (
                    <Image
                      src={p.images[0]}
                      alt={localized(p, "name", "nameBn", locale)}
                      fill
                      priority={i === 0}
                      sizes="(max-width: 1024px) 0px, 22vw"
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <Shirt className="size-12 text-white/40" />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * 2. Trust strip — concrete promises, icon + label + detail
       * ---------------------------------------------------------------- */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 sm:grid-cols-4 sm:py-10">
          {trust.map(({ icon: Icon, label, note }) => (
            <div key={label} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-button bg-primary-light">
                <Icon className="size-5 text-primary" />
              </span>
              <div>
                <p className="font-semibold leading-tight text-foreground">
                  {label}
                </p>
                <p className="text-sm leading-snug text-text-muted">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * 3. Categories
       * ---------------------------------------------------------------- */}
      <section id="categories" className="mx-auto max-w-7xl px-4 py-12 sm:py-20">
        <h2 className="mb-6 text-2xl font-semibold uppercase text-foreground sm:text-3xl">
          {t("home.browseBySport")}
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className={`reveal reveal-delay-${Math.min(i + 1, 4)} group relative flex aspect-video items-end overflow-hidden rounded-card bg-primary-dark`}
            >
              {c.image && (
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover opacity-80 transition-transform duration-200 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="relative p-4">
                <p className="font-display text-xl font-bold uppercase text-white">
                  {localized(c, "name", "nameBn", locale)}
                </p>
                <p className="text-sm text-white/75">
                  {c._count.products} {t("home.jerseyCount")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * 4. Featured products — the commercial payload
       * ---------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:pb-20">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold uppercase text-foreground sm:text-3xl">
            {t("home.popular")}
          </h2>
          <Link
            href="/shop"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            {t("home.viewAll")} <ArrowRight className="size-4" />
          </Link>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="text-text-muted">No featured products yet.</p>
        )}
      </section>

      {/* ---------------------------------------------------------------- *
       * 5. Promo slab — flat block, no elevation against solid color
       * ---------------------------------------------------------------- */}
      <section className="bg-accent">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-12 sm:flex-row sm:items-center sm:justify-between sm:py-16">
          <div className="flex items-start gap-4">
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-button bg-primary-dark/15 sm:flex">
              <Ticket className="size-6 text-primary-dark" />
            </span>
            <div>
              <h2 className="font-display text-3xl font-bold uppercase leading-tight text-primary-dark sm:text-4xl">
                {t("home.promo.title")}
              </h2>
              <p className="mt-1 max-w-md text-primary-dark/80">
                {t("home.promo.subtitle")}
              </p>
            </div>
          </div>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button
              size="lg"
              fullWidth
              className="bg-primary-dark text-white hover:bg-primary"
            >
              {t("home.promo.cta")} <ArrowRight className="size-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ---------------------------------------------------------------- *
       * 6. Social proof — sits immediately before the closing ask
       * ---------------------------------------------------------------- */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20">
          <h2 className="mb-6 text-2xl font-semibold uppercase text-foreground sm:text-3xl">
            {t("home.reviews.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <figure
                key={r.id}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)} flex flex-col gap-3 rounded-card border border-border bg-card p-5`}
              >
                <StarRating value={r.rating} />
                <blockquote className="flex-1 leading-relaxed text-text-secondary">
                  {r.title ? <strong className="text-foreground">{r.title}. </strong> : null}
                  {r.comment}
                </blockquote>
                <figcaption className="text-sm text-text-muted">
                  <span className="font-medium text-foreground">
                    {r.customer.name}
                  </span>
                  {" — "}
                  <Link
                    href={`/shop/${r.product.slug}`}
                    className="hover:text-primary hover:underline"
                  >
                    {localized(r.product, "name", "nameBn", locale)}
                  </Link>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- *
       * 7. Closing CTA — repeats the hero action after the full scroll
       * ---------------------------------------------------------------- */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-14 text-center sm:py-20">
          <h2 className="font-display text-3xl font-bold uppercase leading-tight text-foreground sm:text-5xl">
            {t("home.closing.title")}
          </h2>
          <p className="text-lg text-text-secondary">
            {t("home.closing.subtitle")}
          </p>
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="accent" size="lg" fullWidth>
              {t("home.hero.cta")} <ArrowRight className="size-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
