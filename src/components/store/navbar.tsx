"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Heart, User, Search } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useI18n, LocaleToggle } from "@/components/i18n-provider";
import { BrandLogo } from "@/components/brand-logo";

type Category = { slug: string; name: string; nameBn: string | null };

export function Navbar({
  loggedIn,
  userName,
  categories,
}: {
  loggedIn: boolean;
  userName: string | null;
  categories: Category[];
}) {
  const { count, hydrated } = useCart();
  const { t, locale } = useI18n();
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [searchOpen, setSearchOpen] = React.useState(false);

  const catLabel = (c: Category) =>
    locale === "bn" && c.nameBn ? c.nameBn : c.name;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    setSearchOpen(false);
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  };

  // One field, rendered twice: inline on desktop, as its own row on mobile.
  // Search is a primary path into the catalogue, so it can't be desktop-only.
  const search = (
    <>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t("nav.search")}
        className="h-11 w-full rounded-button border border-border bg-background pl-9 pr-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ink"
      />
    </>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4">
        <BrandLogo size={48} priority />

        {/* Search (desktop — inline between logo and actions) */}
        <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
          {search}
        </form>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <LocaleToggle />
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            aria-label={t("nav.search")}
            aria-expanded={searchOpen}
            className="flex size-11 items-center justify-center rounded-button hover:bg-muted md:hidden"
          >
            <Search className="size-5 text-foreground" />
          </button>
          <Link
            href="/shop"
            className="hidden px-3 text-base font-medium text-text-secondary hover:text-ink sm:block"
          >
            {t("nav.shop")}
          </Link>
          <Link
            href="/account/wishlist"
            aria-label={t("nav.wishlist")}
            className="flex size-10 items-center justify-center rounded-button hover:bg-muted"
          >
            <Heart className="size-5 text-foreground" />
          </Link>
          <Link
            href={loggedIn ? "/account" : "/account/login"}
            aria-label={t("nav.account")}
            className="flex items-center gap-1.5 rounded-button px-2 py-2 hover:bg-muted"
          >
            <User className="size-5 text-foreground" />
            <span className="hidden max-w-24 truncate text-sm text-foreground lg:inline">
              {loggedIn ? userName : t("nav.login")}
            </span>
          </Link>
          <Link
            href="/cart"
            aria-label={t("nav.cart")}
            className="relative flex size-10 items-center justify-center rounded-button hover:bg-muted"
          >
            <ShoppingCart className="size-5 text-foreground" />
            {hydrated && count > 0 && (
              <span className="tabular absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-semibold text-primary-dark">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>

      {/* Search (mobile) — collapsed behind a toggle so the sticky header stays
          short on a phone; expanded it takes its own full-width row. */}
      {searchOpen && (
        <form onSubmit={submitSearch} className="relative border-t border-border px-4 py-2 md:hidden">
          {search}
        </form>
      )}

      {/* Category strip — scrolls sideways in its own container, so the page
          body never gains a horizontal scrollbar. */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-3 text-sm">
          <Link
            href="/shop"
            className="flex min-h-11 shrink-0 items-center whitespace-nowrap px-2 font-medium text-text-secondary hover:text-ink"
          >
            {t("nav.shop")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="flex min-h-11 shrink-0 items-center whitespace-nowrap px-2 text-text-secondary hover:text-ink"
            >
              {catLabel(c)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
