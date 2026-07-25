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

  const catLabel = (c: Category) =>
    locale === "bn" && c.nameBn ? c.nameBn : c.name;

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    router.push(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <BrandLogo size={48} priority />

        {/* Search (desktop) */}
        <form onSubmit={submitSearch} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("nav.search")}
            className="h-10 w-full rounded-button border border-border bg-background pl-9 pr-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </form>

        <nav className="ml-auto flex items-center gap-1">
          <LocaleToggle />
          <Link
            href="/shop"
            className="hidden px-3 text-base font-medium text-text-secondary hover:text-primary sm:block"
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

      {/* Category strip */}
      <div className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-x-auto px-4 py-2 text-sm">
          <Link href="/shop" className="whitespace-nowrap font-medium text-text-secondary hover:text-primary">
            {t("nav.shop")}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="whitespace-nowrap text-text-secondary hover:text-primary"
            >
              {catLabel(c)}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
