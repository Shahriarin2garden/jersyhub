import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  MessageCircle,
  ArrowRight,
  ArrowUpRight,
  Timer,
  Ticket,
  Check,
  Star,
  Quote,
  ShoppingBag,
} from "lucide-react";
import {
  getFeaturedProducts,
  getLandingCategories,
  getLandingReviews,
} from "@/lib/cached";
import { ProductCard } from "@/components/store/product-card";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { MeshBackdrop } from "@/components/ui/mesh-backdrop";
import { getT, localized } from "@/i18n/server";
import type { TranslationKey } from "@/i18n/dictionaries";

export const dynamic = "force-dynamic";

// All three reads are cached (see lib/cached.ts) — the landing page is the most
// visited route and none of this data changes per visitor.
async function getData() {
  const [featured, categories, reviews] = await Promise.all([
    getFeaturedProducts(),
    getLandingCategories(),
    getLandingReviews(),
  ]);
  return { featured, categories, reviews };
}

/** Contrast-safe tone sets for the category bento — ink / cream / gold / ink. */
const CATEGORY_TONES = [
  { bg: "bg-primary-dark text-white", meta: "text-white/55", arrow: "text-accent", line: "bg-accent" },
  { bg: "bg-card text-foreground border border-border", meta: "text-text-muted", arrow: "text-accent-dark", line: "bg-accent" },
  { bg: "bg-accent text-ink-dark", meta: "text-ink-dark/70", arrow: "text-ink-dark", line: "bg-primary-dark/60" },
  { bg: "bg-primary text-white", meta: "text-white/55", arrow: "text-accent", line: "bg-accent" },
] as const;

/** Stagger step for a grid child, capped at the last `.reveal-delay-*` class in
 *  globals.css so a long grid never leaves late items visibly waiting. These are
 *  plain CSS classes, not Tailwind utilities, so composing the name is safe. */
function revealStep(index: number) {
  return Math.min(index + 1, 6);
}

/** Eyebrow: gold hairline + spaced uppercase label. The luxury section tag. */
function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`h-px w-8 ${tone === "light" ? "bg-accent/70" : "bg-accent"}`} />
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">
        {children}
      </span>
    </span>
  );
}

export default async function LandingPage() {
  const { featured, categories, reviews } = await getData();
  const { t, locale } = await getT();

  const tr = (k: TranslationKey) => t(k);

  const trust = [
    { icon: ShieldCheck, label: tr("home.trust.authentic"), note: tr("home.trust.authenticNote") },
    { icon: Truck, label: tr("home.trust.cod"), note: tr("home.trust.codNote") },
    { icon: Timer, label: tr("home.trust.delivery"), note: tr("home.trust.deliveryNote") },
    { icon: MessageCircle, label: tr("home.trust.support"), note: tr("home.trust.supportNote") },
  ];

  const heroChips = [
    tr("home.trust.authentic"),
    tr("home.trust.cod"),
    tr("home.trust.delivery"),
  ];

  return (
    <div>
      {/* ================================================================ *
       * 1. HERO — dark stage, gold accents, one primary + one secondary CTA
       * ================================================================ */}
      <section className="relative overflow-hidden bg-primary-dark">
        {/* Gold top hairline — the luxury frame. */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
        {/* Haikei-style gold blobs — static depth, no motion. */}
        <MeshBackdrop />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
          {/* Hero copy enters top-down, one short step per line, so the eye is
              led from the label to the headline to the CTA. */}
          <div className="flex flex-col items-start gap-6">
            <div className="reveal">
              <Eyebrow>{tr("home.eyebrow.hero")}</Eyebrow>
            </div>

            <h1 className="reveal reveal-delay-1 max-w-2xl font-display text-5xl font-bold leading-[1.03] tracking-tight text-white sm:text-7xl">
              {tr("home.hero.title")}
            </h1>

            <p className="reveal reveal-delay-2 max-w-lg text-lg leading-relaxed text-white/75">
              {tr("home.hero.subtitle")}
            </p>

            <div className="reveal reveal-delay-3 flex w-full flex-col gap-3 pt-1 sm:w-auto sm:flex-row">
              <Link href="/shop" className="group sm:w-auto">
                <Button variant="accent" size="lg" fullWidth>
                  {tr("home.hero.cta")}
                  {/* The arrow leans toward the destination on hover. */}
                  <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#categories" className="sm:w-auto">
                <Button
                  size="lg"
                  fullWidth
                  className="border border-white/25 bg-white/5 text-white hover:bg-white/15"
                >
                  {tr("home.hero.secondaryCta")}
                </Button>
              </Link>
            </div>

            {/* Above-the-fold trust chips — reinforce the promise instantly. */}
            <ul className="reveal reveal-delay-4 flex flex-wrap gap-x-5 gap-y-2 pt-2">
              {heroChips.map((c) => (
                <li key={c} className="flex items-center gap-1.5 text-sm text-white/70">
                  <Check className="size-4 text-accent" /> {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Single gold-framed merchandise image with floating chips — one
              photo only, so the shared seed art never repeats side by side. */}
          <div className="reveal reveal-delay-5 relative mx-auto hidden aspect-4/5 w-72 lg:block">
            <div className="relative size-full overflow-hidden rounded-card shadow-xl ring-2 ring-accent/60">
              {featured[0]?.images[0] ? (
                <Image
                  src={featured[0].images[0]}
                  alt={localized(featured[0], "name", "nameBn", locale)}
                  fill
                  priority
                  sizes="288px"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-white/5">
                  <ShoppingBag className="size-12 text-white/40" />
                </div>
              )}
            </div>
            {/* Floating rating chip. */}
            <div className="absolute -left-5 bottom-8 inline-flex items-center gap-1.5 rounded-badge bg-card px-3 py-1.5 shadow-lg">
              <Star className="size-4 fill-rating text-rating" />
              <span className="tabular text-sm font-semibold text-foreground">4.9</span>
              <span className="text-xs text-text-muted">/ 5</span>
            </div>
            {/* Floating delivery card — gold, balances the composition. */}
            <div className="absolute -right-5 top-8 max-w-40 rounded-card bg-accent px-3.5 py-2.5 shadow-lg">
              <Truck className="size-5 text-ink-dark" />
              <p className="mt-1 text-sm font-semibold leading-tight text-ink-dark">
                {tr("home.trust.delivery")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ *
       * 2. TRUST STRIP — concrete promises, icon + label + detail
       * ================================================================ */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-7 px-4 py-9 sm:grid-cols-4 sm:divide-x sm:divide-border sm:gap-0">
          {trust.map(({ icon: Icon, label, note }) => (
            <div key={label} className="flex items-start gap-3 sm:px-6 sm:first:pl-0">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent-light">
                <Icon className="size-5 text-accent-dark" />
              </span>
              <div>
                <p className="font-semibold leading-tight text-foreground">{label}</p>
                <p className="mt-0.5 text-sm leading-snug text-text-muted">{note}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================ *
       * 3. CATEGORIES — editorial imageless tiles (robust, always visible)
       * ================================================================ */}
      {/* scroll-mt clears the sticky navbar when the hero's anchor link lands here. */}
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-14 sm:py-20">
        <div className="mb-8 flex flex-col gap-3">
          <Eyebrow>{tr("home.eyebrow.categories")}</Eyebrow>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {tr("home.browseBySport")}
            </h2>
            <Link
              href="/shop"
              className="hidden shrink-0 items-center gap-1 text-sm font-medium text-ink hover:text-accent-dark sm:flex"
            >
              {tr("home.viewAll")} <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="text-text-secondary">{tr("home.categories.subtitle")}</p>
        </div>

        {/* Alternating solid-fill bento — ink / cream / gold blocks. No image
            dependency (seed art is a single shared photo), so tiles are always
            full and on-brand. Each tone carries its own contrast-safe subclasses. */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.map((c, i) => {
            const tone = CATEGORY_TONES[i % CATEGORY_TONES.length];
            return (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                className={`reveal reveal-delay-${revealStep(i)} group relative flex h-full min-h-40 flex-col justify-between overflow-hidden rounded-card p-5 transition-transform duration-200 hover:-translate-y-1 sm:min-h-52 ${tone.bg}`}
              >
                <div className="flex items-start justify-between">
                  <span className={`tabular text-xs font-semibold tracking-[0.2em] ${tone.meta}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <ArrowUpRight
                    className={`size-5 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 ${tone.arrow}`}
                  />
                </div>
                <div>
                  <span className={`mb-2.5 block h-px w-8 ${tone.line}`} />
                  <p className="font-display text-2xl font-semibold leading-tight sm:text-3xl">
                    {localized(c, "name", "nameBn", locale)}
                  </p>
                  <p className={`mt-1 text-sm ${tone.meta}`}>
                    {c._count.products} {tr("home.jerseyCount")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================================ *
       * 4. FEATURED PRODUCTS — the commercial payload
       * ================================================================ */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:pb-20">
        <div className="mb-8 flex flex-col gap-3">
          <Eyebrow>{tr("home.eyebrow.featured")}</Eyebrow>
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {tr("home.popular")}
            </h2>
            <Link
              href="/shop"
              className="flex shrink-0 items-center gap-1 text-sm font-medium text-ink hover:text-accent-dark"
            >
              {tr("home.viewAll")} <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p, i) => (
              <div key={p.id} className={`reveal reveal-delay-${revealStep(i)}`}>
                <ProductCard product={p} locale={locale} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-card border border-dashed border-border bg-card p-10 text-center">
            <ShoppingBag className="mx-auto size-8 text-text-muted" />
            <p className="mt-3 text-text-secondary">{tr("shop.empty")}</p>
          </div>
        )}
      </section>

      {/* ================================================================ *
       * 5. PROMO — gold slab, flat, dark ink text and CTA
       * ================================================================ */}
      <section className="relative overflow-hidden bg-accent">
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute -right-16 -top-16 size-64 rounded-full border-[2.5rem] border-primary-dark" />
          <div className="absolute -bottom-24 -left-10 size-56 rounded-full border-[2.5rem] border-primary-dark" />
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between sm:py-16">
          <div className="flex items-start gap-4">
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-full bg-primary-dark/15 sm:flex">
              <Ticket className="size-6 text-ink-dark" />
            </span>
            <div>
              <Eyebrow tone="light">{tr("home.eyebrow.promo")}</Eyebrow>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-ink-dark sm:text-4xl">
                {tr("home.promo.title")}
              </h2>
              <p className="mt-1.5 max-w-md text-ink-dark/80">
                {tr("home.promo.subtitle")}
              </p>
            </div>
          </div>
          <Link href="/shop" className="group w-full sm:w-auto">
            <Button size="lg" fullWidth className="bg-primary-dark text-white hover:bg-primary">
              {tr("home.promo.cta")}
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ================================================================ *
       * 6. SOCIAL PROOF — approved reviews, placed just before the ask
       * ================================================================ */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <div className="mb-8 flex flex-col gap-3">
            <Eyebrow>{tr("home.eyebrow.reviews")}</Eyebrow>
            <h2 className="font-display text-3xl font-semibold text-foreground sm:text-4xl">
              {tr("home.reviews.title")}
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <figure
                key={r.id}
                className={`reveal reveal-delay-${revealStep(i)} relative flex flex-col gap-3 overflow-hidden rounded-card border border-border bg-card p-6`}
              >
                <Quote aria-hidden className="absolute -right-1 -top-1 size-14 text-accent/10" />
                <StarRating value={r.rating} />
                <blockquote className="relative flex-1 leading-relaxed text-text-secondary">
                  {r.title ? <strong className="text-foreground">{r.title}. </strong> : null}
                  {r.comment}
                </blockquote>
                <figcaption className="flex items-center gap-2 border-t border-border pt-3 text-sm">
                  <span className="flex size-8 items-center justify-center rounded-full bg-accent-light text-xs font-semibold text-accent-dark">
                    {r.customer.name.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <span className="font-medium text-foreground">{r.customer.name}</span>
                    {" — "}
                    <Link
                      href={`/shop/${r.product.slug}`}
                      className="text-text-muted hover:text-accent-dark hover:underline"
                    >
                      {localized(r.product, "name", "nameBn", locale)}
                    </Link>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ================================================================ *
       * 7. CLOSING CTA — dark bookend that mirrors the hero
       * ================================================================ */}
      {/* Hairlines top AND bottom close the page off as a deliberate slab —
          the hero opens with one rule, this bookend is framed by two. */}
      <section className="relative overflow-hidden bg-primary-dark">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        {/* Jersey pinstripes, then a floodlight pooled on the CTA. Flat CSS
            gradients — no blobs here, so the hero keeps that motif to itself. */}
        <div aria-hidden className="kit-stripes pointer-events-none absolute inset-0" />
        <div aria-hidden className="floodlight pointer-events-none absolute inset-0" />
        <div className="reveal relative mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-16 text-center sm:py-24">
          <Eyebrow>{tr("home.closing.eyebrow")}</Eyebrow>
          <h2 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {tr("home.closing.title")}
          </h2>
          <p className="max-w-md text-lg text-white/75">{tr("home.closing.subtitle")}</p>
          <Link href="/shop" className="group w-full sm:w-auto">
            <Button variant="accent" size="lg" fullWidth>
              {tr("home.hero.cta")}
              <ArrowRight className="size-5 transition-transform duration-200 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
